const SteamUser = require('steam-user');
const GlobalOffensive = require('globaloffensive');
const SteamTotp = require('steam-totp');
const async = require('async');
const logger = require('./Logger');
const Encryption = require('./Encryption');
const SteamAccount = require('../database/models/SteamAccount');

class Inspector {
  constructor() {
    this.clients = [];

    SteamAccount.query().then((steamAccounts) => {
      steamAccounts.forEach((steamAccount) => {
        this.addClient(
          steamAccount.username,
          Encryption.decrypt(steamAccount.password),
          Encryption.decrypt(steamAccount.shared_secret),
        );
      });
    });

    setInterval(() => {
      for (let i = 0; i < this.clients.length; i += 1) {
        // Mark clients as not busy if they have been busy for more than 10 seconds.
        if (this.clients[i].busySince && Date.now() > (this.clients[i].busySince + 10000)) {
          this.clients[i].busySince = null;
          logger.info(`Marked client ${i} as not busy after 10 second timeout`);
        }
      }
    }, 1000);
  }

  addClient(username, password, sharedSecret) {
    const client = new SteamUser({
      // This is necessary for `ownsApp` to work.
      enablePicsCache: true,
    });

    const csgo = new GlobalOffensive(client);

    client.logOn({
      accountName: username,
      password,
      twoFactorCode: SteamTotp.getAuthCode(sharedSecret),
      autoRelogin: true,
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

    client.on('disconnected', (eresult, msg) => {
      // We got disconnected from Steam.
      logger.warn('Disconnected from Steam', {
        eresult,
        msg,
      });
    });

    client.on('webSession', () => {
      logger.info('Got web session');
      // Do something with these cookies if you wish
    });

    csgo.on('connectedToGC', () => {
      logger.info('Connected to CS:GO game coordinator');
    });

    csgo.on('disconnectedFromGC', (reason) => {
      logger.warn('Disconnected from CS:GO game coordinator', { reason });
    });

    csgo.on('inspectItemTimedOut', (assetid) => {
      logger.warn(`Inspect timed out for assetid ${assetid}`);
    });

    this.clients.push({
      client,
      csgo,
      busySince: null,
    });
  }

  inspect(url, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
      // We'll want a timeout of at least 1500 ms.
      if (timeoutMs < 1500) {
        throw new Error('The specified timeout must be at least 1500 ms');
      }

      // Make sure that the promise is rejected after the timeout.
      setTimeout(() => {
        reject(new Error(`Inspection timed out after ${timeoutMs} ms`));
      }, timeoutMs);

      // Set the retry interval and the number of retries.
      // We subtract 1000 ms from the `timeoutMs` because we'll need some time
      // for the inspection too.
      const retryInterval = 100;
      const retryTimes = Math.round((timeoutMs - 1000 / retryInterval));

      // Find an index of a client that is currently not busy and has a GC connection.
      async
        .retry({ times: retryTimes, interval: retryInterval }, async () => {
          const index = this.clients.findIndex(
            (client) => client.busySince === null && client.csgo.haveGCSession,
          );

          if (index === -1) {
            throw new Error(
              'There is currently no client available with an active game coordinator connection',
            );
          }

          return index;
        })
        .then((index) => {
          // Mark the client as busy so that it won't be used for other inspections.
          // If the inspection succeeds, `busySince` will be cleared immediately.
          // If the inspection times out, `busySince` will be cleared after within
          // 1 second after the timeout.
          this.clients[index].busySince = Date.now();

          this.clients[index].csgo.inspectItem(url, (item) => {
            this.clients[index].busySince = null;
            resolve(item);
          });
        });
    });
  }
}

const inspector = new Inspector();

module.exports = inspector;
