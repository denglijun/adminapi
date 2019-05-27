const bunyan = require('bunyan')

let now = new Date();
const logger = bunyan.createLogger({
    name: 'ss',
    src: true,
    streams: [
        {
            level: 'info',
            path: __dirname + `/log/info-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.log`,
        },
        {
            level: 'error',
            path: __dirname + `/log/err-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.log`,
        }
    ]
});

module.exports = {
    logger,
}