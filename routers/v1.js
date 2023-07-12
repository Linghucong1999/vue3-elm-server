const express = require('express');

const Captchas = require('../controller/v1/captchas.js');
const User = require('../controller/v2/user.js');

const router = express.Router();

router.post('/captchas', Captchas.getCaptchas);

router.get('/user', User.getInfo);
router.get('/user/:user_id', User.getInfoById);
router.get('/users/list', User.getUserList);
router.get('/users/count', User.getUserCount);
router.get('/user/city/count', User.getUserCity);

module.exports = router;