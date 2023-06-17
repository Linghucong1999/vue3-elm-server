const express = require('express');
const Admin = require('../controller/admin/admin.js');
const router = express.Router();

router.post('/login', Admin.login);


module.exports = router;