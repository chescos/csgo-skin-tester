const { body } = require('express-validator');
const validate = require('../middlewares/validateInput');

exports.store = validate([
  body('market_hash_name')
    .exists()
    .isString()
    .isLength({ min: 1, max: 255 }),

  body('seed')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .toInt(),

  body('paintkit')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .toInt(),

  body('ip')
    .optional()
    .isString()
    .isIP(4),
]);
