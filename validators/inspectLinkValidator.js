const { body } = require('express-validator');
const validate = require('../middlewares/validateInput');

exports.store = validate([
  body('link')
    .exists()
    .isString()
    .isLength({ min: 1, max: 5000 }),
]);
