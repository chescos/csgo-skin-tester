const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });
const { program } = require('commander');

require('../../database');
const SteamAccount = require('../../database/models/SteamAccount');
const logger = require('../../modules/Logger');

program.requiredOption('-u, --username <string>', 'The username of the Steam account');

program.parse(process.argv);

(async () => {
  const [steamAccount] = await SteamAccount.query()
    .where('username', program.username)
    .delete()
    .returning('*');

  if (!steamAccount) {
    logger.error(`The Steam account with username ${program.username} does not exist.`);
  } else {
    logger.info(`Successfully deleted Steam account with username ${steamAccount.username}`);
  }

  process.exit();
})();
