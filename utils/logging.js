const moment = require('moment');
const path = require('path');
const fs = require("fs");

let session = "";

const genLog = (log) => {
    const today = moment().format('DD-MM-YYYY HH:mm:ss');
    console.log(`[${today}] > ${log}`);

    exportLog(`[${today}] > ${log}`);
}

const errLog = (log) => {
    const today = moment().format('DD-MM-YYYY HH:mm:ss');
    console.error(`[${today}] > ${log}`);

    exportLog(`[${today}] > ${log}`);
}

const exportLog = (log) => {
    const todayDate = moment().format('DD-MM-YYYY');
    const dirName = `./logs/log_${todayDate}`;
    const logFileName = path.join(dirName, `log_${session}.log`);

    fs.appendFile(logFileName, `${log}\n`, (err) => {
        if (err) {
            console.error('📌 Failed append log file', err);
        }
    });
}

const setSession = (s) => {
    session = s;
}

module.exports = {
    genLog,
    errLog,
    setSession
}