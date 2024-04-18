

const CommunityFeed = require('../models/communityFeedModel');

exports.getAllFeed = async(req, res) => {
    try {
        const allFeed = await CommunityFeed.find();
        res.status(200).json({
            status: 'success',
            data: {
                feed: allFeed,
            }
        })
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}


exports.createFeed = async(req, res) => {
    try {
        const feed = await CommunityFeed.create({
            user: req.user.id,
            content: req.body.content,
            feedDocuments: req.body.feedDocuments,
        })
        res.status(201).json({
            status:'success',
            data: {
                feed,
            }
        })
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!',
        })
    }
}

exports.getFeed = async(req, res) => {
    try {
        const {feedId} = req.params;
        const feed = await CommunityFeed.findOne({id: feedId });
        if(!feedId || !feed) return res.status(404).json({ message: 'Feed not found'})

        res.status(200).json({
            status: 'success',
            data: {
                feed,
            }
        })
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}

exports.getUserFeeds = async(req, res) => {
    try {
        const { userId } = req.params;
        const feeds = await CommunityFeed.find({ user: userId });
        if(!userId || !feeds) return res.status(404).json({ message: 'Feed not found'})

        res.status(200).json({
            status: 'success',
            data: {
                feeds,
            }
        })
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}

exports.updateFeed = async(req, res) => {
    try {
        const { feedId } = req.params;
        const feed = await CommunityFeed.findByIdAndDelete(feedId, ...req.body, {
            new: true,
            runValidators: true
        });
        if(!userId || !feed) return res.status(404).json({ message: 'Feed not found'})

        res.status(200).json({
            status: 'success',
            data: {
                feed,
            }
        })
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}


exports.likeFeed = async(req, res) => {
    try {
        const { feedId, userId } = req.params;
        const feed = await CommunityFeed.findById(feedId);
        if(!feed.likes.includes(userId)) {
            await feed.updateOne({ $push: { likes: userId } });
            res.status(200).json({message: 'This post has been liked!'});
        }
        else {
            await feed.updateOne({ $pull: { likes: userId } });
            res.status(200).json({message: 'This post has been unliked!'});
        }
    } catch(err) {
        console.log(err)
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}


exports.deleteFeed = async(req, res) => {
    try {
        await CommunityFeed.findByIdAndDelete(req.params.feedId);

        res.status(204).json({
            status:'success',
            data: null,
        })

    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}


exports.userTimeline = async (req, res) => {
    try {
        const userId = req.user.id
        const currentUser = await User.findById(userId);
        const userFeed = await CommunityFeed.find({user: currentUser})

        const friendsFeed = await Promise.all(currentUser.followings.map(friendsId => {
            return CommunityFeed.find({ user: friendsId })
        }));

        res.status(200).json({
            status:'success',
            data: {
                feeds: userFeed.concat(...friendsFeed)
            }
        })

    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        });
    }
}
