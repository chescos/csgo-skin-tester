const { validationResult } = require('express-validator');
const ErrorResponse = require('../modules/ErrorResponse');
const logger = require('../modules/Logger');

module.exports = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  logger.warn('Input validation failed', {
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
    errors: errors.array(),
  });

  return res.status(400).json(ErrorResponse.validationError(errors));
};
