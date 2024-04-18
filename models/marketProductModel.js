const mongoose = require('mongoose');


const marketProductSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    category: String,
    rating: {
        type: Number,
        default: 4,
    },
    ratingsCount: {
        type: Number,
    },
    description: {
        type: String,
        required: true,
        maxLength: 800
    },
    specifications: {
        type: [String],
        required: true
    }
}, { timestamps: true },
);

marketProductSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: '_id image fullName username',
    });

    next();
});


const MarketProduct = mongoose.model('MarketProduct', marketProductSchema);
module.exports = MarketProduct;