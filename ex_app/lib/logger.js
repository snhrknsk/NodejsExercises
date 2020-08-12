var winston = require('winston');

function Logger(){
    return winston.add(new winston.transports.File({
        filename: "log/debug.log",
        maxsize: 1048576,
        level: "info"
    }));
}

module.exports = new Logger();