import winston from 'winston';
import fs from 'fs';
import path from 'path';

require('winston-daily-rotate-file');
require('winston-mail')

let logDirectory = path.join(process.cwd()+'/src/logs');

winston.addColors(winston.config.npm.colors);

//create directory if it is not present
if (!fs.existsSync(logDirectory)) {
  // Create the directory if it does not exist
  fs.mkdirSync(logDirectory);
}

//winston options for various logging type
let options = {
  file: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    filename: logDirectory + '/%DATE%-edufiedLogs.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    timestamp: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    prettyPrint: true,
    json: true,
    maxsize: 5242880, // 5MB
    colorize: true,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    colorize: true,
    prettyPrint: true
  }
};

module.exports.logger = winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile(options.file),
    new winston.transports.Console(options.console)
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile(options.file)
  ],
  exitOnError: false, // do not exit on handled exceptions
});
