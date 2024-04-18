const User = require('../models/userModel');
const Kyc = require('../models/kycModel');



// IMPLEMENT KYC PROCESSES
exports.implementKycProcesses = async (req, res) => {
	try {
		// GET THE CURRENT REQUESTING USER AND TAKE THE REQ BODY
		const kycUser = await User.findById(req.user._id);
		const kycSubmission = await Kyc.create({
			user: kycUser._id,
			homeAddress: req.body.homeAddress,
			documentType: req.body.documentType,
			documentImage: req.body.documentImage,
			utilBillType: req.body.utilBillType,
			utilBillImage: req.body.utilBillImage,
			status: 'pending'
		});

		res.status(201).json({
			status: 'success',
			message: 'KYC Submitted!',
			data: {
				kycSubmission
			}
		})

	} catch(err) {
		console.log(err);
		return res.status(400).json({
			status: 'fail',
			message: err.message || 'Something went wrong!'
		});
	}
}


// ALL PENDING KYC DOCUMENT
exports.allPendingKycDocuments = async (req, res) => {
	try {
		const pendingKycDocs = await Kyc.find({ status: 'pending' });
		res.status(200).json({
			status: 'success',
			count: pendingKycDocs.length,
			data: {
				pendingKycDocs
			}
		});
	} catch(err) {
		console.log(err);
		return res.status(400).json({
			status: 'fail',
			message: err.message || 'Something went wrong!'
		});
	}
}


// SINGLE PENDING KYC DOCUMENT BY ID PARAMS
exports.pendingKycDocument = async (req, res) => {
	try {
		const pendingDoc = await Kyc.findOne({
			_id: req.params.docId,
			user: req.params.userId,
			status: 'pending',
		});
		if(!pendingDoc) return res.status(404).json({ message: 'KYC has either been approved!, or cannot be found!'});

		res.status(200).json({
			status: 'success',
			data: {
				pendingDoc
			}
		});
	} catch(err) {
		console.log(err);
		return res.status(400).json({
			status: 'fail',
			message: err.message || 'Something went wrong!'
		});
	}
}


// ALL APPROVED KYC DOCUMENT
exports.allApprovedKycDocuments = async (req, res) => {
	try {
		const approvedKycDoc = await Kyc.find({ status: 'approved' });
		res.status(200).json({
			status: 'success',
			count: approvedKycDoc.length,
			data: {
				approvedKycDoc
			}
		});
	} catch(err) {
		console.log(err);
		return res.status(400).json({
			status: 'fail',
			message: err.message || 'Something went wrong!'
		});
	}
}


// ALL REJECTED KYC DOCUMENT
exports.allRejectedKycDocuments = async (req, res) => {
	try {
		const rejectedKycDocument = await Kyc.find({ status: 'rejected' });
		res.status(200).json({
			status: 'success',
			count: rejectedKycDocument.length,
			data: {
				rejectedKycDocument
			}
		});
	} catch(err) {
		console.log(err);
		return res.status(400).json({
			status: 'fail',
			message: err.message || 'Something went wrong!'
		});
	}
}


// KYC APPROVAL BY ADMIN
exports.approvePendingKyc = async (req, res) => {
	try {
		// GET THE KYC USER AND THE PARTICULAR PENDING KYC DOCUMENT
		const kycUser = await User.findById(req.params.userId);
		const kycDoc = await Kyc.findOne({ _id: req.params.docId, user: kycUser._id });
		console.log(kycUser, kycDoc);

		if(kycDoc.status === 'approved') return res.json({ message: 'This KYC Document has already been approved!' });
		if(kycDoc.status === 'rejected') return res.status(400).json({ message: 'This KYC Document has already been rejected, Restart KYC process all over!' });
		

		// UPDATE THE COMPLETED KYC USER AND THE KYC DOCUMENT 
		kycUser.isCompletedKyc = true;
		kycDoc.status = 'approved';
		kycUser.save({ validateBeforeSave: false });
		kycDoc.save({});

		// SEND 1000 TAJI TO THE INVITER WALLET
		if(kycUser.myInviterID) {
			const myInviter = await User.findById(kycUser.myInviterID);
			const userWallet = await Wallet.findOne({ user: myInviter._id });
			userWallet.tajiWalletBalance += 1000;
			await userWallet.save();
		}

		res.status(200).json({
			status: 'success',
			message: 'KYC approved :)!',
			data: {
				kycUser,
				kycDoc
			}
		});
	} catch(err) {
		console.log(err);
		return res.status(400).json({
			status: 'fail',
			message: err.message || 'Something went wrong!'
		});
	}
}


// KYC REJECTION BY ADMIN
exports.rejectPendingKyc = async (req, res) => {
	try {
		// GET THE KYC USER AND THE PARTICULAR PENDING KYC DOCUMENT
		const kycUser = await User.findById(req.params.userId);
		const kycDoc = await Kyc.findOne({ _id: req.params.docId, user: kycUser._id });

		if(kycDoc.status === 'approved') return res.json({ message: 'This KYC Document has already been approved!' });
		if(kycDoc.status === 'rejected') return res.json({ message: 'This KYC Document has already been rejected, Restart KYC process all over!' });

		// UPDATE THE COMPLETED KYC USER AND THE KYC DOCUMENT 
		kycDoc.status = 'rejected';
		kycDoc.save({});

		res.status(200).json({
			status: 'success',
			message: 'KYC Rejected :(!',
			data: {
				kycDoc
			}
		});
	} catch(err) {
		console.log(err);
		return res.status(400).json({
			status: 'fail',
			message: err.message || 'Something went wrong!'
		});
	}
}

