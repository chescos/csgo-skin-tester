const config = require('config');
const async = require('async');
const pg = require('pg');

// In order to enable SSL, it seems to be enough to set `pg.defaults.ssl`
// to `true` or to an empty object. With Heroku however, we also need to
// explicitly allow self-signed SSL certificates. That's why we set
// `rejectUnauthorized` to `false`.
if (config.get('database.ssl')) {
  pg.defaults.ssl = {
    rejectUnauthorized: false,
  };
}

module.exports = {
  client: 'pg',
  connection: config.get('database.url'),
  debug: config.get('database.debug'),
  migrations: {
    directory: './database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './database/seeds',
  },
  acquireConnectionTimeout: 10000,
  pool: {
    min: config.get('database.connections.min'),
    max: config.get('database.connections.max'),
    // This method can be used to execute SQL statements right after a
    // connection has been established.
    afterCreate: (conn, done) => {
      const queries = [
        // Terminate any session with an open transaction that has been idle
        // for longer than the specified duration in milliseconds.
        `set idle_in_transaction_session_timeout to ${config.get('database.transactionTimeout')};`,

        // Abort any statement that takes more than the specified number of
        // milliseconds, starting from the time the command arrives at the
        // server from the client.
        `set statement_timeout to ${config.get('database.queryTimeout')};`,
      ];

      async.eachSeries(queries, async (query) => new Promise((resolve, reject) => {
        // Execute the query and wait for the callback to check if any
        // error occurred.
        conn.query(query, (error) => {
          if (error) {
            // The query returned an error, we'll have to abort the further
            // execution of any remaining queries and return the error.
            reject(error);
          } else {
            // The query successfully completed, we can execute the next one.
            resolve();
          }
        });
      }))
        .then(() => {
          // All queries have been successfully run and no error occurred.
          // Tell Knex that we're done with the setup of the connection.
          done(false, conn);
        })
        .catch((error) => {
          // If `error` is not falsy, the connection is discarded from the pool.
          // If connection acquire was triggered by a query, then the error is
          // passed to query promise.
          done(error, conn);
        });
    },
  },
};
