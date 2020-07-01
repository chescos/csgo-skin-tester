const config = require('config');
const SteamUser = require('steam-user');
const GlobalOffensive = require('globaloffensive');
const SteamTotp = require('steam-totp');
const _ = require('lodash');
const logger = require('./Logger');
const Encryption = require('./Encryption');

const accounts = config.get('steam.accounts').map((account) => ({
  username: account.username,
  password: Encryption.decrypt(account.password),
  sharedSecret: Encryption.decrypt(account.sharedSecret),
}));

const clients = [];

accounts.forEach((account) => {
  const client = new SteamUser({
    // This is necessary for `ownsApp` to work.
    enablePicsCache: true,
  });

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

  client.on('appOwnershipCached', () => {
    // If the account does not own CS:GO yet, claim the free license first.
    // This is necessary to connect to the game coordinator via `gamesPlayed`,
    // and `gamesPlayed` is necessary to inspect skins.
    if (!client.ownsApp(730)) {
      client.requestFreeLicense(730, (err) => {
        if (err) {
          logger.warn('Failed to acquire lisence for CS:GO');
          logger.error(err);
        } else {
          logger.info('Successfully acquired license for CS:GO');
          client.gamesPlayed(730, true);
        }
      });
    }
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

  static inspect(url, timeoutMs = 3000) {
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
