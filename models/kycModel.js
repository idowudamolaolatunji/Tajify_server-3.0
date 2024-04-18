const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    homeAddress: {
        type: String,
        default: ''
    },
    documentType: {
        type: String,
        enum: [null, 'national-id', 'driver-license', 'intl.-passport', 'nin'],
        default: null
    },
    documentImage: {
        type: String,
        required: true,
        default: ''
    },
    utilBillType: {
        type: String,
        required: true,
        enum: [null, 'nepa-bill', 'waste-bill'],
        default: null
    },
    utilBillImage: {
        type: String,
        required: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true
    }
}, {
    timestamps: true,
});

kycSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: '_id username fullName'
    });
    next();
});

const KYC = mongoose.model('KYC', kycSchema);
module.exports = KYC;