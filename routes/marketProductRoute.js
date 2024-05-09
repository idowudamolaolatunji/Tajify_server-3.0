const express = require('express');

const { authProtected } = require('../middleware/auth');
const marketProductController = require('../controllers/marketProductController');
const { uploadMultipleProductPhoto, uploadSinglePhoto, resizeProductCategoryImage } = require('../middleware/multer');

const router = express.Router();

router.post('/create-category', marketProductController.createProductCategory);
router.post('/upload-image/:id', uploadSinglePhoto, resizeProductCategoryImage, marketProductController.uploadCategoryImg);
router.get('/all-category', marketProductController.getProductCategories);


router.post('/create-product', authProtected, marketProductController.createProduct);
router.post('/product-imgs/:id', uploadMultipleProductPhoto, marketProductController.uploadProductImgs);

router.get('/products', marketProductController.getAllProducts);

router.get('/products/id/:productID', marketProductController.getProductById);
router.get('/products/slug/:slug', marketProductController.getProductBySlug);
router.get('/products/also-like/:slug', marketProductController.getItemsYouMayAlsoLike);

router.get('/products/top-selling', marketProductController.getTopSellingProducts);
router.get('/products/hot-deals', marketProductController.getHotDeals);
router.get('/products/other-category-section/:category', marketProductController.getProductsBasedOnCatForSections);


router.get('/products/category/:category', authProtected, marketProductController.getProductCategories);

module.exports = router;