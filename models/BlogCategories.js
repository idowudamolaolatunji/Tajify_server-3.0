const mongoose = require('mongoose');


const blogCategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    categoryImage: {
        type: String,
        default: ''
    },
    BlogCount: {
        type: Number,
        default: 0
    }
});

const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);
module.exports = BlogCategory;