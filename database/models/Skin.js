const Model = require('../base/BaseModel');

class Skin extends Model {
  static get tableName() {
    return 'skins';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      item: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'Item',
        join: {
          from: 'skins.item_id',
          to: 'items.id',
        },
      },

      paintkit: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'Paintkit',
        join: {
          from: 'skins.paintkit_id',
          to: 'paintkits.id',
        },
      },
    };
  }
}

module.exports = Skin;
