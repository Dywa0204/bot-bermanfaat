const wa = require('@open-wa/wa-automate');
const { textBased, imageAndTextBased } = require('./utils/ai');
const { fbDownload, tiktokDownload, twitterDownload, ytDownload } = require('./utils/downloader')
const { generateShortLink } = require('./utils/shortlink')
const { is } = require('./utils/checker')
const { textMenu, textDonasi, reportText } = require('./utils/text')

let historyChat = [];

wa.create({
    sessionId: "WA_GPT",
    authTimeout: 60,
    blockCrashLogs: true,
    headless: "new",
    hostNotificationLang: 'PT_BR',
    logConsole: false,
    popup: true,
    qrTimeout: 0,
    executablePath: "/opt/google/chrome/chrome",
    messagePreprocessor: "AUTO_DECRYPT"
}).then(client => start(client));

function start(client) {
    client.onMessage(async message => {
        const msgId = message.id;
        const from = message.from;
        const body = message.body;
        const caption = message.caption;
        const type = message.type;
        const mimeType = message.mimeType;
        const pushname = message.sender.pushname;
        const senderId = message.sender.id;

        const command = type === 'image' 
            ? caption.slice(1).trim().split(/ +/).shift().toLowerCase()
            : body.slice(1).trim().split(/ +/).shift().toLowerCase();

        switch(command) {
            // GREETING
            case 'start':
                await client.reply(from, "Halo ada yang bisa saya bantu? ☺️☺️", msgId, true);
                break;

            //MENU
            case 'menu':
            case 'help':
                await client.reply(from, textMenu(pushname), msgId, true);
                break;

            //DONASI
            case 'donasi':
                await client.reply(from, textDonasi(), msgId, true);
                break;

            case 'report':
                const report = body.replace(/[\n\s]|#report/g, "");
                if(report != "") {
                    await client.sendText(senderId, reportText(report))
                    await client.reply(from, "Laporan anda sudah terkirim, terimakasih", msgId, true);
                }
                break;

            case 'shortlink':
                const lnk = body.replace(/[\n\s]|#shortlink/g, "");
                if(lnk != "" && is.Url(lnk)) {
                    const shortlink = await generateShortLink(lnk);
                    await client.reply(from, "✅ *Berhasil!!* ✅\n\n* Tautan Anda : " + shortlink, msgId, true);
                }
                break;

            // DOWNLOAD VIDEO
            case 'download':
                const url = body.replace(/[\n\s]|#download/g, "");
                
                if(is.Url(url)) {
                    if(url.includes("facebook.com") || url.includes("fb.com") || url.includes("instagram.com") || url.includes("ig.com")) 
                        fbDownloadHandler(url, from, client, msgId);
                    else if(url.includes("tiktok.com"))
                        tiktokDownloadHandler(url, from, client, msgId)
                    else if(url.includes("twitter.com") || url.includes("tw.com") || url.includes("x.com"))
                        twitterDownloadHandler(url, from, client, msgId)

                    // Youtube API request quota exceeded
                    // else if(url.includes("youtube.com") || url.includes("yt.com") || url.includes("youtu.be"))
                    //     youtubeDownloadHandler(url, from, client, msgId)
                } else {
                    await client.sendText(from, "‼️ Tautan yang Anda kirimkan tidak sah!")
                }
                break;

            // GENERATE STICKER
            case 'stiker': 
            case 'sticker':
                const stickerReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");
                await client.sendImageAsSticker(from, body);
                await client.editMessage(stickerReply, "✅ *Berhasil!!* ✅")
                break;

            // AI CHAT
            default:
                if(body[0] === "#") {
                    const prompt = type === 'image' ? caption.replace("#", "") : body.replace("#", "")
                    const sended = await client.sendText(from, "⌛⌛⌛");

                    switch(type) {
                        // AI IMAGE + TEXT BASED (ERROR)
                        case 'media': 
                            imageAndTextBased(prompt, body, historyChat).then(async (result) => {
                                historyChat.push({
                                    role: "user",
                                    parts: [
                                        {type: "text", content: prompt},
                                        {type: 'image', content: body}
                                    ]
                                })
                                historyChat.push({
                                    role: "model",
                                    parts: result
                                })
                                
                                result = result == "" 
                                    ? "Maaf saya tidak dapat menemukan jawaban yang tepat" 
                                    : result.replace(/\*\*/g, "*") 
                                await client.editMessage(sended, result)
                            }).catch(async (error) => {
                                await client.editMessage(sended, error.response 
                                    ? error.response.data 
                                    : "‼️ Terjadi kesalahan internal server");
                            })
                            break;

                        // AI TEXT BASED
                        case 'chat':
                            textBased(prompt, historyChat).then(async (result) => {
                                historyChat.push({
                                    role: "user",
                                    parts: prompt
                                })
                                historyChat.push({
                                    role: "model",
                                    parts: result
                                })
                                
                                result = result == "" 
                                    ? "Maaf saya tidak dapat menemukan jawaban yang tepat" 
                                    : result.replace(/\*\*/g, "*")
                                await client.editMessage(sended, result)
                            }).catch(async (error) => {
                                await client.editMessage(sended, error.response 
                                    ? error.response.data 
                                    : "‼️ Terjadi kesalahan internal server");
                            })
                            break;
                    }
                }
        }
    })
}

async function fbDownloadHandler(url, from, client, msgId) {
    const downloadReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");

    fbDownload(url).then(async result => {
        console.log(result)
        if(result.status) {
            let downloadResult = "✨ *Berikut tautan download Anda* ✨\n\n";
            
            const shortLinkPromises = result.data.map(async (item, index) => {
                if(!item.shouldRender) {
                    const shortlink = await generateShortLink(item.url);
                    return `${(index + 1)}. ${item.resolution ? item.resolution : "Tautan"} : ${shortlink}`;
                }
            });
            const shortLinks = await Promise.all(shortLinkPromises);
            shortLinks.forEach(shortlink => {
                if(shortlink) {
                    downloadResult += `${shortlink}\n`;
                }
            });
            
            const thumbnail = await client.download(result.data[0].thumbnail);
            await client.sendImage(from, thumbnail, "image.jpeg", downloadResult, msgId)
            await client.editMessage(downloadReply, "✅ *Berhasil!!* ✅")
        }
        else await client.editMessage(downloadReply, "‼️ Maaf saya tidak dapat menemukan video dari tautan yang Anda berikan")
    }).catch(async error => {
        await client.editMessage(downloadReply, "‼️ Terjadi kesalahan internal server")
    })
}

async function tiktokDownloadHandler(url, from, client, msgId) {
    const downloadReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");

    tiktokDownload(url).then(async result => {
        console.log(result)
        if(result.status) {
            const shortlink = await generateShortLink(result.data.video);

            let downloadResult = "✨ *Berikut tautan download Anda* ✨\n\n";
            downloadResult += `*${result.data.title}*\n`
            downloadResult += `Tautan : ${shortlink}`
            
            await client.reply(from, downloadResult, msgId, true);
            await client.editMessage(downloadReply, "✅ *Berhasil!!* ✅")
        }
        else await client.editMessage(downloadReply, "‼️ Maaf saya tidak dapat menemukan video dari tautan yang Anda berikan")
    }).catch(async error => {
        await client.editMessage(downloadReply, "‼️ Terjadi kesalahan internal server")
    })
}

// Youtube API request quota exceeded
async function youtubeDownloadHandler(url, from, client, msgId) {
    const downloadReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");

    ytDownload(url).then(async result => {
        console.log(result)
        if(result.status) {
            const shortlink = await generateShortLink(result.data.video);

            let downloadResult = "✨ *Berikut tautan download Anda* ✨\n\n";
            downloadResult += `*${result.data.title}*\n`
            downloadResult += `Author : ${result.data.author}`
            downloadResult += `Tautan : ${shortlink}`
            
            const thumbnail = await client.download(result.data.picture);
            await client.sendImage(from, thumbnail, "image.jpeg", downloadResult, msgId)
            await client.editMessage(downloadReply, "✅ *Berhasil!!* ✅")
        }
        else await client.editMessage(downloadReply, "‼️ Maaf saya tidak dapat menemukan video dari tautan yang Anda berikan")
    }).catch(async error => {
        await client.editMessage(downloadReply, "‼️ Terjadi kesalahan internal server")
    })
}

async function twitterDownloadHandler(url, from, client, msgId) {
    const downloadReply = await client.sendText(from, "⌛ Oke tunggu sebentar...");

    twitterDownload(url).then(async result => {
        console.log(result)
        if(result.status) {
            let shortlinkHD = "", shortlinkSD;
            if(is.Url(result.data.HD)) shortlinkHD = await generateShortLink(result.data.HD);
            if(is.Url(result.data.SD)) shortlinkSD = await generateShortLink(result.data.SD);

            let downloadResult = "✨ *Berikut tautan download Anda* ✨\n\n";
            if(is.Url(result.data.HD)) downloadResult += `1. HD : ${shortlinkHD}`
            if(is.Url(result.data.SD)) downloadResult += `2. SD : ${shortlinkSD}`
            
            await client.reply(from, downloadResult, msgId, true);
            await client.editMessage(downloadReply, "✅ *Berhasil!!* ✅")
        }
        else await client.editMessage(downloadReply, "‼️ Maaf saya tidak dapat menemukan video dari tautan yang Anda berikan")
    }).catch(async error => {
        await client.editMessage(downloadReply, "‼️ Terjadi kesalahan internal server")
    })
}