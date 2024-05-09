const mongoose = require('mongoose');
const { default: slugify } = require('slugify');


const marketCategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        trim: true,
    },
    categoryImage: String,
    // categoryIcon: String,
    productCount: {
        type: Number,
        default: 0
    },
    slug: String,
}, {
    timestamps: true,
});

marketCategorySchema.pre('save', function(next) {
    const slug = slugify(this.categoryName, { lower: true, replacement: '-' });
	this.slug = `${slug}-${this._id}`;

    next();
})

const MarketCategory = mongoose.model('MarketCategory', marketCategorySchema);
module.exports = MarketCategory;