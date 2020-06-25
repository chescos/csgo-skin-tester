const nssocket = require('nssocket');
const _ = require('lodash');
const config = require('config');
const logger = require('./Logger');

class GameServer {
  constructor() {
    this.sockets = {};

    // Create a nssocket TCP server.
    this.server = nssocket.createServer((socket) => {
      logger.info('Socket connected');

      socket.on('start', () => {
        logger.info('start event');
      });

      // Usually caused on abrupt socket disconnect.
      socket.on('error', (err) => {
        logger.warn('Socket error');
        logger.error(err);
      });

      socket.on('close', (hadError) => {
        logger.info('close event', { hadError });

        // Socket has an identifier and the identifier is in the sockets list.
        if (socket.identifier && this.sockets[socket.identifier]) {
          delete this.sockets[socket.identifier];
          logger.info(`Removed ${socket.identifier} from list`);
        }
      });

      socket.on('destroy', () => {
        logger.info('destroy event');
      });

      socket.on('idle', () => {
        logger.info('idle event');
      });

      // Here, `socket` is an instance of `nssocket.NsSocket`.
      socket.on(['data', 'identifier'], (data) => {
        // Good! The socket speaks our language, (i.e. simple 'you::there', 'iam::here' protocol).
        logger.info('Received identifier event from socket', data);

        // Data is correctly formatted and socket is not in our `sockets` object yet.
        const dataIsValid = typeof data === 'object'
          && 'identifier' in data
          && typeof data.identifier === 'string'
          && !(data.identifier in this.sockets);

        if (dataIsValid) {
          // eslint-disable-next-line no-param-reassign
          socket.identifier = data.identifier;
          this.sockets[data.identifier] = socket;
          logger.info('Added socket to list');
        }
      });
    });

    const port = config.get('socketPort');

    // Start the socket server and listen for connections.
    this.server.listen(port, () => {
      logger.info(`Socket server is now listening on port ${port}`);
    });
  }

  sendSkin(data) {
    _.forEach(this.sockets, (socket) => {
      socket.send('skin', data);
    });
  }
}

const gameServer = new GameServer();

module.exports = gameServer;
