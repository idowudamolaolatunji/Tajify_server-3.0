const CourseCategory = require('../models/courseCategoryModel');


exports.createCourseCategory = async (req, res) => {
    try {
        const category = await CourseCategory.create({
            categoryName: req.body.name,
        });

        res.status(201).json({
            status: 'success',
            data: {
                courseCategory: category
            }
        })

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}


exports.uploadCategoryImg = async (req, res) => {
    try {
        let image;
        if(req.file) image = req.file.filename;
        console.log(image);

        await CourseCategory.findByIdAndUpdate(req.params.id, { categoryImage: image }, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            status: 'success',
			message: 'Image upload successful'
        });
        
    } catch(err) {
		return res.status(400).json({
            status: 'fail',
			message: err.message
        });
    }
}


exports.getCoursesCategories = async (req, res) => {
	try {
		const categories = await CourseCategory.find({});

		res.status(200).json({
			status: 'success',
			data: {
				categories,
			}
		});

	} catch(err) {
		return res.status(400).json({
            status: 'fail',
            message: err.message
        });
	}
}