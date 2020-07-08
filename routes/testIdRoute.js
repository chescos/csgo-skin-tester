const router = require('express').Router();

const controller = require('../controllers/testIdController');
const validator = require('../validators/testIdValidator');

router.post(
  '/',
  validator.store,
  controller.store,
);

module.exports = router;
