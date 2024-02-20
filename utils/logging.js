const moment = require('moment');

const genLog = (log) => {
    const today = moment().format('DD-MM-YYYY HH:mm:ss');
    console.log(`[${today}] > ${log}`);
}

const errLog = (log) => {
    const today = moment().format('DD-MM-YYYY HH:mm:ss');
    console.error(`[${today}] > ${log}`);
}

module.exports = {
    genLog,
    errLog
}