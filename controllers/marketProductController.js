const MarketProduct = require('../models/marketProductModel');
const MarketCategory = require('../models/marketCategoryModel');


exports.createProductCategory = async (req, res) => {
    try {
        const category = await MarketCategory.create({
            categoryName: req.body.name,
        });

        res.status(201).json({
            status: 'success',
            data: {
                category
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

        await MarketCategory.findByIdAndUpdate(req.params.id, { categoryImage: image }, {
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
		const categories = await MarketCategory.find({});

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