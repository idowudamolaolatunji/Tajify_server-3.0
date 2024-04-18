const express = require("express");
const depositController = require("../controllers/depositController");
const withdrawalController = require("../controllers/withdrawalController");
const { authProtected } = require("../middleware/auth");

const router = express.Router();

// NAIRA DEPOSIT (PAYSTACK VERIFICATION) ROUTE
router.get('/payment-verification/:reference/:charges', authProtected, depositController.depositNaira);

// TAJI DEPOSIT ROUTES
router.post('/deposit-taji', authProtected, depositController.depositTaji);
router.get('/pending-taji-deposits', depositController.getEveryPendingTajiDeposits);
router.get('/pending-taji-deposit/:depositId', depositController.getPendingTajiDepositById);
router.get('/user-pending-tajis/:userId', depositController.getEveryPendingTajiDepositForUser);

// ADMIN APPROVES PENDING TAJI DEPOSIT ROUTE
router.get('/approve-taji-deposit/:depositId', depositController.approveTajiDeposit);
router.get('/approved-tajis', depositController.getAllApprovedTajiDeposits);
router.get('/user-approved-tajis/:userId', depositController.getAllApprovedTajiDepositsForUser);

// NAIRA WITHDRAWAL ROUTE
router.post('/withdraw-naira', authProtected, withdrawalController.nairaWithdrawalRequest);
router.get('/naira-withdraw-requests', withdrawalController.getAllNairaWithdrawalRequest);

// TAJI WITHDRAWAL ROUTE
router.post('/withdraw-taji', authProtected, withdrawalController.tajiWithdrawalRequest);
router.get('/taji-withdraw-requests', withdrawalController.getAllTajiWithdrawalRequest);

// ADMIN APPROVES PENDING TAJI AND NAIRA ROUTES
router.get('/approve-naira-withdrawal/:requestId', withdrawalController.approveNairaWithdrawalRequest);
router.get('/approve-taji-withdrawal/:requestId', withdrawalController.approveTajiWithdrawalRequest);


module.exports = router;