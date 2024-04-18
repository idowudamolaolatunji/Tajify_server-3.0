const verifyPayment = require('../utils/verifyPayment');

const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const Wallet = require('../models/walletModel');


// NAIRA DEPOSITS
exports.depositNaira = async (req, res) => {
    try {
        const { reference, charges } = req.params;
        console.log(reference, charges)
        // VERIFY PAYSTACK PAYMENT WITH THE REFERNECE PARAMS
        const paymentVerification  = await verifyPayment(reference);

        // FIND THE CURRENT USER
        const currentUser = await User.findById(req.user._id);
        if(!currentUser) {
            return res.json({
                message: 'User Not Found!'
            });
        }

        // GET THE RESPONSE DATA
        const response = paymentVerification.data.data;
        console.log(response);

        // HANDLE PAYMENT VERIFICATION STATUS
        if (paymentVerification.status !== 200) {
            return res.status(400).json({
                status: 'fail',
                message: 'Unable to verify payment',
            });
        }

        // UPDATE THE USER WALLET BALANCE
        const amount = (Number(response.amount) / 100) - charges;

        const userWallet = await Wallet.findOne({ user: currentUser._id });
        userWallet.nairaWalletBalance += amount;
        await currentUser.save({ validateBeforeSave: false });

        // CREATE TRANSACTION DOCUMENT
        const newDeposit = await Transaction.create({
            user: currentUser.id,
            amount,
            reference: response.reference,
            currency: 'naira',
            status: 'success',
            type: 'deposit'

            // LATER ADD THE ACCOUNT DETAILS
        });

        res.status(200).json({
            status: 'success',
            message: 'Naira Deposited Successfully',
            data: {
                newDeposit,
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong',
        })
    }
}



// DEPOSIT TAJI
exports.depositTaji = async (req, res) => {
    try {
        const { amount } = req.body
        // FIND CURRENT USER BASED ON THE REQUESTING USER
        const userId = req.user._id;
        const currentUser = await User.findById(userId);
        if(!currentUser) return res.json({message: 'User not found'});

        if(!amount || amount < 10000 ) {
            return res.json({
                message: 'You cannot deposit below TAJI 10,000'
            });
        }

        // ALSO CREATE A TRANSACTION DOCUMENT
        const newDeposit = await Transaction.create({
            user: userId,
            amount: req.body.amount,
            reference: Date.now(),
            currency: 'taji',
            status: 'pending',
            type: 'deposit',
            transactionHash: req.body.transactionHash,
        });
        
        res.status(200).json({
            status:'success',
            message: 'Taji Deposited Pending!',
            data: {
                newDeposit
            }
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong',
        })
    }
}



// GET ALL TAJI DEPOSIT
exports.getEveryPendingTajiDeposits = async (req, res) => {
    try {
        // FIND ALL TRANSACTION DOCUMENT BASED ON SOME FILTERINGS
        const allPendingTajiDeposit = await Transaction.find({ currency: 'taji', status: 'pending', type: 'deposit' });

        res.status(200).json({
			status: "success",
            count: allPendingTajiDeposit.length,
			data: {
				allPendingTajiDeposit,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err || "Something went wrong",
		});
	}
}


// GET SINGLE TAJI DEPOSIT
exports.getPendingTajiDepositById = async (req, res) => {
    try {
        // FIND SINGLE TRANSACTION DOCUMENT BASED ON SOME FILTERINGS AND ID
        const pendingTajiDeposit = await Transaction.findOne({ currency: 'taji', status: 'pending', _id: req.params.depositId });
        
        if(!pendingTajiDeposit) return res.status(404).json({ message: 'Deposit has either been approved!, or cannot be found!'});

        res.status(200).json({
			status: "success",
			data: {
				pendingTajiDeposit,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err || "Something went wrong",
		});
	}
}


// GET EVERY TAJI DEPOSIT FOR A CERTAIN USER
exports.getEveryPendingTajiDepositForUser = async (req, res) => {
    try {
        // FIND ALL TRANSACTION DOCUMENT BASED ON SOME FILTERINGS AND CURRENT USER ID
        const userPendingDeposits = await Transaction.find({ currency: 'taji', status: 'pending', user: req.params.userId });

        res.status(200).json({
			status: "success",
            count: userPendingDeposits.length,
			data: {
				userPendingDeposits,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err || "Something went wrong",
		});
	}
}


// APPROVING TAJI DEPOSIT
exports.approveTajiDeposit = async (req, res) => {
    try {
        // FIND TRANSACTION DOCUMENT (ID HERE BELONGS TO THE TRANSACTION DOCUMENT ID)
        const pendingTajiDoc = await Transaction.findById(req.params.depositId);
        if(!pendingTajiDoc) return res.status(404).json({ message: 'Taji Deposit Not Found!' });

        // GET THE USER THAT MADE THAT DEPOSIT AND UPDATE HIS WALLET BALANCE
        const depositUser = await User.findById(pendingTajiDoc.user._id)
        if(!depositUser) return res.status(404).json({ message: 'Cannot find user that made deposit!' });

        const userWallet = await Wallet.findOne({ user: depositUser._id });
        userWallet.tajiWalletBalance += pendingTajiDoc.amount;

        // UPDATE OTHER NECESSARIES
        pendingTajiDoc.status = 'success'
        await depositUser.save();
        await pendingTajiDoc.save();

        res.status(200).json({
            status: 'success',
            message: 'Deposit Approved!',
            data: {
                pendingTajiDoc,
                depositUser
            }
        })

    } catch(err) {
        console.log(err)
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something Went Wrong!'
        })
    }
}


// GET ALL APPROVED TAJI DEPOSIT
exports.getAllApprovedTajiDeposits = async (req, res) => {
    try {
        // FIND ALL TRANSACTION DOCUMENT BASED ON SOME FILTERINGS
        const approvedTajiDeposit = await Transaction.find({ currency: 'taji', status: 'success' });

        res.status(200).json({
			status: "success",
            count: approvedTajiDeposit.length,
			data: {
				approvedTajiDeposit,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err || "Something went wrong",
		});
	}
}


// GET ALL APPROVED TAJI DEPOSIT FOR A CERTAIN USER
exports.getAllApprovedTajiDepositsForUser = async (req, res) => {
    try {
        // FIND ALL TRANSACTION DOCUMENT BASED ON SOME FILTERINGS
        const userApprovedDeposits = await Transaction.find({ currency: 'taji', status: 'success', user: req.params.userId });

        res.status(200).json({
			status: "success",
            count: userApprovedDeposits.length,
			data: {
				userApprovedDeposits,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err || "Something went wrong",
		});
	}
}
