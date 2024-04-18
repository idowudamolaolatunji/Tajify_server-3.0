const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchController.search);
router.post('/subscribe-newsletter', searchController.newsLetter)

module.exports = router;