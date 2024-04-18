const mongoose = require('mongoose');

const communityFeedSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        require: true
    },
    feedDocuments: {
        type: mongoose.Schema.Types.Array,
        default: []
    },
    likes: {
        type: mongoose.Schema.Types.Array,
        default: []
    },
    shareCount: {
        type: mongoose.SchemaTypes.Array,
        default: []
    },
    savedCount: {
        type: mongoose.SchemaTypes.Array,
        default: []
    },
    gifting: {},
    comments: {},
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const CommunityFeed = mongoose.model('CommunityFeed', communityFeedSchema);
module.exports = CommunityFeed;