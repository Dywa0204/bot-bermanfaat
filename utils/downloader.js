const { ndown, tikdown, ytdown, twitterdown } = require("nayan-media-downloader")

const fbDownload = (url) => new Promise(async (resolve, reject) => {
    console.log(`URL : ${url}`);

    try {
        let URL = await ndown(url);
        resolve(URL)
    } catch(error) {
        reject(error)
    }
})

const tiktokDownload = (url) => new Promise(async (resolve, reject) => {
    console.log(`URL : ${url}`);

    try {
        let URL = await tikdown(url);
        resolve(URL)
    } catch(error) {
        reject(error)
    }
})

const ytDownload = (url) => new Promise(async (resolve, reject) => {
    console.log(`URL : ${url}`);

    try {
        let URL = await ytdown(url);
        resolve(URL)
    } catch(error) {
        reject(error)
    }
})

const twitterDownload = (url) => new Promise(async (resolve, reject) => {
    console.log(`URL : ${url}`);

    try {
        let URL = await twitterdown(url);
        resolve(URL)
    } catch(error) {
        reject(error)
    }
})

module.exports = {
    fbDownload,
    tiktokDownload,
    ytDownload,
    twitterDownload
}