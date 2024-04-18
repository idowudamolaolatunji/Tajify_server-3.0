const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const Wallet = require('../models/walletModel');


// NAIRA WITHDRAWAL
exports.nairaWithdrawalRequest = async (req, res) => {
    try {
        // FIND THE RESQUESTING USER AND CHECK
        const requestingUser = await User.findById(req.user._id).select('+password');
        if(!requestingUser || !requestingUser.isActive) return res.json({ message: 'User not found!' });

        // 0. CHECK IF THE PROVIDED PASSWORD IS CORRECT
        if (!(await requestingUser?.comparePassword(req.body.password, requestingUser.password))) {
            return res.json({ message: "Incorrect password " });
        }

        
        // 1. IF HIS BALANCE IS LESS THAN THE REQUESTING AMOUNT
        const userWallet = await Wallet.findOne({ user: requestingUser._id });
        if(userWallet.nairaWalletBalance < req.body.amount) {
            return res.json({ message: 'Insufficient Naira balance to complete request!' });
        }
        
        // 2. IF THE REQUESTING AMOUNT IS LESS THAN THE SET MINIMUM WITHDRAWAL AMOUNT
        const minimumAmount = 10000;
        if(req.body.amount < minimumAmount) {
            return res.json({ message: 'Minimum Deposit is ₦10,000' });
        };

        // 3. DEBIT AND UPDATE THE USER 
        userWallet.nairaWalletBalance -= req.body.amount;
        await userWallet.save({});

        // CREATE A PENDING WITDRAWAL DOCUMENT
        const withdrawalRequest = await Transaction.create({
            user: requestingUser._id,
            amount: req.body.amount,
            reference: Date.now(),
            currency: 'naira',
            status: 'pending',
            type: 'withdrawal',
            charged: true,
            bankName: req.body.bankName,
            acctNumber: req.body.acctNumber,
            holderName: req.body.holderName,
        });

        res.status(201).json({
            status: 'success',
            message: 'Withdrawal request made, Await Approval!',
            data: {
                withdrawalRequest
            }
        });
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.messgae || 'Something went wrong!'
        })
    }
}


// GET ALL NAIRA WITHDRAWAL REQUEST
exports.getAllNairaWithdrawalRequest = async (req, res) => {
    try {
        // FINDING ALL DOCUMENT THAT MEETS THE FILTERINGS
        const allWithdrawalRequest = await Transaction.find({
            currency: 'naira',
            status: 'pending',
            type: 'withdrawal',
        });

        res.status(200).json({
            status: 'success',
            count: allWithdrawalRequest.length,
            data: {
                allWithdrawalRequest
            }
        });

    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}

// APPROVING NAIRA WITHDRAWAL REQUEST
exports.approveNairaWithdrawalRequest = async (req, res) => {
    try {
        // CHECKING IF THE REQUEST IS STILL PENDING FOR APPROVAL
        const withdrawalRequest = await Transaction.findById(req.params.requestId);
        if(!withdrawalRequest) {
            return res.json({ message: 'Withdrawal has either been processed, or cannot be found!' });
        }
        const withdrawalUser = await User.findById(withdrawalRequest.user._id);
        const userWallet = await Wallet.findOne({ user: withdrawalUser._id });

        // CHECKING IF THE REQUESTING AMOUNT HAS NOT BEEN DEDUCTED FROM THE USER'S ACCOUNT, THEN MAKE THE DEDUCTION FROM THE USER NAIRA WALLET
        if(!withdrawalRequest.charged) {
            if(userWallet.nairaWalletBalance >= withdrawalRequest.amount) {
                userWallet.nairaWalletBalance -= withdrawalRequest.amount;
                withdrawalRequest.status = 'success';
                await withdrawalRequest.save({});
                await userWallet.save({});
                return res.status(200).json({
                    status: 'success',
                    message: 'Withdrawal successful',
                });
            } else {
                withdrawalRequest.status = 'failed';
                await withdrawalRequest.save({});
                return res.json({
                    message: 'Withdrawal cannot be complete!, User no longer have suffiecient balance!',
                });
            }
        }

        // ELSE UPDATE THE WITHDRAWAL REQUEST
        withdrawalRequest.status = 'success';
        await withdrawalRequest.save({});

        res.status(200).json({
            status: 'success',
            message: 'Withdrawal successful',
        });

    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail'
        })
    }
}


// TAJI WITHDRAWAL
exports.tajiWithdrawalRequest = async (req, res) => {
    try {
        // FIND THE RESQUESTING USER AND CHECK
        const requestingUser = await User.findById(req.user._id).select('+password');
        if(!requestingUser || !requestingUser.isActive) return res.json({ message: 'User not found!' });

        // 0. CHECK IF THE PROVIDED PASSWORD IS CORRECT
        if (!(await requestingUser?.comparePassword(req.body.password, requestingUser.password))) {
            return res.json({ message: "Incorrect password " });
        }

        // 1. IF HIS TAJI BALANCE IS LESS THAN THE REQESTING WITDRAWAL AMOUNT
        const userWallet = await Wallet.findOne({ user: requestingUser._id });
        if(userWallet.tajiWalletBalance < req.body.amount) {
            return res.json({ message: 'Insufficient TAJI balance to complete request!' });
        }

        // 2. IF THE REQUESTING AMOUNT IS LESS THAN THE MINIMUM TAJI WITHDRAWAL AMOUNT
        const minimumAmount = 20000;
        if(req.body.amount < minimumAmount) {
            return res.json({ message: 'Minimum Deposit is 20,000 TAJI' })
        }

        // 3. DEBIT AND UPDATE THE USER 
        userWallet.tajiWalletBalance -= req.body.amount;
        await userWallet.save();

        const withdrawalRequest = await Transaction.create({
            user: requestingUser._id,
            amount: req.body.amount,
            reference: Date.now(),
            currency: 'taji',
            status: 'pending',
            type: 'withdrawal',
            charged: true,
            // REMOVE THE REQ.BODY...
            TAJIBEP20Address: req.body.tajiWalletAddress,
        });

        res.status(201).json({
            status: 'success',
            message: 'Withdrawal request made, Await Approval!',
            data: {
                withdrawalRequest
            }
        });

    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}


// GET ALL TAJI WITHDRAWAL REQUEST
exports.getAllTajiWithdrawalRequest = async (req, res) => {
    try {
        // FINDING ALL DOCUMENT THAT MEETS THE FILTERINGS
        const allWithdrawalRequest = await Transaction.find({
            currency: 'taji',
            status: 'pending',
            type: 'withdrawal',
        });

        res.status(200).json({
            status: 'success',
            count: allWithdrawalRequest.length,
            data: {
                allWithdrawalRequest,
            }
        });
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}


// APPROVE TAJI WITHDRAWAL REQUEST
exports.approveTajiWithdrawalRequest = async (req, res) => {
    try {
        // CHECKING IF THE REQUEST IS STILL PENDING FOR APPROVAL
        const withdrawalRequest = await Transaction.findById(req.params.requestId);
        if(!withdrawalRequest) {
            return res.json({
                message: 'Withdrawal has either been processed, or cannot be found!'
            });
        }
        const withdrawalUser = await User.findById(withdrawalRequest.user._id);
        const userWallet = await Wallet.findOne({ user: withdrawalUser._id });

       // CHECKING IF THE REQUESTING AMOUNT HAS NOT BEEN DEDUCTED FROM THE USER'S ACCOUNT, THEN MAKE THE DEDUCTION FROM THE USER TAJI WALLET
        if(!withdrawalRequest.charged) {
            if(userWallet.tajiWalletBalance >= withdrawalRequest.amount) {
                userWallet.tajiWalletBalance -= withdrawalRequest.amount;
                withdrawalRequest.status = 'success';
                await withdrawalRequest.save({});
                await userWallet.save();
                return res.status(200).json({
                    status: 'success',
                    message: 'Withdrawal successful',
                });
            } else {
                withdrawalRequest.status = 'failed';
                await withdrawalRequest.save({});
                return res.json({
                    message: 'Withdrawal cannot be complete!, User no longer have suffiecient balance!',
                });
            }
        }

        // ELSE UPDATE THE WITHDRAWAL REQUEST
        withdrawalRequest.status = 'success';
        await withdrawalRequest.save({});

        res.status(200).json({
            status: 'success',
            message: 'Withdrawal successful',
        });
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        });
    }
}

