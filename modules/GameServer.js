/* eslint no-param-reassign: 0 */

const nssocket = require('nssocket');
const _ = require('lodash');
const config = require('config');
const logger = require('./Logger');

class GameServer {
  constructor() {
    this.sockets = {};
    this.queue = {};

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

        if (this.isSocketRegistered(socket)) {
          delete this.sockets[socket.gameServer.address];
          logger.info(`Removed ${socket.gameServer.address} from list`);
        }
      });

      socket.on('destroy', () => {
        logger.info('destroy event');
      });

      socket.on('idle', () => {
        logger.info('idle event');
      });

      // This event is emitted when the server initially connects, and then every 10 seconds.
      // We use it to update the server data, especially the currently connected players (IPs).
      socket.on(['data', 'server-heartbeat'], (data) => {
        // Good! The socket speaks our language, (i.e. simple 'you::there', 'iam::here' protocol).
        logger.info('Received server-heartbeat event from socket', data);

        const address = `${data.ip}:${data.port}`;

        socket.gameServer = {
          address,
          ip: data.ip,
          port: data.port,
          slots: data.slots,
          players: data.players,
          updatedAt: Date.now(),
        };

        this.sockets[address] = socket;
      });

      // This event is emitted when a player spawns in the server.
      // We use it to send queued skins to the player, if there are any for his IP.
      socket.on(['data', 'player-spawned'], (data) => {
        logger.info('Received player-spawned event from socket', data);

        if (this.isSocketRegistered(socket) && this.queue[data.ip]) {
          this.sendSkin(this.queue[data.ip].data);
          delete this.queue[data.ip];
          logger.info(`Sent queued skin to ${data.ip}`);
        }
      });
    });

    // Remove old game servers and queued skins.
    setInterval(() => {
      _.forEach(this.sockets, (socket, address) => {
        // The game server hasn't been updated in 30 seconds, remove it.
        if (socket.gameServer.updatedAt < Date.now() - 30000) {
          delete this.sockets[address];
          logger.info(`Removed unresponsive game server ${address}`);
        }
      });

      _.forEach(this.queue, (item, ip) => {
        // The queue item is older than 600 seconds, remove it.
        if (item.createdAt < Date.now() - 600000) {
          delete this.queue[ip];
          logger.info(`Removed queue item from ${ip}`);
        }
      });
    }, 10000);

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

  queueSkin(data) {
    this.queue[data.ip] = {
      data,
      createdAt: Date.now(),
    };
  }

  isPlayerConnected(ip) {
    return _.some(
      this.sockets,
      (socket) => socket.gameServer.players.includes(ip),
    );
  }

  getAvailableServer() {
    return _.get(
      _.find(
        this.sockets,
        (socket) => socket.gameServer.slots > socket.gameServer.players.length,
      ),
      'gameServer.address',
      null,
    );
  }

  isSocketRegistered(socket) {
    return !_.isUndefined(socket.gameServer)
      && !_.isUndefined(this.sockets[socket.gameServer.address]);
  }
}

const gameServer = new GameServer();

module.exports = gameServer;
