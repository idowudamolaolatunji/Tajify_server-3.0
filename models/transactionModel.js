const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    transactionHash: {
        type: String,
        default: ''
    },
    currency: {
        type: String,
        required: true,
        enum: ['naira', 'taji', 'usdt', 'others'],
        default: 'naira'
    },
    status: {
        type: String,
        enum: ['success', 'pending', 'failed'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'gifting', 'sales', 'purchase', 'subscribing', 'staking', 'staking-rewards', 'exchange', 'reward'],
        default: 'deposit',
        required: true
    },
    slots: {
        type: Number,
    },
    charged: {
        type: Boolean,
        default: false,
        required: true,
    },
    bankName: {
        type: String,
    },
    acctNumber: {
        type: String,
    },
    holderName: {
        type: String,
    },
    TAJIBEP20Address: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

transactionSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: '_id fullName username',
    });
    next();
});


const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;