const router = require('express').Router();

const controller = require('../controllers/skinController');

router.get(
  '/',
  controller.index,
);

module.exports = router;
