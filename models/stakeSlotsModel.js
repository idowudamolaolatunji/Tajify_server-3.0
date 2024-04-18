const mongoose = require('mongoose');

const stakeShotsSchema = new mongoose.Schema({
    stakeHolder: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'StakeHolder',
        // this reference StakeHolder is the StakeHolder schema / model / document
    },
    slotAmount: {
        type: Number,
        required: true,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: false
    },
    rewards: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});


stakeShotsSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'stakeHolder',
        select: '_id stakeHolderUsername'
    })
    next();
});


const StakeSlots = mongoose.model('StakeSlots', stakeShotsSchema);
module.exports = StakeSlots;