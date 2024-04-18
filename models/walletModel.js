const mongoose = require('mongoose');


const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    nairaWalletBalance: {
		type: Number,
		default: 0,
	},
	tajiWalletBalance: {
		type: Number,
		default: 0,
	},
	usdtWalletBalance: {
		type: Number,
		default: 0,
	},

	// pending balances
	pendingNairaBalance: {
		type: Number,
		default: 0,
	},
	pendingTajiBalance: {
		type: Number,
		default: 0,
	},
	pendingUsdtBalance: {
		type: Number,
		default: 0,
	}
}, {
    timestamps: true,
});


walletSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: '_id image username email fullName'
    });

    next();
});


const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;