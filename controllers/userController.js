const User = require("../models/userModel");

// const revenueDistributions = require('../utils/revenueDistributions')
// revenueDistributions();

exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find();

		res.status(200).json({
			status: "success",
			data: {
				count: users.length,
				users,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err || "Something went wrong",
		});
	}
};

exports.getUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		res.status(200).json({
			status: "success",
			data: {
				user,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err || "Something went wrong",
		});
	}
};


exports.getUserName = async (req, res) => {
	try {
		const { id } = req.params;
		console.log(id);
		const user = await User.findOne({ username: id });
		res.status(200).json({
			status: "success",
			data: {
				user,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err || "Something went wrong",
		});
	}
};


exports.updateUser = async (req, res) => {
	try {
		const updatedUser = await User.findById(req.params.id);
		res.status(200).json({
			status: "success",
			data: {
				updatedUser,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err || "Something went wrong",
		});
	}
};



// UPDATE MY PROFILE
exports.updateMyProfile = async (req, res) => {
	try {
		// create an error if user POST's password data.
		if (req.body.password || req.body.passwordConfirm) {
			return res.status(404).json({
				message: "This route is not for password updates. Please use /updateMyPassword.",
			});
		}

		///////////////////////// restricting fields ///////////////////////////////////////
		const { isKycCompleted, active, role, isOTPVerified, myInviterID, referralsList, referralsCount, isCompletedKyc, followers, following, followerRequestsSent, followerRequestsReceived, totalPosts, totalLikes, totalEarnings, slug, profileUrl, totalProducts } = req.body;

		if (isKycCompleted || active || role || isOTPVerified || myInviterID || referralsList || referralsCount || isCompletedKyc || followers || following || followerRequestsSent || followerRequestsReceived || totalPosts || totalLikes || totalEarnings || slug || profileUrl || totalProducts ) return res.status(401).json({ message: "This is not allowed on the server, You are unauthorised!" });
		////////////////////////////////////////////////////////////////////////////////////

		// 2. update
		const updatedUser = await User.findByIdAndUpdate(req.user.id , req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			status: "success",
			message: 'Profile Updated Successfully!',
			data: {
				user: updatedUser,
			},
		});
	} catch (err) {
		res.status(200).json({
			status: "fail",
			message: err.message || "Something went wrong!",
		});
	}
};


// UPDATE MY PROFILE PICTURE
exports.updateMyProfilePicture = async (req, res) => {
	try {
		let image;
		if (req.file) image = req.file.filename;

		await User.findByIdAndUpdate(req.user._id, { image },
			{
				new: true,
				runValidators: true,
			});

		res.status(200).json({
			status: "success",
			message: 'Profile Picture Updated Successfully!',
		});
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: err.message || "Something went wrong",
		});
	}
};

exports.deleteUser = async (req, res) => {
	try {
		await User.findByIdAndDelete(req.params.id);
		res.status(204).json({
			status: "success",
			data: null,
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err || "Something went wrong",
		});
	}
};

exports.getMe = (req, res, next) => {
	// this middleware gives us access to the current user
	req.params.id = req.user._id;
	next();
};

exports.getMyObj = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		return res.status(200).json({
			status: 'success',
			data: {
				user
			}
		})
	} catch(err) {
		return res.status(400).json({
			status: 'fail',
			message: err.message || 'Something went wrong!'
		})
	}
}

// delete current user
exports.deleteAccount = async (req, res) => {
	try {
		// get user
		await User.findByIdAndUpdate(req.user._id, { active: false });

		res.cookie("jwt", "", {
			expires: new Date(Date.now() + 10 * 500),
			httpOnly: true,
		}).clearCookie("jwt");
		return res.status(204).json({
			status: "success",
			data: null,
		});
	} catch (err) {
		console.log(err);
	}
};

// Send a follow request
exports.sendFollowRequest = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id);
		console.log(currentUser);
		const userToFollow = await User.findById(req.params.id);
		console.log("Current User:", currentUser, "FollowUser:", userToFollow);

		if (currentUser.followerRequestsSent.includes(userToFollow._id)) {
			return res.json({ message: "Follow request already sent" });
		}
		userToFollow.followerRequestsReceived.push(currentUser._id);
		await userToFollow.save({ validateBeforeSave: false });

		currentUser.followerRequestsSent.push(userToFollow._id);
		await currentUser.save({ validateBeforeSave: false });

		res.status(200).json({
			status: 'success',
			message: "Follow request sent!"
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: "An error occurred",
		});
	}
};


// cancel follow request
exports.cancleFollowRequest = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id);
		console.log(currentUser);
		const userToFollow = await User.findById(req.params.id);
		console.log("Current User:", currentUser, "FollowUser:", userToFollow);

		if (!currentUser.followerRequestsSent.includes(userToFollow._id)) {
			return res.json({ message: "Follow request already canceled" });
		}
		userToFollow.followerRequestsReceived.pull(currentUser._id);
		await userToFollow.save({ validateBeforeSave: false });

		currentUser.followerRequestsSent.pull(userToFollow._id);
		await currentUser.save({ validateBeforeSave: false });

		res.status(200).json({
			status: 'success',
			message: "Follow request canceled!"
		});

	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: "An error occurred",
		});
	}
};

// Accept a follow request
exports.acceptFollowRequest = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id);
		const userToAccept = await User.findById(req.params.id);

		if (!currentUser.followerRequestsReceived.includes(userToAccept._id)) {
			return res.json({ message: "No follow request received from this user" });
		}
		// Update following for the current user
		currentUser.following.push(userToAccept._id);
		await currentUser.save({ validateBeforeSave: false });

		userToAccept.followers.push(currentUser._id);
		await userToAccept.save({ validateBeforeSave: false });
		// Remove from receiver's followerRequestsReceived and sender's followerRequestsSent
		currentUser.followerRequestsReceived.pull(userToAccept._id);
		userToAccept.followerRequestsSent.pull(currentUser._id);
		await currentUser.save({ validateBeforeSave: false });
		await userToAccept.save({ validateBeforeSave: false });

		res.status(200).json({
			status: 'success',
			message: "Follow request accepted"
		});

	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: "An error occurred",
		});
	}
};

// Reject a follow request
exports.rejectFollowRequest = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id);
		const userToReject = await User.findById(req.params.id);

		if (!currentUser.followerRequestsReceived.includes(userToReject._id)) {
			return res.json({ message: "No follow request received from this user" });
		}
		currentUser.followerRequestsReceived.pull(userToReject);
		userToReject.followerRequestsSent.pull(currentUser);

		await currentUser.save({ validateBeforeSave: false });
		await userToReject.save({ validateBeforeSave: false });

		res.status(200).json({
			status: 'success',
			message: "Follow request rejected" });
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: "An error occurred",
		});
	}
};


// Unfollow a user
exports.unFollowUser = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id);
		const userToUnfollow = await User.findById(req.params.id);

		if (!currentUser.following.includes(userToUnfollow._id)) {
			return res.json({ message: "Not following this user" });
		}
		currentUser.following.pull(userToUnfollow._id);
		userToUnfollow.followers.pull(currentUser._id);

		await currentUser.save({ validateBeforeSave: false });
		await userToUnfollow.save({ validateBeforeSave: false });

		res.status(200).json({
			status: 'success',
			message: "Unfollowed successfully"
		});
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: "An error occurred",
		});
	}
};


exports.generalSearch = async (req, res) => {
	try {
		// Get the search term from the query parameter
		const searchTerm = req.query.q;

		// Define a query object to search for users with usernames matching the search term
		const query = searchTerm ? { username: { $regex: searchTerm, $options: "i" } } : {};

		//   console.log(query);
		// Fetch users from the database based on the query
		const users = await User.find(query);

		res.json(users); // Send the fetched users as a JSON response
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error" });
	}
};



// TOP CREATORS IMPLEMENTATION
exports.topCreators = async (req, res) => {
	try {
		// GET ONLY 5 USERS THAT MEETS A CERTAIN FILTERED CONDITION
		const allTopCreators = await User.find({})
		.where('isCompletedKyc').equals(true)
		.sort({ createdAt: -1, totalPosts: -1, totalLikes: -1, followers: -1, referralsCount: -1 }).limit(5);

		res.status(200).json({
			status: 'success',
			count: allTopCreators.length,
			data: {
				allTopCreators
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


// TOP SELLERS IMPLEMENTATIONS