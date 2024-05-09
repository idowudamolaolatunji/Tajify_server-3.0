const multer = require('multer');
const sharp = require('sharp');
////////////////////////////////////////////
const multerStorage = multer.memoryStorage();

// create a multer filter
const multerFilter = (req, file, cb) => {
    try {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            throw new error('Not an image! Please upload only images');
        }
    } catch (error) {
        cb(error, false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});


// SINGLE IMAGE UPLOAD
exports.uploadSinglePhoto = upload.single('image');

// MULTIPLE PRODUXCT IMAGE UPLOADS
exports.uploadMultipleProductPhoto = upload.array('images', 6);


/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

exports.resizeProfilePhoto = async function (req, res, next) {
    if(!req.file) return next();

    try {
        req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

        await sharp(req.file.buffer)
            .resize(350, 350)
            .toFormat('jpeg')
            .jpeg({ quality: 60 })
            .toFile(`public/asset/users/${req.file.filename}`);
        next();

    } catch(err) {
        next(err);
    }
};


exports.resizeSingleBlogPhoto = async function (req, res, next) {
    if(!req.file) return next();

    try {
        req.file.filename = `blog-${req.params.id}-${Date.now()}.jpeg`;

        await sharp(req.file.buffer)
            .resize(900, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 70 })
            .toFile(`public/asset/blogs/${req.file.filename}`);
        next();

    } catch(err) {
        next(err)
    }
};


exports.resizeProductCategoryImage = async function (req, res, next) {
    if(!req.file) return next();

    try {
        req.file.filename = `product-category-${req.params.id}-${Date.now()}.jpeg`;

        await sharp(req.file.buffer)
            .resize(600, 400)
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toFile(`public/asset/products/${req.file.filename}`);
        next();

    } catch(err) {
        next(err)
    }
};


exports.resizeCourseCategoryImage = async function (req, res, next) {
    if(!req.file) return next();

    try {
        req.file.filename = `course-category-${req.params.id}-${Date.now()}.jpeg`;

        await sharp(req.file.buffer)
            .resize(400, 700)
            .toFormat('jpeg')
            .jpeg({ quality: 70 })
            .toFile(`public/asset/courses/${req.file.filename}`);
        next();

    } catch(err) {
        next(err)
    }
};

exports.resizeBlogCategoryImage = async function (req, res, next) {
    if(!req.file) return next();

    try {
        req.file.filename = `blog-category-${req.params.id}-${Date.now()}.jpeg`;

        await sharp(req.file.buffer)
            .resize(400, 700)
            .toFormat('jpeg')
            .jpeg({ quality: 70 })
            .toFile(`public/asset/blogs/${req.file.filename}`);
        next();

    } catch(err) {
        next(err)
    }
};

