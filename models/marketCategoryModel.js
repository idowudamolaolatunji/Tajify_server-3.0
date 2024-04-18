const mongoose = require('mongoose');


const marketCategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        trim: true,
    },
    categoryImage: String,
    categoryIcon: String,
    productCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

const MarketCategory = mongoose.model('MarketCategory', marketCategorySchema);
module.exports = MarketCategory;