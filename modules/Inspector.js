const SteamUser = require('steam-user');
const GlobalOffensive = require('globaloffensive');
const SteamTotp = require('steam-totp');
const async = require('async');
const logger = require('./Logger');
const Encryption = require('./Encryption');
const SteamAccount = require('../database/models/SteamAccount');

class Inspector {
  constructor() {
    // The time in milliseconds between two inspection attempts.
    this.inspectionInterval = 1100;
    // The time in milliseconds after which an inspection is considered a failure.
    this.inspectionTimeout = 3000;
    // The time in milliseconds between two select attempts.
    this.selectInterval = 100;
    // The time in milliseconds after which selecting a non-busy bot is considered a failure.
    this.selectTimeout = 5000;

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
      const gracePeriod = this.inspectionTimeout + 1000;

      for (let i = 0; i < this.clients.length; i += 1) {
        // Mark clients as not busy if they have been busy for too long.
        if (this.clients[i].busy && Date.now() > (this.clients[i].startedAt + gracePeriod)) {
          this.clients[i].busy = false;
          logger.info(`Marked client ${i} as not busy after ${gracePeriod} ms timeout`);
        }
      }
    }, 1000);

    setInterval(() => {
      logger.info('Inspector bot status', {
        total: this.clients.length,
        connectedToSteam: this.clients.filter((client) => !!client.client.steamID).length,
        connectedToCsgo: this.clients.filter((client) => client.csgo.haveGCSession).length,
        busy: this.clients.filter((client) => client.busy === true).length,
        busyCooldown: this.clients.filter(
          (client) => client.startedAt + this.inspectionInterval >= Date.now(),
        ).length,
      });
    }, 10000);
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
      logger.info(`Logged into Steam as ${client.steamID.getSteamID64()}`);
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
            logger.warning('Failed to acquire license for CS:GO');
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
      logger.warning('Disconnected from Steam', {
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
      logger.warning('Disconnected from CS:GO game coordinator', { reason });
    });

    csgo.on('inspectItemTimedOut', (assetid) => {
      logger.warning(`Inspect timed out for assetid ${assetid}`);
    });

    this.clients.push({
      client,
      csgo,
      startedAt: 0,
      busy: false,
    });
  }

  inspect(url) {
    return new Promise((resolve, reject) => {
      // Set the number of retries.
      const retryTimes = Math.round(this.selectTimeout / this.selectInterval);

      // Find an index of a client that is currently not busy and has a GC connection.
      async
        .retry({ times: retryTimes, interval: this.selectInterval }, async () => {
          const index = this.clients.findIndex(
            (client) => client.busy === false
              && client.startedAt + this.inspectionInterval < Date.now()
              && client.csgo.haveGCSession,
          );

          if (index === -1) {
            throw new Error(
              'There is currently no client available with an active game coordinator connection',
            );
          }

          // Mark the client as busy so that it won't be used for other inspections.
          // If the inspection succeeds, `busy` will be cleared immediately.
          // If the inspection times out, `busy` will be cleared after within
          // 1 second after the timeout.
          this.clients[index].busy = true;
          this.clients[index].startedAt = Date.now();

          return index;
        })
        .then((index) => {
          this.clients[index].csgo.inspectItem(url, (item) => {
            this.clients[index].busy = false;
            resolve(item);
          });

          // Make sure that the promise is rejected after the timeout.
          setTimeout(() => {
            reject(new Error(`Inspection timed out after ${this.inspectionTimeout} ms`));
          }, this.inspectionTimeout);
        })
        .catch((error) => reject(error));
    });
  }
}

const inspector = new Inspector();

module.exports = inspector;
