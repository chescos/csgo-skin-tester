const router = require('express').Router();

const controller = require('../controllers/itemController');

router.get(
  '/',
  controller.index,
);

module.exports = router;
