const parser = require('body-parser');

module.exports = parser.json({
  limit: '1mb',
});
