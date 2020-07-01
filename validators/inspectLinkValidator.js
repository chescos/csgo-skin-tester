const { body } = require('express-validator');
const validate = require('../middlewares/validateInput');

const inspectLinkRegex = /^steam:\/\/rungame\/730\/(?:[0-9]+)\/\+csgo_econ_action_preview/;

exports.store = validate([
  body('link')
    .exists()
    .isString()
    .custom((value) => {
      if (!inspectLinkRegex.test(value)) {
        throw new Error('Whoops, looks like the given inspect link is invalid.');
      }

      return true;
    }),

  body('ip')
    .optional()
    .isString()
    .isIP(4),
]);
