const Model = require('../base/BaseModel');

class Item extends Model {
  static get tableName() {
    return 'items';
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
          from: 'items.id',
          to: 'skins.item_id',
        },
      },
    };
  }
}

module.exports = Item;
