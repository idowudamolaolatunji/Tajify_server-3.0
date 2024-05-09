const MarketProduct = require("../models/marketProductModel");
const MarketCategory = require("../models/marketCategoryModel");
const User = require("../models/userModel");
const multer = require('multer');
const sharp = require('sharp');
const moment = require("moment");

exports.createProductCategory = async (req, res) => {
	try {
		const category = await MarketCategory.create({
			categoryName: req.body.categoryName,
		});

		res.status(201).json({
			status: "success",
			data: {
				category,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

exports.uploadCategoryImg = async (req, res) => {
	try {
		let image;
		if (req.file) image = req.file.filename;
		console.log(image);

		await MarketCategory.findByIdAndUpdate(
			req.params.id,
			{ categoryImage: image },
			{
				new: true,
				runValidators: true,
			},
		);

		res.status(200).json({
			status: "success",
			message: "Image upload successful",
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

exports.getProductCategories = async (req, res) => {
	try {
		const categories = await MarketCategory.find({});

		res.status(200).json({
			status: "success",
			count: categories.length,
			data: {
				categories,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

// creators UPLOAD PRODUCTS
exports.createProduct = async (req, res) => {
	try {
		const creator = await User.findById(req.user._id);
		if (!creator || !creator.isActive)
			return res.json({
				message: "User no longer exist",
			});
		if (creator.role !== "creator")
			return res.json({
				message: "You're not authorized to upload a Product",
			});
		if (!creator.isCompletedKyc)
			return res.json({
				message: "KYC must be completed, Before you sell!",
			});

		const product = await MarketProduct.create({
			creator: creator._id,
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
			category: req.body.category,
			specifications: req.body.specifications,
			discountPercentage: req.body.discountPercentage,
		});

		await MarketCategory.findOneAndUpdate({ categoryName: req.body.category }, { $inc: { productCount: 1 } }, { runValidators: true, new: true });

		res.status(201).json({
			status: "success",
			message: "Product created!",
			data: {
				product,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

// ADD GIFTING IMAGES
exports.uploadProductImgs = async (req, res) => {
	try {
        console.log('Hi')
		const product = await MarketProduct.findById(req.params.id);
        console.log(product)
        if(!product) return res.json({
			message: 'Cannot find product'
		});	

		const images = [];
		if (req?.files && Array.isArray(req.files)) {
			for (const image of req.files) {
				const fileName = `product-${product?._id}-${Date.now()}-${images.length + 1}.jpeg`
				await sharp(image.buffer)
					.resize(750, 750)
					.toFormat('jpeg')
					.jpeg({ quality: 80 })
					.toFile(`public/asset/products/${fileName}`)
				;
				images.push(fileName);
			}
		}

		console.log(images);
		product.images = images;
		await product.save({});

		res.status(200).json({
			status: "success",
			message: "Image upload successful",
		});
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

// EVERY PRODUCTS
exports.getAllProducts = async (req, res) => {
	try {
		const products = await MarketProduct.find().sort({ createdAt: -1 });
		res.status(200).json({
			status: "success",
			count: products.length,
			data: {
				products,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

// GET ONE PRODUCT
exports.getProductById = async (req, res) => {
	try {
		const product = await MarketProduct.findById(req.params.productID);
		res.status(200).json({
			status: "success",
			data: {
				product,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

// GET ONE PRODUCT
exports.getProductBySlug = async (req, res) => {
	try {
        const { slug } = req.params;
		const product = await MarketProduct.findOne({ slug });

		res.status(200).json({
			status: "success",
			data: {
				product,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

// FIND PRODUCTS BY CATEGORIES
exports.getProductsByCategories = async (req, res) => {
	try {
		const products = await MarketProduct.find({ category: req.params.category, creator: { $ne: req.user._id } }).sort({ createdAt: -1 });
		res.status(200).json({
			status: "success",
			count: products.length,
			data: {
				products,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
	try {
		const creator = await User.findById(req.user._id);
		if (!creator || !creator.isActive) return res.json({ message: "Creator not found!" });
		const product = await MarketProduct.findOneAndUpdate({ _id: req.params.productID, creator: creator._id }, req.body, { runValidators: true, new: true });

		await Notification.create({
			user: creator?._id,
			title: "Updated Product!",
			content: `You just created a product in ${product.category}!`,
		});

		res.status(200).json({
			status: "success",
			message: "Updated product successfully!",
			data: {
				product: product,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
	try {
		const creator = await User.findById(req.user._id);
		if (!creator || !creator.isActive) return res.json({ message: "Creator not found!" });

		const product = await MarketProduct.findOne({ _id: req.params.productID, creator: creator._id });
		if (!product) return res.json({ message: "No product found" });

		await MarketProduct.findByIdAndDelete(product._id);
		await MarketCategory.findOneAndUpdate({ categoryName: product.category }, { $inc: { productCount: -1 } }, { runValidators: true, new: true });

		await Notification.create({
			user: creator?._id,
			title: "Deleted Product!",
			content: `You just deleted a product in ${product.category}!`,
		});

		res.status(200).json({
			status: "success",
			message: "Deleted a product successfully",
			data: {},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

// GET PRODUCTS BASED ON SECTIONS

exports.getTopSellingProducts = async (req, res) => {
	try {
        console.log('Hi, top')
		const products = await MarketProduct.find().sort({ createdAt: -1, soldCount: -1 }).limit(15);
        console.log(products)

		res.status(200).json({
			status: "success",
			data: {
				products,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

exports.getHotDeals = async (req, res) => {
	try {
		const sevenDaysAgo = moment().subtract(7, "days").toDate();

		const thresholdDiscount = 5;
		const products = await MarketProduct.find({ discountPercentage: { $gt: thresholdDiscount }, createdAt: { $gte: sevenDaysAgo }, soldCount: { $gte: 1 } })
			.sort({ soldCount: 1 })
			.limit(15);

		res.status(200).json({
			status: "success",
			data: {
				products,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

exports.getItemsYouMayAlsoLike = async (req, res) => {
    try {
        const { slug } = req.params;
        const currentProduct = await MarketProduct.findOne({ slug });

        if (!currentProduct) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found'
            });
        }

        const similarProducts = await MarketProduct.find({
            _id: { $ne: currentProduct._id },
            category: currentProduct.category 
        }).limit(12);

        res.status(200).json({
            status: 'success',
            data: {
                similarProducts
            }
        });

    } catch(err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
}

exports.getProductsBasedOnCatForSections = async (req, res) => {
	try {
        console.log('Hi, sec');
        console.log(req.params.category)
		const products = await MarketProduct.find({ category: req.params.category }).sort({ createdAt: -1 }).limit(15);

		res.status(200).json({
			status: "success",
			data: {
				products,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};
