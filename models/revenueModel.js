const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
    revenueType: {
        type: String,
        default: ''
    },
    revenueAmount: {
        type: Number,
        default: 0
    }
});

const Revenue = mongoose.model('Revenue', revenueSchema);
module.exports = Revenue;