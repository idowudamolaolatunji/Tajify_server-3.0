const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
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
		required: [true, "Admin must provide a password"],
		trim: true,
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, "Admin must confirm their password"],
		validate: {
			validator: function (el) {
				return el === this.password;
			},
			message: "Password are not the same",
		},
	},
	role: {
		type: String,
		default: 'admin'
	},
	image: {
		type: String,
		default: "https://res.cloudinary.com/dy3bwvkeb/image/upload/v1690840131/let10usgypqcessgfybt.png",
	},
	isActive: {
        type: Boolean,
        default: true
    }
});

// onSave pre hook
const saltRounds = 12;
adminSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	const hashedPassword = await bcrypt.hash(this.password, saltRounds);
	this.password = hashedPassword;
	this.passwordConfirm = undefined;
	next();
});

adminSchema.pre("save", async function (next) {
	if (this.isModified("password") || this.isNew) return next();
	this.passwordChangedAt = Date.now() - 100;
	next();
});

// Instance methods
adminSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
	if (this.passwordChangedAt) {
		const changeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return jwtTimeStamp < changeTimeStamp;
	}
	// return false means not changed
	return false;
};

adminSchema.methods.comparePassword = async function (candidatePassword, hashedPassword) {
	const encrypted = await bcrypt.compare(candidatePassword, hashedPassword);
	return encrypted;
};

adminSchema.methods.createPasswordResetToken = function () {
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


const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
