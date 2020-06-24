const SteamUser = require('steam-user');
const GlobalOffensive = require('globaloffensive');
const SteamTotp = require('steam-totp');
const _ = require('lodash');
const logger = require('./Logger');

// TODO: Add this to a config or to a database and encrypt it.
const accounts = [];

const clients = [];

accounts.forEach((account) => {
  const client = new SteamUser();
  const csgo = new GlobalOffensive(client);

  client.logOn({
    accountName: account.username,
    password: account.password,
    twoFactorCode: SteamTotp.getAuthCode(account.sharedSecret),
  });

  client.on('loggedOn', () => {
    logger.info(`Logged into Steam as ${client.steamID.getSteam3RenderedID()}`);
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed(730, true);
  });

  client.on('error', (e) => {
    // Some error occurred during logon
    logger.error('Client error');
    logger.error(e);
  });

  client.on('webSession', () => {
    logger.info('Got web session');
    // Do something with these cookies if you wish
  });

  csgo.on('connectedToGC', () => {
    logger.info('Connected to CS:GO game coordinator');
  });

  csgo.on('inspectItemTimedOut', (assetid) => {
    logger.warn(`Inspect timed out for assetid ${assetid}`);
  });

  clients.push({
    client,
    csgo,
  });
});

class Inspector {
  static getClients() {
    return clients;
  }

  static inspect(url, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const client = _.sample(_.filter(clients, ((x) => x.csgo.haveGCSession)));

      if (_.isUndefined(client)) {
        reject(
          new Error('There is currently no client available with an active game coordinator connection'),
        );
      }

      client.csgo.inspectItem(url, (item) => {
        resolve(item);
      });

      setTimeout(() => {
        reject(new Error(`Inspection timed out after ${timeoutMs} ms`));
      }, timeoutMs);
    });
  }
}

module.exports = Inspector;
