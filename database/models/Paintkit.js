const Model = require('../base/BaseModel');

class Paintkit extends Model {
  static get tableName() {
    return 'paintkits';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      skins: {
        relation: Model.HasManyRelation,
        modelClass: 'Skin',
        join: {
          from: 'paintkits.id',
          to: 'skins.paintkit_id',
        },
      },
    };
  }
}

module.exports = Paintkit;
