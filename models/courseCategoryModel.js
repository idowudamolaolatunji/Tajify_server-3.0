const mongoose = require('mongoose');


const CourseCategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true,
    },
    categoryImage: {
        type: String,
        default: ''
    },
    courseCount: {
        type: Number,
        default: 0
    }
});


const CourseCategory = mongoose.model('CourseCategory', CourseCategorySchema);
module.exports = CourseCategory;