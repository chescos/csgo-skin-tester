const path = require('path');
const { Model } = require('objection');
const BaseQueryBuilder = require('./BaseQueryBuilder');

class BaseModel extends Model {
  static get modelPaths() {
    return [path.join(__dirname, '..', 'models')];
  }

  static get QueryBuilder() {
    return BaseQueryBuilder;
  }

  static get useLimitInFirst() {
    return true;
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = BaseModel;
