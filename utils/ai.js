const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

const textBased = (prompt, historyChat) => new Promise(async (resolve, reject) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    console.log(`Prompt : ${prompt}`)

    try {
        const chat = model.startChat({
            history: historyChat,
            generationConfig: {
              maxOutputTokens: 1000,
            },
        });
        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const text = response.text();
        console.log(`Result : OK`)
        
        resolve(text);
    } catch (error) {
        console.error(error);
        reject(error);
    }
})

const imageAndTextBased = (prompt, img, mimeType, historyChat) => new Promise(async (resolve, reject) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision"});
    console.log(`Prompt : ${prompt}`)

    try {
        const chat = model.startChat({
            history: historyChat,
            generationConfig: {
              maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage([prompt, {
            inlineData: {
                data: img,
                mimeType
            }
        }]);
        
        const response = result.response;
        const text = response.text();
        console.log(`Result : OK`)
        
        resolve(text);
    } catch (error) {
        console.error(error);
        reject(error);
    }
})


module.exports = {
    textBased,
    imageAndTextBased
}