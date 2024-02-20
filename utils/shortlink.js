const axios = require('axios');
const { genLog, errLog } = require('./logging')

const generateShortLink = async (url) => {
    try {
        const response = await axios.get(`http://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        const shortUrl = response.data;
        genLog(`🌎 Shortlink : ${shortUrl}`);
        return shortUrl;
    } catch (error) {
        errLog(`📌 Error : ${error}\n`)
        throw error;
    }
};

module.exports = {
    generateShortLink
};