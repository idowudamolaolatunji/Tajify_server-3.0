
const express = require('express');
const transactionController = require('../controllers/transactionController');
const { authProtected } = require('../middleware/auth');

const router = express.Router();


// GET ALL TRANSACTIONS
router.get('/', transactionController.allTransactions);


// (remember to change the route on the admin)
router.get('/pending/deposits', transactionController.allPendingDeposits)
router.get('/pending/withdrawals', transactionController.allPendingWithdrawals)


// CURRENT USER TRANSACTIONS 
router.get('/deposits', authProtected, transactionController.myTransactionDeposits);
router.get('/withdrawals', authProtected, transactionController.myTransactionWithdrawals);
router.get('/stakings', authProtected, transactionController.myTransactionStakings);
router.get('/purchases', authProtected, transactionController.myTransactionPurchases);

module.exports = router;