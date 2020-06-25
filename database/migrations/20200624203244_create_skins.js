exports.up = async (knex) => {
  await knex.schema.createTable('skins', (table) => {
    table.increments('id');
    table.integer('item_id').notNullable().index();
    table.integer('paintkit_id').notNullable().index();
    table.string('name').notNullable().index();
    table.string('name_technical').notNullable().unique();
    table.string('image_url').notNullable();
    table.timestamps(false, true);

    table.foreign('item_id').references('id').inTable('items');
    table.foreign('paintkit_id').references('id').inTable('paintkits');
    table.unique(['item_id', 'paintkit_id']);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('skins');
};
