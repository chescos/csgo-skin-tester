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
        password: '2ad4faa6fcff3674c2775a244d78ed6c:725afb94b0f9bb95114b81bc',
        sharedSecret: '14a5daf4e431ac30b61b3414aa06127c:69cbb6c0535619cd57100ba1cfff4da462e8e19e1a5eda78ee15c829',
      },
    ],
  },
};
