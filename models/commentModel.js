const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    blog: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Blog',
        required: true,
    },
}, {
    timestamps: true,
});

commentSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: '_id username slug image'
    });

    this.populate({
        path: "blog",
        select: '_id name slug'
    })

    next();
})

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
