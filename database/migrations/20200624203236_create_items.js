exports.up = async (knex) => {
  await knex.schema.createTable('items', (table) => {
    table.increments('id');
    table.string('name').notNullable().unique();
    table.string('name_technical').notNullable().unique();
    table.integer('defindex').notNullable().unique();
    table.string('image_url').notNullable();
    table.string('class').notNullable().index();
    table.string('type').notNullable().index();
    table.timestamps(false, true);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('items');
};
