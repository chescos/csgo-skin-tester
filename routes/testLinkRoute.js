const router = require('express').Router();

const controller = require('../controllers/testLinkController');
const validator = require('../validators/testLinkValidator');

router.post(
  '/',
  validator.store,
  controller.store,
);

module.exports = router;
