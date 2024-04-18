const Comment = require('../models/commentModel');
const User = require('../models/userModel');
const Blog = require('../models/blogModel');

// Create comments
exports.createComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { blogId } = req.params;

        const blog = await Blog.findById(blogId);
        const user = await User.findById(req.user._id);
        if(!blog) return res.json({ message: 'Cannot find blog!' });
        if(!user || !user.isActive ) return res.json({ message: 'User not found!' });

        blog.commentCounts += 1;
        await blog.save({});

        const newComment = await Comment.create({
            text,
            user: user._id,
            blog: blogId,
        });

        res.status(201).json({
            status: 'success',
            data: {
                comment: newComment,
            }
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong',
        });
    }
};


exports.getAllBlogComments = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId)
        if(!blog) return res.json({ message: 'Cannot find blog!' })
        const comments = await Comment.find({ blog: blog._id });

        res.status(200).json({
            status: 'success',
            data: {
                comment: comments
            }
        })

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong',
        });
    }
}


exports.getBlogCommentsByUser = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId)
        if(!blog) return res.json({ message: 'Cannot find blog!' })
        const comment = await Comment.findOne({ id: req.params.id, blog: blog._id });
        if(!comment) return res.json({ message: 'No comment found!' }) 

        res.status(200).json({
            status: 'success',
            data: {
                comment
            }
        })

    } catch(err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong',
        });
    }
}


exports.updateBlogComment = async (req, res) => {
    try {
        const { commentId, blogId} = req.params;
        const user = await User.findById(req.user._id);
        const updatedComment = await Comment.findOneAndUpdate({ _id: commentId , user: user._id, blog: blogId }, req.body, {
            new: true,
            runValidation: true,
        });

        res.status(200).json({
            status: 'success',
            message: 'Comment deleted successfully',
            data: {
                comment: updatedComment
            }
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong',
        });
    }
};


exports.deleteBlogComment = async (req, res) => {
    try {
        const { commentId, blogId} = req.params;
        const user = await User.findById(req.user._id);
        await Comment.findOneAndDelete({
            _id: commentId,
            user: user._id,
            blog: blogId,
        });

        res.status(204).json({
            status: 'success',
            message: 'Comment deleted successfully',
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong',
        });
    }
};
