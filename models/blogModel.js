const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Provide a title'],
        trim: true
    },
    content: {
        type: mongoose.SchemaTypes.Mixed,
        required: true,
        trim: true
    },
    // editable: {
    //     type: mongoose.SchemaTypes.Mixed,
    //     required: true,
    //     trim: true
    // },
    preview: {
        type: String,
        trim: true,
    },
    creator: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
    },
    image: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now,
    },
    // author: String,
    tags: [String],
    category: {
        type: String,
        enum: ['entertainment', 'sport', 'lifestyle', 'culture', 'future', 'travel', 'finance', 'health', 'technology'],
        default: 'entertainment'
    },
    type: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    isPremium: {
        type: Boolean,
        default: null
    },
    blogPrice: Number,
    isFree: {
        type: Boolean,
        default: function() {
            if(this.type === 'free') {
                return true;
            } else {
                return false;
            }
        }
    },
    subscriptionFee: {
        type: Number,
        default: 0
    },
    slug: String,
    blogUrl: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId }],
    likesCounts: {
        type: Number,
        default: 0
    },
    commentCounts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

blogSchema.pre(/^find/, function(next) {
    this.populate({
        path: "creator",
        select: '_id username fullname email image slug bio referralUrl'
    })
    next();
})

blogSchema.pre('save', function(next) {
    const slug = slugify(this.title, {lower: true, replacement: '-'});
    this.slug = `${slug}-${this._id}`;
    next();
})

blogSchema.methods.calculateEngagementScore = function() {
    return (this.likes * 3) + (this.comments * 2) + (this.shares * 5) + (this.view * 3);
};

blogSchema.methods.isTrending = function() {
    const now = new Date();
    const fourtyEightHoursAgo = new Date(now - (48 * 60 * 60 * 1000));
    const engagementThreshold = 100;

    return this.createdAt > fourtyEightHoursAgo && this.calculateEngagementScore() > engagementThreshold;
};


const Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog;