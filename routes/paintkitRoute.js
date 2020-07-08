const router = require('express').Router();

const controller = require('../controllers/paintkitController');

router.get(
  '/',
  controller.index,
);

module.exports = router;
