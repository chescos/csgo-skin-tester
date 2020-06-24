const parser = require('body-parser');

module.exports = parser.urlencoded({
  extended: true,
  parameterLimit: 500,
  limit: '1mb',
});
