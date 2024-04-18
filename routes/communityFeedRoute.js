

const express = require('express');
const communityFeedController = require('../controllers/communityFeedController');
const { authProtected } = require('../middleware/auth');
const router = express.Router();

router.get('/feeds', authProtected, communityFeedController.getAllFeed);
router.get('/feeds/:feedId', authProtected, communityFeedController.getFeed);
router.get('/feeds/:userId', authProtected, communityFeedController.getUserFeeds)

router.post('/feeds', authProtected, communityFeedController.createFeed);
router.delete('/feeds/:feedId', authProtected, communityFeedController.deleteFeed);
router.put('/feeds/:feedId/:userId', authProtected, communityFeedController.likeFeed);

module.exports = router;