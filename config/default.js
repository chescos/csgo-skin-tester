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
    queryTimeout: env.DYNO && env.DYNO.startsWith('web.') ? 20000 : 300000,
    transactionTimeout: env.DYNO && env.DYNO.startsWith('web.') ? 20000 : 60000,
    connections: {
      min: parseInt(env.DATABASE_MIN_CONNECTIONS, 10) || 10,
      max: parseInt(env.DATABASE_MAX_CONNECTIONS, 10) || 100,
    },
  },

  steam: {
    apiKey: env.STEAM_API_KEY,
    accounts: [
      {
        username: 'chesc0s42',
        password: '5ab2581b4330cfb5562de8c617ba7874:84c6383ae47a9c27bc22ce92',
        sharedSecret: 'cde28d858c317fd519111d0a342caefc:f77f2c8574d6ef1bb6b6be344cf2188ab04f974b17217091661406a0',
      },
    ],
  },
};
