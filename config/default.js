const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { env } = process;

module.exports = {
  env: env.NODE_ENV || 'development',
  port: env.PORT || 3000,
};
