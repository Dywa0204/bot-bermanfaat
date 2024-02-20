const wa = require('@open-wa/wa-automate');
const { textBased, imageAndTextBased, pdfAndTextBased } = require('./utils/ai');
const { fbDownload, tiktokDownload, twitterDownload, ytDownload, spotifyDownload } = require('./utils/downloader');
const { generateShortLink } = require('./utils/shortlink');
const { is } = require('./utils/checker');
const { textMenu, textDonasi, reportText } = require('./utils/text');
const { genLog, errLog } = require('./utils/logging')

let historyChat = [];

var allowed = /(?:1602602275|62895411138785|120363240984577935|120363222364834089)/g;

const errorMsg = [
    "‼️ Terjadi kesalahan internal server",
    "‼️ Pdf melebihi 25 halaman"
]

wa.create({
    sessionId: "WA_GPT",
    authTimeout: 60,
    blockCrashLogs: true,
    headless: "new",
    hostNotificationLang: 'PT_BR',
    logConsole: false,
    popup: true,
    qrTimeout: 0,
    useChrome: true,
    executablePath: "/opt/google/chrome/chrome",
    messagePreprocessor: "AUTO_DECRYPT"
}).then(client => start(client));

function start(client) {
    try {
        client.onMessage(async message => {
            const msgId = message.id;
            const from = message.from;
            const body = message.body;
            const caption = message.caption;
            const type = message.type;
            const mimeType = message.mimetype;
            const pushname = message.sender.pushname;
            const senderId = message.sender.id;
            const quotedMsg = message.quotedMsg;
            const chatId = message.chatId;
    
            const command = type === 'image' || type === 'video'
                    ? (caption ?  caption.slice(1).trim().split(/ +/).shift().toLowerCase() : "")
                    : body.slice(1).trim().split(/ +/).shift().toLowerCase();
    
            switch(command) {
                // GREETING
                case 'start':
                    try {
                        genLog("⏳ Is sending a greeting message...");
                        await client.reply(from, "Halo ada yang bisa saya bantu? ☺️☺️", msgId, true);
                        genLog("✅ Success\n")
                    } catch (error) {
                        errLog(`📌 Error : ${error}\n`)
                        await client.sendText(from, errorMsg[0])
                    }
                    break;
    
                // MENU
                case 'menu':
                case 'help':
                    try {
                        genLog("⏳ Is sending a menu message...");
                        await client.reply(from, textMenu(pushname), msgId, true);
                        genLog("✅ Success\n")
                    } catch (error) {
                        errLog(`📌 Error : ${error}\n`)
                        await client.sendText(from, errorMsg[0])
                    }
                    break;
    
                // DONASI
                case 'donasi':
                    try {
                        genLog("⏳ Is sending a donation message...");
                        await client.reply(from, textDonasi(), msgId, true);
                        genLog("✅ Success\n")
                    } catch (error) {
                        errLog(`📌 Error : ${error}\n`)
                        await client.sendText(from, errorMsg[0])
                    }
                    break;
    
                // REPORT
                case 'report':
                    const report = body.replace(/[\n\s]|#report/g, "");
                    if(report != "") {
                        try {
                            genLog("⏳ Is sending a report message...");
                            await client.sendText(senderId, reportText(report))
                            await client.reply(from, "Laporan anda sudah terkirim, terimakasih", msgId, true);
                            genLog("✅ Success\n")
                        } catch (error) {
                            errLog(`📌 Error : ${error}\n`)
                            await client.sendText(from, errorMsg[0])
                        }
                    }
                    break;
    
                // SHORT LINK
                case 'shortlink':
                    const lnk = body.replace(/[\n\s]|#shortlink/g, "");
                    if(lnk != "" && is.Url(lnk)) {
                        try {
                            genLog("⏳ Generating shortlink...");
                            const shortlink = await generateShortLink(lnk);
                            await client.reply(from, "✅ *Berhasil!!* ✅\n\nTautan Anda : " + shortlink, msgId, true);
                            genLog("✅ Success\n")
                        } catch (error) {
                            errLog(`📌 Error : ${error}\n`)
                            await client.sendText(from, errorMsg[0])
                        }
                    }
                    break;
    
                // DOWNLOAD VIDEO
                case 'download':
                    try {
                        const url = body.replace(/[\n\s]|#download/g, "");
                        genLog("⏳ Checking video URL...");

                        if(is.Url(url)) {
                            if(url.includes("facebook.com") || url.includes("fb.com") || url.includes("instagram.com") || url.includes("ig.com")) 
                                fbDownloadHandler(url, from, client, msgId);
                            else if(url.includes("tiktok.com"))
                                tiktokDownloadHandler(url, from, client, msgId)
                            else if(url.includes("twitter.com") || url.includes("tw.com") || url.includes("x.com"))
                                twitterDownloadHandler(url, from, client, msgId)
                            else if(url.includes("youtube.com") || url.includes("yt.com") || url.includes("youtu.be"))
                                youtubeDownloadHandler(url, from, client, msgId)
                        } else {
                            await client.sendText(from, "‼️ Tautan yang Anda kirimkan tidak sah!")
                            errLog("📌 Error : invalid url \n")
                        }
                    } catch (error) {
                        errLog(`📌 Error : ${error}\n`)
                        await client.sendText(from, errorMsg[0])
                    }
                    break;
    
                // GENERATE STICKER
                case 'stiker': 
                case 'sticker':
                    try {
                        genLog("⏳ Creating sticker...");
                        if(type === "image" || type === "video") 
                            createSticker(type, client, from, body);
                    } catch (error) {
                        errLog(`📌 Error : ${error}\n`)
                        await client.sendText(from, errorMsg[0])
                    }
                    break;

                // GENERATE STICKER FROM REPLY CHAT 
                case 'stikerit':
                case 'stickerit':
                    try {
                        if(quotedMsg) {
                            genLog("⏳ Creating sticker...");
                            if(quotedMsg.type === "image" || quotedMsg.type === "video") {
                                const stickerBody = await client.decryptMedia(quotedMsg.id);
                                createSticker(quotedMsg.type, client, from, stickerBody);
                            }
                        }
                    } catch (error) {
                        errLog(`📌 Error : ${error}\n`)
                        await client.sendText(from, errorMsg[0])
                    }
                    break;

                //RESET AI CHAT HISTORY
                case 'reset_ai':
                    try {
                        genLog("⏳ Is cleaning AI chat history");
                        historyChat = [];
                        await client.reply(from, "✅ *Berhasil membersihkan riwayat chat AI*", msgId, true)
                    } catch (error) {
                        errLog(`📌 Error : ${error}\n`)
                        await client.sendText(from, errorMsg[0])
                    }
                    break;

                // RESQUEST SPOTIFY SONG
                case 'request':
                    try {
                        genLog("⏳ Checking audio URL...");
                        const audioUrl = body.replace(/[\n\s]|#request/g, "");
                    
                        if(is.Url(audioUrl)) {
                            if(audioUrl.includes("spotify.com")) 
                                spotifyDownloadHandler(audioUrl, from, client, msgId);
                        } else {
                            await client.sendText(from, "‼️ Tautan yang Anda kirimkan tidak sah!")
                            errLog("📌 Error : invalid url \n")
                        }
                    } catch (error) {
                        errLog(`📌 Error : ${error}\n`)
                        await client.sendText(from, errorMsg[0])
                    }
                    break;
    
                // AI CHAT
                default:
                    const cmd = type === "image" || type === "document" ? (caption ? caption[0] : "") : body[0];
                    if(cmd === "#") {
                        genLog("⏳ Checking prompt...");
                        const prompt = type === 'image' || type === "document" ? caption.replace("#", "") : body.replace("#", "")
                        const sended = await client.sendText(from, "⌛⌛⌛");
    
                        switch(type) {
                            // AI IMAGE + TEXT BASED
                            case 'image': 
                                try {
                                    imageAndTextBased(prompt, body, mimeType).then(async (result) => {
                                        assignNewChatHistory(prompt, result);
                                        await client.editMessage(sended, result)
                                        genLog("✅ Success\n")
                                    }).catch(async (error) => {
                                        errLog(`📌 Error : ${error}\n`)
                                        await client.editMessage(sended, error);
                                    })
                                } catch (error) {
                                    errLog(`📌 Error : ${error}\n`)
                                    await client.sendText(from, errorMsg[0])
                                }
                                break;

                            // AI PDF + TEXT BASED
                            case 'document':
                                if(mimeType.includes("pdf")) {
                                    if(message.pageCount > 25) {
                                        await client.editMessage(sended, errorMsg[1]);
                                    } else {
                                        try {
                                            pdfAndTextBased(prompt, body, message.pageCount).then(async (result) => {
                                                assignNewChatHistory(prompt, result);
                                                await client.editMessage(sended, result)
                                                genLog("✅ Success\n")
                                            }).catch(async (error) => {
                                                errLog(`📌 Error : ${error}\n`)
                                                await client.editMessage(sended, error);
                                            })
                                        } catch (error) {
                                            errLog(`📌 Error : ${error}\n`)
                                            await client.sendText(from, errorMsg[0])
                                        }
                                    }
                                }
                                break;
    
                            // AI TEXT BASED
                            case 'chat':
                                try {
                                    textBased(prompt, historyChat).then(async (result) => {
                                        assignNewChatHistory(prompt, result);
                                        await client.editMessage(sended, result)
                                        genLog("✅ Success\n")
                                    }).catch(async (error) => {
                                        errLog(`📌 Error : ${error}\n`)
                                        await client.editMessage(sended, error);
                                    })
                                } catch (error) {
                                    errLog(`📌 Error : ${error}\n`)
                                    await client.sendText(from, errorMsg[0])
                                }
                                break;
                        }
                    }
            }
        })
    } catch (error) {
        errLog(`📌 Error : ${error}\n`)
    }
}

async function createSticker(type, client, from, body) {
    const stickerReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");

    try {
        genLog("⏳ Sending sticker...");
        switch(type) {
            case 'image':
                await client.sendImageAsSticker(from, body);
                break;
            case 'video':
                await client.sendMp4AsSticker(from, body);
                break;
        }
        await client.editMessage(stickerReply, "✅ *Berhasil!!* ✅")
        genLog("✅ Success\n")
    } catch (error) {
        errLog(`📌 Error : ${error}\n`)
        await client.editMessage(stickerReply, (error.message.includes("STICKER_TOO_LARGE") ? "‼️ Ukuran media terlalu besar" : errorMsg[0]))
    }
}

function assignNewChatHistory(user, model) {
    historyChat.push({
        role: "user",
        parts: user
    })
    
    historyChat.push({
        role: "model",
        parts: model
    })
}

async function fbDownloadHandler(url, from, client, msgId) {
    const downloadReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");

    fbDownload(url).then(async result => {
        if(result === "success") {
            genLog(`⏳ Sending content...`);
            await client.sendImage(from, "./stream/video/cvideo.mp4", "image.mp4", "", msgId);
            await client.editMessage(downloadReply, "✅ *Berhasil!!* ✅");
            genLog("✅ Success\n")
        } else {
            await client.editMessage(downloadReply, result);
            errLog(`📌 Error : ${result}\n`)
        }
    }).catch(async error => {
        errLog(`📌 Error : ${error}\n`)
        await client.editMessage(downloadReply, error)
    })
}

async function tiktokDownloadHandler(url, from, client, msgId) {
    const downloadReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");

    tiktokDownload(url).then(async result => {
        if(result === "success") {
            genLog(`⏳ Sending content...`);
            await client.sendImage(from, "./stream/video/cvideo.mp4", "image.mp4", "", msgId);
            await client.editMessage(downloadReply, "✅ *Berhasil!!* ✅");
            genLog("✅ Success\n")
        } else {
            await client.editMessage(downloadReply, result);
            errLog(`📌 Error : ${result}\n`)
        }
    }).catch(async error => {
        errLog(`📌 Error : ${error}\n`)
        await client.editMessage(downloadReply, error)
    })
}

async function youtubeDownloadHandler(url, from, client, msgId) {
    const downloadReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");

    ytDownload(url).then(async result => {
        if(result === "success") {
            genLog(`⏳ Sending content...`);
            await client.sendImage(from, "./stream/video/cvideo.mp4", "image.mp4", "", msgId);
            await client.editMessage(downloadReply, "✅ *Berhasil!!* ✅");
            genLog("✅ Success\n")
        } else {
            await client.editMessage(downloadReply, result);
            errLog(`📌 Error : ${result}\n`)
        }
    }).catch(async error => {
        errLog(`📌 Error : ${error}\n`)
        await client.editMessage(downloadReply, error)
    })
}

async function twitterDownloadHandler(url, from, client, msgId) {
    const downloadReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");

    twitterDownload(url).then(async result => {
        if(result === "success") {
            genLog(`⏳ Sending content...`);
            await client.sendImage(from, "./stream/video/cvideo.mp4", "image.mp4", "", msgId);
            await client.editMessage(downloadReply, "✅ *Berhasil!!* ✅");
            genLog("✅ Success\n")
        } else {
            await client.editMessage(downloadReply, result);
            errLog(`📌 Error : ${result}\n`)
        }
    }).catch(async error => {
        errLog(`📌 Error : ${error}\n`)
        await client.editMessage(downloadReply, error)
    })
}

async function spotifyDownloadHandler(url, from, client, msgId) {
    const downloadReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");

    spotifyDownload(url).then(async result => {
        if(result.path[0].status === 'Success') {
            genLog(`⏳ Sending content...`);
            const infoText = `* Judul lagu : *${result.info.title}* \n* Artis : *${result.info.artist}* \n* Album : *${result.info.album}*`
            await client.sendFile(from, result.path[0].filename, "music.mp3", "", null, false, true, false)
            await client.editMessage(downloadReply, `✅ *Berhasil!!* ✅\n\n${infoText}`);
            genLog("✅ Success\n")
        } else {
            await client.editMessage(downloadReply, result.path);
            errLog(`📌 Error : ${result}\n`)
        }
    }).catch(async error => {
        errLog(`📌 Error : ${error}\n`)
        await client.editMessage(downloadReply, error)
    })
}