const { body } = require('express-validator');
const validate = require('../middlewares/validateInput');

const maxInteger = 2147483648;

exports.store = validate([
  body('skin_id')
    .exists()
    .isInt({ min: 1, max: maxInteger })
    .toInt(),

  body('wear')
    .optional()
    .isFloat({ min: 0.00000000000000001, max: 0.99999999999999999 }),

  body('seed')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .toInt(),

  body('stattrak')
    .optional()
    .isInt({ min: -1, max: 999999 })
    .toInt(),

  body('ip')
    .optional()
    .isString()
    .isIP(4),
]);
