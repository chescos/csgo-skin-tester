const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { env } = process;

module.exports = {
  env: env.NODE_ENV || 'development',
  appKey: env.APP_KEY,
  webPort: env.WEB_PORT || 3000,
  socketPort: env.SOCKET_PORT || 8080,

  database: {
    url: env.DATABASE_URL,
    ssl: env.DATABASE_SSL === 'true',
    debug: env.DATABASE_DEBUG === 'true',
    queryTimeout: 20000,
    transactionTimeout: 20000,
    connections: {
      min: parseInt(env.DATABASE_MIN_CONNECTIONS, 10) || 10,
      max: parseInt(env.DATABASE_MAX_CONNECTIONS, 10) || 100,
    },
  },

  steam: {
    apiKey: env.STEAM_API_KEY,
  },
};
