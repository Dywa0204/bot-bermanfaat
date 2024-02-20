const { ndown, tikdown, twitterdown } = require("nayan-media-downloader")
const ytdl = require('ytdl-core');
const axios = require('axios');
const fs = require("fs");
const converter = require('video-converter');
const SpottyDL = require('spottydl')
const { genLog, errLog } = require('./logging')

converter.setFfmpegPath("/usr/bin/ffmpeg", function(err) {
    if (err) throw err;
});

const errorMsg = [
    "‼️ Maaf saya tidak dapat menemukan video dari tautan yang Anda berikan",
    "‼️ Terjadi kesalahan internal server"
];

const fbDownload = (url) => new Promise(async (resolve, reject) => {
    genLog(`🌎 URL : ${url}`);

    const index = url.includes("facebook.com") || url.includes("fb.com") ? 1 : 0;
    try {
        genLog(`⏳ Scrapping URL...`);
        const result = await ndown(url);
        if(result.status && result.data[index]) {
            processVideo(result.data[index].url).then(() => {
                resolve("success")
            }).catch(() => {
                reject(errorMsg[0])
            })
        } else reject(errorMsg[0]);
    } catch(error) {
        errLog(`📌 Error : ${error}\n`)
        reject(errorMsg[1]);
    }
})

const tiktokDownload = (url) => new Promise(async (resolve, reject) => {
    genLog(`🌎 URL : ${url}`);

    try {
        genLog(`⏳ Scrapping URL...`);
        const result = await tikdown(url);
        if(result.status && result.data.video) {
            processVideo(result.data.video).then(() => {
                resolve("success")
            }).catch(() => {
                reject(errorMsg[0])
            })
        } else reject(errorMsg[0]);
    } catch(error) {
        errLog(`📌 Error : ${error}\n`)
        reject(errorMsg[1]);
    }
})

const ytDownload = (url) => new Promise(async (resolve, reject) => {
    genLog(`🌎 URL : ${url}`);

    try {
        genLog(`⏳ Scrapping URL...`);
        const video = ytdl(url, { quality: 'highest' });
        const writeStream = fs.createWriteStream("./stream/video/dvideo.mp4");
        video.pipe(writeStream);

        genLog(`⏳ Downloading content...`);
        writeStream.on('finish', () => {
            genLog(`⏳ Converting content...`);
            converter.convert("./stream/video/dvideo.mp4", "./stream/video/cvideo.mp4", async function(err) {
                if(err) {
                    errLog(`📌 Error : ${err}\n`)
                    reject(errorMsg[1]);
                }
                else {
                    resolve("success");
                } 
            });
        });
    } catch(error) {
        errLog(`📌 Error : ${error}\n`)
        reject(errorMsg[1])
    }
})

const twitterDownload = (url) => new Promise(async (resolve, reject) => {
    genLog(`🌎 URL : ${url}`);

    url = url.replace("x.com", "twitter.com");
    try {
        genLog(`⏳ Scrapping URL...`);
        const result = await twitterdown(url);
        if(result.status && result.data.SD) {
            processVideo(result.data.SD).then(() => {
                resolve("success")
            }).catch(() => {
                reject(errorMsg[0])
            })
        } else reject(errorMsg[0]);
    } catch(error) {
        errLog(`📌 Error : ${error}\n`)
        reject(errorMsg[1]);
    }
})

const ytMP3Download = (url) => {

}

const spotifyDownload = (url) => new Promise(async (resolve, reject) => {
    genLog(`🌎 URL : ${url}`);

    try {
        genLog(`⏳ Scrapping URL...`);
        await SpottyDL.getTrack(url).then(async(results) => {
            genLog(`⏳ Downloading content...`);
            let track = await SpottyDL.downloadTrack(results, "./stream/audio/")
            resolve({info: results, path: track})
        });
    } catch (error) {
        errLog(`📌 Error : ${error}\n`)
        reject(errorMsg[1]);
    }
})

const processVideo = (url) => new Promise(async (resolve, reject) => {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream("./stream/video/dvideo.mp4");
        response.data.pipe(writer);

        genLog(`⏳ Downloading content...`);
        writer.on('finish', () => {
            genLog(`⏳ Converting content...`);
            converter.convert("./stream/video/dvideo.mp4", "./stream/video/cvideo.mp4", async function(err) {
                if(err) {
                    errLog(`📌 Error : ${err}\n`)
                    reject();
                }
                else {
                    resolve();
                } 
            });
        })

        writer.on('error', error => {
            errLog(`📌 Error : ${error}\n`)
        })
    } catch (error) {
        errLog(`📌 Error : ${error}\n`)
        reject();
    }
})

module.exports = {
    fbDownload,
    tiktokDownload,
    ytDownload,
    twitterDownload,
    spotifyDownload
}