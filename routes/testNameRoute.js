const router = require('express').Router();

const controller = require('../controllers/testNameController');
const validator = require('../validators/testNameValidator');

router.post(
  '/',
  validator.store,
  controller.store,
);

module.exports = router;
