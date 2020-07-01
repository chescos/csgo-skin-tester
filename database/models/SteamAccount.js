const Model = require('../base/BaseModel');

class SteamAccount extends Model {
  static get tableName() {
    return 'steam_accounts';
  }

  static get idColumn() {
    return 'id';
  }
}

module.exports = SteamAccount;
