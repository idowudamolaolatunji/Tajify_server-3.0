const mongoose = require('mongoose');
const { default: slugify } = require('slugify');


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
    images: {
        type: [String],
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
        maxLength: 1000
    },
    specifications: {
        type: [String],
        required: true
    },
    soldCount: {
        type: Number,
        default: 0
    },
    slug: String,
    discountPercentage: {
        type: Number,
        default: 0
    }

}, { timestamps: true },
);


marketProductSchema.pre('save', function(next) {
    const slug = slugify(this.name, { lower: true, replacement: '-' });
	this.slug = `${slug}-${this._id}`;

    next();
})

marketProductSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'creator',
        select: '_id image fullName username',
    });

    next();
});


const MarketProduct = mongoose.model('MarketProduct', marketProductSchema);
module.exports = MarketProduct;