const Knex = require('knex');
const { Model } = require('objection');
const knexConfig = require('../knexfile.js');

// Initialize knex.
const knex = Knex(knexConfig);

// Bind all Models to the knex instance.
// This only needs to be done once before any models can be used.
Model.knex(knex);

module.exports = knex;
