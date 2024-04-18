const crypto = require("crypto");

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const slugify = require("slugify");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, "A user must provide their fullname"],
		trim: true,
	},
	email: {
		type: String,
		unique: true,
		trim: true,
		required: [true, "A user must have an email"],
		validate: [validator.isEmail, "Enter a valid email"],
		lowercase: true,
	},
	password: {
		type: String,
		required: [true, "A user must provide a password"],
		trim: true,
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, "A user must confirm their password"],
		validate: {
			validator: function (el) {
				return el === this.password;
			},
			message: "Password are not the same",
		},
	},
	fullname: {
		type: String,
		lowercase: true,
		trim: true,
	},
	image: {
		type: String,
		// default: "https://res.cloudinary.com/dy3bwvkeb/image/upload/v1690840131/let10usgypqcessgfybt.png",
		default: "",
	},
	slug: String,
	referralUrl: String,
	profileUrl: String,
	myInviterID: {
		type: String,
		default: null,
	},
	referralsList: {
		type: mongoose.SchemaTypes.Array,
		default: [],
	},
	referralsCount: { type: Number, default: 0 },
	role: {
		type: String,
		enum: ['user', 'creator'],
		default: 'user',
	},
	isActive: {
		type: Boolean,
		default: true,
	},

	// otp and kyc
	otpCode: {
		type: Number,
		require: true,
	},
	isOTPVerified: {
		type: Boolean,
		default: false,
	},
	otpExpiresIn: Date,
	isCompletedKyc: {
		type: Boolean,
		default: false,
	},

	//////////////////////
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetEpires: Date,

	// user metrics
	followers: [{ type: mongoose.Schema.Types.ObjectId }],
	following: [{ type: mongoose.Schema.Types.ObjectId }],
	followerRequestsSent: [{ type: mongoose.Schema.Types.ObjectId }],
	followerRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId }],
	totalPosts: { type: Number, default: 0 },
	totalLikes: { type: Number, default: 0 },
	totalEarnings: { type: Number, default: 0 },

	// products
	totalProducts: { type: Number, default: 0 },
	productBought: [{ type: mongoose.Schema.Types.ObjectId }],
	blogPostBought: [{ type: mongoose.Schema.Types.ObjectId }],

	

}, {
	timestamps: true
});

// onSave pre hook
const saltRounds = 12;
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	const hashedPassword = await bcrypt.hash(this.password, saltRounds);
	this.password = hashedPassword;
	this.passwordConfirm = undefined;
	next();
});
userSchema.pre("save", async function (next) {
	if (this.isModified("password") || this.isNew) return next();
	this.passwordChangedAt = Date.now() - 100;
	next();
});
userSchema.pre("save", function (next) {
	const slug = slugify(this.username, { lower: true });
	this.slug = `${slug}-${this._id}`;
	this.referralUrl = `refer/${this.username}-${crypto.randomUUID()}`;
	this.profileUrl = `profile/${this.slug}`;
	next();
});
userSchema.pre("save", function (next) {
	this.otpExpiresIn = Date.now() + 5 * 60 * 1000;
	next();
});

// Instance methods
userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
	if (this.passwordChangedAt) {
		const changeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return jwtTimeStamp < changeTimeStamp;
	}
	// return false means not changed
	return false;
};
userSchema.methods.comparePassword = async function (candidatePassword, hashedPassword) {
	const encrypted = await bcrypt.compare(candidatePassword, hashedPassword);
	return encrypted;
};
userSchema.methods.createPasswordResetToken = function () {
	// create random bytes token
	const resetToken = crypto.randomBytes(32).toString("hex");

	// simple hash random bytes token
	const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
	this.passwordResetToken = hashedToken;

	// create time limit for token to expire (10 mins)
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	return resetToken;
	// send the unencrypted version
};

userSchema.methods.isOTPExpired = function () {
	if (this.otpCode && this.otpExpiresIn) {
		return Date.now() > this.otpExpiresIn;
	}
	return false;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
