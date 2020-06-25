const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });
const { program } = require('commander');
const Encryption = require('../../modules/Encryption');
const logger = require('../../modules/Logger');

program
  .requiredOption('-p, --password <string>', 'The password of the account')
  .requiredOption('-s, --secret <string>', 'The shared secret of the account');

program.parse(process.argv);

const encryptedPassword = Encryption.encrypt(program.password);
const encryptedSecret = Encryption.encrypt(program.secret);

logger.info('Here is your encrypted account data', {
  password: encryptedPassword,
  sharedSecret: encryptedSecret,
});

process.exit();
