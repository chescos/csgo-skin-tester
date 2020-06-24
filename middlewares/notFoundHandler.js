const ErrorResponse = require('../modules/ErrorResponse');

module.exports = (req, res) => res.status(404).json(ErrorResponse.notFound());
