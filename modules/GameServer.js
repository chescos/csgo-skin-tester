/* eslint no-param-reassign: 0 */

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
      socket.on(['data', 'server-data'], (data) => {
        // Good! The socket speaks our language, (i.e. simple 'you::there', 'iam::here' protocol).
        logger.info('Received server-data event from socket', data);

        const address = `${data.ip}:${data.port}`;

        if (!this.sockets[address]) {
          socket.serverData = {
            address,
            ip: data.ip,
            port: data.port,
            slots: data.slots,
          };

          socket.players = [];

          this.sockets[address] = socket;

          logger.info('Added socket to list');
        }
      });

      socket.on(['data', 'player-connected'], (data) => {
        logger.info('Received player-connected event from socket', data);

        if (!socket.players) {
          socket.players = [];
        }

        socket.players.push(data.ip);
      });

      socket.on(['data', 'player-disconnected'], (data) => {
        logger.info('Received player-disconnected event from socket', data);

        if (!socket.players) {
          socket.players = [];
        }

        _.remove(socket.players, (ip) => ip === data.ip);
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
      socket.send('skin-created', data);
    });
  }

  isPlayerConnected(ip) {
    return _.some(
      this.sockets,
      (socket) => socket.players.includes(ip),
    );
  }

  getAvailableServer() {
    return _.get(
      _.find(
        this.sockets,
        (socket) => socket.serverData.slots > socket.players.length,
      ),
      'serverData.address',
      null,
    );
  }
}

const gameServer = new GameServer();

module.exports = gameServer;
