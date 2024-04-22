const Blog = require('../models/blogModel');
const BlogCategory = require('../models/BlogCategories');
const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');


exports.createBlogCategory = async (req, res) => {
    try {
        const category = await BlogCategory.create({
            categoryName: req.body.name,
        });

        res.status(200).json({
            status: 'success',
            data: {
                category,
            }
        })

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}


exports.uploadCategoryImg = async (req, res) => {
    try {
        let image;
        if(req.file) image = req.file.filename;
        console.log(image);

        await BlogCategory.findByIdAndUpdate(req.params.id, { categoryImage: image }, {
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


// CREATE BLOG
exports.createBlog = async function(req, res) {
    try {
        const creatorId = req.user._id;
        const creator = await User.findById(creatorId)
        const newBlog = await Blog.create({ ...req.body, author: creator.username, creator: creatorId});
        
        creator.totalPosts += 1;
        await creator.save({ validateBeforeSave: false });

        res.status(201).json({  
            status: 'success',
            message: 'Blog uplaoded successfully!',
            data: {
                blog: newBlog,
            },
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong',
        });
    }
}


exports.allBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find({});

        res.status(200).json({
            status: 'success',
            data: {
                categories
            }
        })

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}


// ADD IMAGES
exports.uploadBlogMainImage = async (req, res) => {
    try {
        let image;
        if(req.file) image = req.file.filename;
        const blogId = req.params.id;

        const updated = await Blog.findByIdAndUpdate(blogId, {image}, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            status: 'success',
            data: {
                blog: updated,
            }
        });
    } catch(err) {
        console.log(err);
        res.status(400).json({
            status: 'fail',
            message: err.message,
        })
    }
}




// Create likes
exports.likeBlogPost = async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId);
        if(!blog) return res.json({ message: 'Blog not found' });
        if(blog.likes.includes(req.user._id)) {
            return res.json({ message: 'User already liked post' });
        }
        const likedBlog = await Blog.findByIdAndUpdate(
            blogId,
            { $push: { likes: req.user._id }, $inc: { likesCounts: 1 }},
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: {
                likedBlog,
            }
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};



exports.unlikeBlogPost = async (req, res) => {
    try {
        const { blogId } = req.params;

        const blog = await Blog.findById(blogId);
        if(!blog) return res.json({ message: 'Blog not found' });
        if(!blog.likes.includes(req.user._id)) {
            return res.json({ message: 'User has not liked post' });
        }

        if(blog.likes.length < 0 || blog.likesCounts < 0) return;
        const unLikedBlog = await Blog.findByIdAndUpdate(
            blogId,
            { $pull: { likes: req.user._id }, $inc: { likesCounts: -1 } },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            message: 'Post unliked successfully',
            data: {
                unLikedBlog
            }
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};



//   GET ALL BLOGS
exports.getAllBlog = async function(req, res) {
    try {
        const blogs = await Blog.find();

        if(!blogs || blogs.length < 1) return res.json({
            message: 'No Blog post found!'
        })

        res.status(200).json({
            status: 'success',
            data: {
                count: blogs.length,
                blogs
            }
        });

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.mesage
        });
    }
};


// UPDATE BLOGS
exports.updateBlog = async function(req, res) {
    try {
        console.log(req.params.id)
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: {
                blog: updatedBlog
            }
        });

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};


// Delete Blog
exports.deleteBlog = async function(req, res) {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
};


// Get a single Blog
exports.getBlog = async function (req, res) {
    try {
        const blogId = req.params.id
        const blog = await Blog.findById(blogId);
        res.status(200).json({
            status: 'success',
            data: {
                blog
            }
        });

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.mesage || 'Something went wrong'
        });
    }
};

// Get a single Blog by slug
exports.getBlogBySlug = async function (req, res) {
    try {
        const { slug } = req.params
        const blog = await Blog.findOne({ slug });
        res.status(200).json({
            status: 'success',
            data: {
                blog
            }
        });

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.mesage || 'Something went wrong'
        });
    }
};


// Get Blogs by Category
exports.getBlogsByCategory = async function (req, res) {
    try {
        const categoryString = req.params.category;
        if(!categoryString) return res.json({ message: 'No categoty selcted' })
        const categorizedBlogs = await Blog.find({ category: categoryString });
        if(!categorizedBlogs) return res.status(404).json({ message: 'No blog post in this category' });
        
        res.status(200).json({
            status: 'success',
            count: categorizedBlogs.length,
            data: {
                blogs: categorizedBlogs,
            }
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong',
        });
    }
};


// MY BLOGS
exports.getMyBlogs = async function (req, res) {
    try {
        console.log(req)
        const userId = req.user._id;
        const userBlogs = await Blog.find({ creator: userId });
        console.log(userBlogs)

        if(!userBlogs || userBlogs.length < 1) return res.json({
            message: 'No Blog post found!'
        })

        res.status(200).json({
            status: 'success',
            count: userBlogs.length,
            data: {
                blogs: userBlogs
            }
        });
    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.mesage || 'Something went wrong'
        });
    }
};

// Get Blogs Posted By A User
exports.getBlogsbyCreatorId = async function (req, res) {
    try {
        const id = req.params.id;
        const creator = await User.findById(id);
        const creatorBlogs = await Blog.find({ creator: creator._id });

        res.status(200).json({
            status: 'success',
            count: creatorBlogs.length,
            data: {
                blogs: creatorBlogs
            }
        })

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.mesage || 'Something went wrong'
        })
    }
}

exports.getMoreBlogsbyCreatorId = async function (req, res) {
    try {
        const { id, blogId } = req.params;
        const creator = await User.findById(id);
        const creatorBlogs = await Blog.find({ creator: creator._id, _id: { $ne: blogId } }).limit(4);

        res.status(200).json({
            status: 'success',
            count: creatorBlogs.length,
            data: {
                blogs: creatorBlogs
            }
        })

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.mesage || 'Something went wrong'
        })
    }
}

// get blogs by tags
exports.getBlogsByTags = async function (req, res) {
    try {
        const tagsString = req.params.tags;
        const categorisedBlogs = Blog.find({ tags: tagsString });
        if(!categorisedBlogs) {
            return res.status(400).json({ message: 'No blog post in this category' });
        }

        return res.status(200).json({
            status: 'success',
            count: categorisedBlogs.length,
            data: {
                blogs: categorisedBlogs,
            }
        })
    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err || 'Something went wrong'
        })
    }
}


// Get Blogs by Most Liked
exports.getBlogsByMostLiked = async function (req, res) {
    try {
        const blogs = await Blog.find().sort('-likes');
        
        res.status(200).json({
            status: 'success',
            count: blogs.length,
            data: {
                blogs,
            }
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.mesage || 'Something went wrong',
        });
    }
};


// Get Blogs by Most Viewed
exports.getBlogsByMostViewed = async function (req, res) {
    try {
        const blogs = await Blog.find().sort('-views');
        
        res.status(200).json({
            status: 'success',
            count: blogs.length,
            data: {
                blogs,
            }
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.mesage || 'Something went wrong',
        });
    }
};

// Get Blogs by Most Shared
exports.getBlogsByMostShared = async function (req, res) {
    try {
        const blogs = await Blog.find().sort('-shares');
        
        res.status(200).json({
            status: 'success',
            count: blogs.length,
            data: {
                blogs,
            }
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.mesage || 'Something went wrong',
        });
    }
};

// get most engaging post
exports.getBlogsByMostEngaging = async function (req, res) {
    try {
        const allBlogs = await Blog.find();
        
        // Simulate an algorithm that ranks blogs based on engagement factors
        const rankedBlogs = allBlogs.map(blog => {
            const engagementScore = blog.calculateEngagementScore(blog);
            return { ...blog._doc, engagementScore };
            console.log(...blog._doc, engagementScore)
        });
        rankedBlogs.sort((a, b) => b.engagementScore - a.engagementScore);

        // // Limit the response to a specific number (e.g., 30) of blogs
        // const responseBlogs = rankedBlogs.slice(0, 30);

        res.status(200).json({
            status: 'success',
            count: rankedBlogs.length,
            data: {
                blogs: rankedBlogs,
            }
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.mesage || 'Something went wrong',
        });
    }
};


// trending blogs
exports.getTrendingPosts = async function (req, res) {
    try {
        console.log(req, res)
        const allBlogs = await Blog.find();
        console.log(allBlogs)

        // Simulate an algorithm to determine trending posts
        const trendingBlogs = allBlogs.filter(blog => blog.isTrending(blog));
        console.log(trendingBlogs)

        res.status(200).json({
            status: 'success',
            count: trendingBlogs.length,
            data: {
                blogs: trendingBlogs,
            }
        });
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            status: 'fail',
            message: err.mesage || 'Something went wrong',
        });
    }
};


// RELATED POSTS IMPLEMENTATION
exports.relatedBlogs = async (req, res) => {
    try {
        // FIND THE MAIN / CURRENT BLOG BASED ON THE PARAMS SENT IN THE REQ ROUTE
        const currentBlog = await Blog.findById(req.params.currentBlogId);

        // CHECK IF THAT BLOG STILL EXISTS
        if (!currentBlog) return res.status(404).json({ message: 'Main Blog not found!' });

        // NOW FIND RELATED BLOG POSTS BASED ON THE SAME CATEGORIES
        const relatedBlogPosts = await Blog.find({ category: currentBlog.category });

        /*
        if(relatedBlogPosts.length < 5) {
            async function findByTags(...tags) {
                const related = await Blog.find({ tags })
                return res.status(200).json({
                    status: 'success',
                    count: related.length,
                    data: {
                        related
                    }
                });
            }
            await findByTags();
        }
        */

        // FINALLY PICK THEM AT RANDOM
        const relatedNum = 5;
        const randomlyRelatedBlogPosts = relatedBlogPosts
            .sort(() => Math.random() - 0.5)
            .slice(0, relatedNum);

        res.status(200).json({
            status: 'success',
            count: randomlyRelatedBlogPosts.length,
            data: {
                randomlyRelatedBlogPosts
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        });
    }
};






// // get blogs by tags
// exports.getBlogsByTags = async(req, res) => {
//     try {
//         const tagsString = req.params.tags;
//         const categorisedBlogs = Blog.find({ tags: tagsString });
//         if(!categorisedBlogs) {
//             return res.status(400).json({ message: 'No blog post in this category' });
//         }

//         return res.status(200).json({
//             status: 'success',
//             count: categorisedBlogs.length,
//             data: {
//                 blogs: categorisedBlogs,
//             }
//         })
//     } catch(err) {
//         return res.status(400).json({
//             status: 'fail',
//             message: err || 'Something went wrong'
//         })
//     }
// }


// // Get Blogs by Category
// async function getBlogsByCategory (req, res) {
//     try {
//         const categoryString = req.params.category;
//         if(!categoryString) return res.json({ message: 'No categoty selcted' })
//         const categorizedBlogs = await Blog.find({ category: categoryString });
//         if(!categorizedBlogs) return res.status(404).json({ message: 'No blog post in this category' });
        
//         res.status(200).json({
//             status: 'success',
//             count: categorizedBlogs.length,
//             data: {
//                 blogs: categorizedBlogs,
//             }
//         });
//     } catch (err) {
//         return res.status(400).json({
//             status: 'fail',
//             message: err.message || 'Something went wrong',
//         });
//     }
// };

// // Get Blogs by Most Liked
// exports.getBlogsByMostLiked = async (req, res) => {
//     try {
//         const blogs = await Blog.find().sort('-likes');
        
//         res.status(200).json({
//             status: 'success',
//             count: blogs.length,
//             data: {
//                 blogs,
//             }
//         });
//     } catch (err) {
//         return res.status(400).json({
//             status: 'fail',
//             message: err.mesage || 'Something went wrong',
//         });
//     }
// };

// // Get Blogs by Most Viewed
// exports.getBlogsByMostViewed = async (req, res) => {
//     try {
//         const blogs = await Blog.find().sort('-views');
        
//         res.status(200).json({
//             status: 'success',
//             count: blogs.length,
//             data: {
//                 blogs,
//             }
//         });
//     } catch (err) {
//         return res.status(400).json({
//             status: 'fail',
//             message: err.mesage || 'Something went wrong',
//         });
//     }
// };

// // Get Blogs by Most Shared
// exports.getBlogsByMostShared = async (req, res) => {
//     try {
//         const blogs = await Blog.find().sort('-shares');
        
//         res.status(200).json({
//             status: 'success',
//             count: blogs.length,
//             data: {
//                 blogs,
//             }
//         });
//     } catch (err) {
//         return res.status(400).json({
//             status: 'fail',
//             message: err.mesage || 'Something went wrong',
//         });
//     }
// };


// // get most engaging post
// exports.getBlogsByMostEngaging = async (req, res) => {
//     try {
//         const allBlogs = await Blog.find();
        
//         // Simulate an algorithm that ranks blogs based on engagement factors
//         const rankedBlogs = allBlogs.map(blog => {
//             const engagementScore = blog.calculateEngagementScore(blog);
//             return { ...blog._doc, engagementScore };
//             console.log(...blog._doc, engagementScore)
//         });
//         rankedBlogs.sort((a, b) => b.engagementScore - a.engagementScore);

//         // // Limit the response to a specific number (e.g., 30) of blogs
//         // const responseBlogs = rankedBlogs.slice(0, 30);

//         res.status(200).json({
//             status: 'success',
//             count: rankedBlogs.length,
//             data: {
//                 blogs: rankedBlogs,
//             }
//         });
//     } catch (err) {
//         return res.status(400).json({
//             status: 'fail',
//             message: err.mesage || 'Something went wrong',
//         });
//     }
// };


// Search users and blogs route
// app.get('/api/search', async (req, res) => {
  