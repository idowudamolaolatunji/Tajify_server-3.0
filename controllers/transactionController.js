const Transaction = require('../models/transactionModel');

// GET ALL TRANSACTION REGARDLESS WITHDRAWAL, DEPOSIT, REWARDS, STAKING
exports.allTransactions = async(req, res) => {
    try {
        const transactions = await Transaction.find({});
        res.status(200).json({
            status: 'success',
            data: {
                transactions,
            }
        })
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}


// GET ALL PENDING WITHDRAWALS
exports.allPendingWithdrawals = async(req, res) => {
    try {
        const transactions = await Transaction.find({
            status: 'pending',
            type: 'withdrawal'
        });
        res.status(200).json({
            status: 'success',
            count: transactions.length,
            data: {
                transactions,
            }
        })
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}



// GET ALL PENDING DEPOSITS
exports.allPendingDeposits = async(req, res) => {
    try {
        const transactions = await Transaction.find({
            status: 'pending',
            type: 'deposit'
        });
        res.status(200).json({
            status: 'success',
            count: transactions.length,
            data: {
                transactions,
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




// GET CURRENT USER'S WITHDRAWAL TRANSACTIONS (BOTH TAJI AND NAIRA)
exports.myTransactionWithdrawals = async (req, res) => {
    try {
        // GET WITHDRAWAL TRANSACTIONS FOR THE CURRENT USER
        const myTransactions = await Transaction.find({ user: req.user._id, type: 'withdrawal' }).sort({ updatedAt: -1, createdAt: -1 });

        res.status(200).json({
            status: 'success',
            count: myTransactions.length,
            data: {
                myTransactions,
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



// GET CURRENT USER'S DEPOSIT TRANSACTIONS (BOTH TAJI AND NAIRA)
exports.myTransactionDeposits = async (req, res) => {
    try {
        // GET DEPOSIT TRANSACTIONS FOR THE CURRENT USER
        const myTransactions = await Transaction.find({ user: req.user._id, type: 'deposit' }).sort({ updatedAt: -1, createdAt: -1 });

        res.status(200).json({
            status: 'success',
            count: myTransactions.length,
            data: {
                myTransactions,
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



// GET CURRENT USER'S STACKING TRANSACTIONS
exports.myTransactionStakings = async (req, res) => {
    try {
        // FIND ALL THE STACKING TRANSACTION DOCS.
        const myTransactions = await Transaction.find({ user: req.user._id, currency: 'others', type: 'staking' }).sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            count: myTransactions.length,
            data: {
                myTransactions
            }
        })

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}



// GET CURRENT USER'S OTHER PURCHASES TRANSACTIONS
exports.myTransactionPurchases = async (req, res) => {
    try {
        // FIND ALL THE STACKING TRANSACTION DOCS.
        // const myTransactions = await Transaction.find({ user: req.user._id, type: 'purchases' || 'sales' }).sort({ createdAt: -1 });
        const myTransactions = await Transaction.find({
            user: req.user._id,
            $or: [
              { type: 'purchases' },
              { type: 'sales' }
            ]
        }).sort({ createdAt: -1 });
        console.log(myTransactions)

        res.status(200).json({
            status: 'success',
            count: myTransactions.length,
            data: {
                myTransactions
            }
        })

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}