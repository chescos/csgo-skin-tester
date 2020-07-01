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
    accounts: [
      {
        username: 'chesc0s42',
        password: '5ab2581b4330cfb5562de8c617ba7874:84c6383ae47a9c27bc22ce92',
        sharedSecret: 'cde28d858c317fd519111d0a342caefc:f77f2c8574d6ef1bb6b6be344cf2188ab04f974b17217091661406a0',
      },
      {
        username: 'chesc0s43',
        password: '388e3021f49fd7a5b9b57f53e1567044:71136d6eeef21a8baab6b494',
        sharedSecret: 'c9dc335b72f9b464625e78a79eda3d58:a35a92a4a2748ed7c3838cf03a7bdad72bb776c8cabf7c5c766ca062',
      },
      {
        username: 'chesc0s44',
        password: '528cdd041fb0d61cfd8300d35e8b9c04:efa6fa7c69827cdd3f2635c5',
        sharedSecret: '28cfbba74e17f2deb343c3f138ce802a:295b120e360ddee22a1f0ba637c989abc5edd0cc5bd4901679afb57d',
      },
      {
        username: 'chesc0s45',
        password: 'e685454a7a0840676e0b9412b95c3e2d:13c0f48ed136c61b7ef0bfcc',
        sharedSecret: '8475a0ec96e9448dd7d6ee1fa3fbddaa:e2882b30e899caaf3aaf901fc1dbcc16e3b2ee11d1a7c34b45a16924',
      },
      {
        username: 'chesc0s46',
        password: 'c72231b81da5cd3d025212ed25e8857a:16527f928feeb0805aef95bc',
        sharedSecret: 'e0c5bbaf5f6a330b4135592b5cd60aa2:97ce5e245e82c900d6fcc65158eabc09e98c50275463e7e5daea3525',
      },
    ],
  },

  inspect: {
    timeoutMs: env.INSPECT_TIMEOUT_MS || 3000,
  },
};
