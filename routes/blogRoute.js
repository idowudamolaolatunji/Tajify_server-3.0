const express = require('express');
const blogController = require('../controllers/blogController');
const { uploadSinglePhoto, resizeSingleBlogPhoto, resizeBlogCategoryImage } = require('../middleware/multer');

const commentController = require('../controllers/commentController');
const { authProtected } = require('../middleware/auth');
const router = express.Router();
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

router.post('/create-category', blogController.createBlogCategory);
router.patch('/upload-blog-category-img/:id', uploadSinglePhoto, resizeBlogCategoryImage, blogController.uploadCategoryImg);
router.get('/categories', blogController.allBlogCategories);


// ROUTE FOR THE RELATED BLOG POSTS IMPLEMENTATION.
router.get('/related-posts/:currentBlogId', blogController.relatedBlogs);

// get all and create blog
router.get('/', blogController.getAllBlog)

router.post('/upload', authProtected, blogController.createBlog);
router.post('/upload-img/:id', uploadSinglePhoto, resizeSingleBlogPhoto, blogController.uploadBlogMainImage);

router.get('/:id', blogController.getBlog)
router.get('/blog/:slug', blogController.getBlogBySlug)
router.patch('/:id', authProtected, blogController.updateBlog);
router.delete('/:id', authProtected, blogController.deleteBlog);

// 
router.get('/category/:category', blogController.getBlogsByCategory);
router.get('/creator/myBlogs', authProtected, blogController.getMyBlogs);
// router.get('/myBlogs', authProtected, blogController.getMyBlogs);

// GET BLOGS BY CREATOR ID
router.get('/creator/:id', blogController.getBlogsbyCreatorId);
// GET BLOGS BY CREATOR ID EXCEPT CURRENT BLOG BY ID
router.get('/creator/more/:id/:blogId', blogController.getMoreBlogsbyCreatorId);

// 
router.get('/tags/:tags', blogController.getBlogsByTags);
router.get('/most-liked', blogController.getBlogsByMostLiked);
router.get('/most-viewed', blogController.getBlogsByMostViewed);
router.get('/most-shared', blogController.getBlogsByMostShared);

router.get('/most-engaging', blogController.getBlogsByMostEngaging);
router.get('/trending-posts', blogController.getTrendingPosts);

// (likes)
router.patch('/like-post/:blogId', authProtected, blogController.likeBlogPost)
router.patch('/unlike-post/:blogId', authProtected, blogController.unlikeBlogPost)

// (Comment)
router.post('/post-comment/:blogId/:id', authProtected, commentController.createComment);
router.get('/get-comments/:blogId/:id', commentController.getBlogCommentsByUser);
router.get('/get-comments/:blogId', commentController.getAllBlogComments);

router.get('/edit-comments/:blogId/:commentId', commentController.updateBlogComment)
router.get('/get-comments/:blogId/:commentId', commentController.deleteBlogComment)

module.exports = router;