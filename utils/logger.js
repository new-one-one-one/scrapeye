const winston = require('winston');
const fs = require('fs');
const path = require('path');
const { CONFIGURATION } = require('../constants/configuration');

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

//I am creating necessary directories if they don't exist
const logDir = process.env.LOG_DIR || CONFIGURATION.LOG_FOLDER_NAME;
const date = new Date();
const year = date.getFullYear();
const month = date.toLocaleString('default', { month: 'long' });
const day = date.getDate();
const logPath = path.join(logDir, String(year), String(month), String(day));

if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath, { recursive: true });
}

const logger = createLogger({
  format: combine(timestamp(), logFormat),
  // Supporting 4 tupes of formats that can be accessible using logger object
  transports: [
    new transports.File({ filename: path.join(logPath, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logPath, 'info.log'), level: 'info' }),
    new transports.File({ filename: path.join(logPath, 'success.log'), level: 'success' }),
    new transports.File({ filename: path.join(logPath, 'warning.log'), level: 'warning' }),
  ],
});

module.exports = logger;
