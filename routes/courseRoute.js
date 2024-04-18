const express = require('express');

const router = express.Router();
const courseController = require('../controllers/CourseController');
const { uploadSinglePhoto, resizeCourseCategoryImage } = require('../middleware/multer');


router.get('/categories', courseController.getCoursesCategories);

//////////////////////////////////////////////////////////////
router.post('/create-category', courseController.createCourseCategory);
router.patch('/upload-course-category-img/:id', uploadSinglePhoto, resizeCourseCategoryImage, courseController.uploadCategoryImg);

module.exports = router;