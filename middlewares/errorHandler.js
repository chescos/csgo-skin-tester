const ErrorResponse = require('../modules/ErrorResponse');
const logger = require('../modules/Logger');

// `next` must be defined in the function arguments,
// otherwise, this middleware will not work!
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  logger.warn('Request error', {
    url: req.originalUrl,
    method: req.method,
    parameters: {
      body: req.body,
      query: req.query,
      params: req.params,
    },
    client: {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  logger.error(err);

  return res.status(500).json(ErrorResponse.serverError());
};
