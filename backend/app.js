/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

require('dotenv').config()

const globalErrHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const routes = require('./routes/routes');
const loggers = require('./utils/loggers');

const app = express();

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Allow Cross-Origin requests
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use(globalErrHandler);

// Error Handler
// process.on('unhandledRejection', (err) => {
//   console.log('UNHANDLED REJECTION!!!  shutting down ...');
//   console.log(err.name, err.message);
// });

// Set up logger
app.use(loggers.requestLogger);

// Routes
app.use('/api/v1', routes);

// handle undefined Routes
app.use('*', (req, res, next) => {
  console.log(req.protocol + '://' + req.get('host') + req.originalUrl);
  const err = new AppError(404, 'fail', 'undefined route');
  next(err, req, res, next);
});

app.listen(process.env.PORT, () => {
  console.log(`Application is running on port ${process.env.PORT}`);
});
