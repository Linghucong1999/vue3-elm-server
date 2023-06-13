const express = require('express');
const Shop = require('../controller/shopping/shop.js');
const Category = require('../controller/shopping/category.js');

const router = express.Router();

router.get('/v2/restaurant/category', Category.getCategories);

module.exports = router;
