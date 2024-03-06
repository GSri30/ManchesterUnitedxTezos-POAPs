/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
// Express automatically knows that this entire function is an error handling middleware by specifying 4 parameters
module.exports = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
  });
};
