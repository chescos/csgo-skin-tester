const router = require('express').Router();

const controller = require('../controllers/inspectLinkController');
const validator = require('../validators/inspectLinkValidator');

router.post(
  '/',
  validator.store,
  controller.store,
);

module.exports = router;
