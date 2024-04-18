const express = require('express');
const router = express.Router();

const kycController =require('../controllers/kycController');
const { authProtected } = require('../middleware/auth');


// SUBMIT KYC PROCESSING DOCUMENTS
router.post('/submit-kyc', authProtected, kycController.implementKycProcesses);


// GET ALL OR SINGLE PENDING, APPROVED AND REJECTED KYC APPLICATIONS
router.get('/pending-kycs', kycController.allPendingKycDocuments);
router.get('/pending-kyc/:userId/:docId', kycController.pendingKycDocument);

router.get('/approved-kycs', kycController.allApprovedKycDocuments);
router.get('/rejected-kycs', kycController.allRejectedKycDocuments);


// APPROVE OR REJECT KYC DOCUMENT
router.get('/approve-kyc-doc/:userId/:docId', kycController.approvePendingKyc);
router.get('/reject-kyc-doc/:userId/:docId', kycController.rejectPendingKyc);

 
module.exports = router;