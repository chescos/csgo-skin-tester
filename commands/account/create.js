const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });
const { program } = require('commander');

require('../../database');
const SteamAccount = require('../../database/models/SteamAccount');
const Encryption = require('../../modules/Encryption');
const logger = require('../../modules/Logger');

program
  .requiredOption('-u, --username <string>', 'The username of the Steam account')
  .requiredOption('-p, --password <string>', 'The password of the Steam account')
  .requiredOption('-s, --secret <string>', 'The shared secret of the Steam account');

program.parse(process.argv);

(async () => {
  const steamAccount = await SteamAccount.query().insert({
    username: program.username,
    password: Encryption.encrypt(program.password),
    shared_secret: Encryption.encrypt(program.secret),
  });

  logger.info(`Successfully created Steam account with username ${steamAccount.username}`);

  process.exit();
})();
