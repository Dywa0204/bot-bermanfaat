const { GoogleGenerativeAI, GoogleGenerativeAIResponseError } = require("@google/generative-ai");
var base64Img = require('base64-img');
const fs = require("fs");
require('dotenv').config();
const base64toFile = require('node-base64-to-file');
const { fromPath } = require('pdf2pic');
const { genLog, errLog } = require('./logging')

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

const errorMsg = [
    "⛔ Gambar yang Anda kirim tidak sesuai dengan persyaratan layanan kami\n\nSilahkan baca : https://ai.google.dev/terms",
    "⛔ Terjadi kesalahan saat melakukan pemrosesan",
    "⛔ Maaf saya tidak dapat menemukan jawaban yang tepat",
    "⛔ Terjadi kesalahan internal server"
]

const textBased = (prompt, historyChat) => new Promise(async (resolve, reject) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    genLog(`🌎 Prompt : ${prompt.slice(0, 32)}${prompt.length > 32 ? '...' : ''}`);

    try {
        const chat = model.startChat({
            history: historyChat,
            generationConfig: {
              maxOutputTokens: 1000,
            },
        });
        genLog(`⏳ Generating answer...`);
        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const text = response.text();
        
        resolve((text === "" ? errorMsg[2] : text.replace(/\*\*/g, "*")));
    } catch (error) {
        errLog(`📌 Error : ${error}\n`)
        reject(errorMsg[3]);
    }
})

const imageAndTextBased = (prompt, img, mimeType) => new Promise(async (resolve, reject) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision", generationConfig: {maxOutputTokens: 2000}});
    genLog(`🌎 Prompt : ${prompt.slice(0, 32)}${prompt.length > 32 ? '...' : ''}`);

    try {
        genLog(`⏳ Scrapping image...`);
        const imageParts = [
            fileToGenerativePart(img, mimeType)
        ];

        genLog(`⏳ Generating answer...`);
        const result = await model.generateContent([prompt, ...imageParts]);

        if (result.response && result.response.text) {
            const response = result.response;
            const text = response.text();

            resolve((text === "" ? errorMsg[2] : text.replace(/\*\*/g, "*")));
        } else {
            errLog(`📌 Error : no response\n`)
            reject(errorMsg[2])
        }
    } catch (error) {
        errLog(`📌 Error : ${error}\n`)

        if (error.message.includes("SAFETY") || error.message.includes("OTHER") || error.message.includes("blocked")) {
            reject(errorMsg[0]);
        } else if (error.message.includes("trim")) {
            reject(errorMsg[1]);
        } else {
            resolve(errorMsg[3]);
        }
    }
})

const pdfAndTextBased = (prompt, pdf, pages) => new Promise(async (resolve, reject) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision", generationConfig: {maxOutputTokens: 5000}});
    genLog(`🌎 Prompt : ${prompt.slice(0, 32)}${prompt.length > 32 ? '...' : ''}`);

    try {
        genLog(`⏳ Scrapping PDF...`);
        const filePath = await base64toFile(pdf, { filePath: './stream/pdf/', fileName: "stored_pdf", types: ['pdf'], fileMaxSize: 3145728890 });
        const baseOptions = {
            width: 600,
            height: 800,
            density: 330,
            savePath: "./stream/images/"
        };
        const convert = fromPath(`./stream/pdf/${filePath}`, baseOptions);
        genLog(`⏳ Converting PDF pages...`);
        await convert.bulk(-1).then(async res => {
            const mimeType = "image/png";
            const imageParts = [];
            res.forEach((item) => {
                imageParts.push({
                    inlineData: {
                        data: Buffer.from(fs.readFileSync(item.path)).toString("base64"),
                        mimeType
                    }
                });
            })

            genLog(`⏳ Generating answer...`);
            const result = await model.generateContent([prompt, ...imageParts]);

            if (result.response && result.response.text) {
                const response = result.response;
                const text = response.text();
    
                resolve((text === "" ? errorMsg[2] : text.replace(/\*\*/g, "*")));
            } else {
                errLog(`📌 Error : no response\n`);
                reject(errorMsg[2]);
            }
        });
    } catch (error) {
        errLog(`📌 Error : ${error}\n`)

        if (error.message.includes("SAFETY") || error.message.includes("OTHER") || error.message.includes("blocked")) {
            reject(errorMsg[0]);
        } else if (error.message.includes("trim")) {
            reject(errorMsg[1]);
        } else {
            resolve(errorMsg[3]);
        }
    }
})

function fileToGenerativePart(base64, mimeType) {
    var filepath = base64Img.imgSync(base64, './stream/images', 'image');

    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(filepath)).toString("base64"),
        mimeType
      },
    };
}

module.exports = {
    textBased,
    imageAndTextBased,
    pdfAndTextBased
}