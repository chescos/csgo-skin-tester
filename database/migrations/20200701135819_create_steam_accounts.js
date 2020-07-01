exports.up = async (knex) => {
  await knex.schema.createTable('steam_accounts', (table) => {
    table.increments('id');
    table.string('username').notNullable().unique();
    table.string('password').notNullable();
    table.string('shared_secret').notNullable();
    table.timestamps(false, true);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('steam_accounts');
};
