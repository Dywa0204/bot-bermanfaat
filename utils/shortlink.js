const axios = require('axios');

const generateShortLink = async (url) => {
    try {
        const response = await axios.get(`http://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        const shortUrl = response.data;
        console.log(`Short link : ${shortUrl}`);
        return shortUrl;
    } catch (error) {
        console.error(`Error : ${error}`);
        throw error;
    }
};

module.exports = {
    generateShortLink
};