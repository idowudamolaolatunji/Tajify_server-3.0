const express = require('express');
const router = express.Router();

const stakeController = require('../controllers/stakeController');
const { authProtected } = require('../middleware/auth');

// STAKEHOLDER AND STAKING ROUTES
router.post('/stakeholder-staking', authProtected, stakeController.createStaking);
router.get('/all-stakings', stakeController.getAllStaking)
router.get('/all-stakeholders', stakeController.getAllStakeHolders)
router.get('/stakeholder/:stakeHolderId', stakeController.getStakeHolder)

// router.get('/stakeholder/myStakings', authProtected, stakeController.getMyStakings)


module.exports = router;
