const mongoose = require('mongoose');

const stakeHolderSchema = new mongoose.Schema({
    stakeHolderUsername: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false
    },
    slots: Number,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const StakeHolder = mongoose.model('StakeHolder', stakeHolderSchema);
module.exports = StakeHolder;