exports.up = async (knex) => {
  await knex.schema.createTable('paintkits', (table) => {
    table.increments('id');
    table.string('name').notNullable().index();
    table.string('name_technical').notNullable().unique();
    table.integer('defindex').notNullable().unique();
    table.timestamps(false, true);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('paintkits');
};
