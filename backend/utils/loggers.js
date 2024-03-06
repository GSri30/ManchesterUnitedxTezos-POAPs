const winston = require('winston')
const expressWinston = require('express-winston');

// Custom log format
const customFormat = winston.format.printf(({ message, timestamp }) => {
    return `${timestamp}: ${message}`;
});

// Logger for requests
const requestLogger = expressWinston.logger({
    transports: [
        new winston.transports.File({ filename: 'app.log' })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.prettyPrint(),
        winston.format.timestamp(),
        customFormat
    ),
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
});

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'app.log' })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.prettyPrint(),
        winston.format.timestamp(),
        customFormat
    )
});

// Info logger
const infoLogger = (message) => {
    logger.info(message);
};

module.exports = { requestLogger, infoLogger };