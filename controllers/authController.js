const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/AdminModel");

const sendEmail = require('../utils/sendEmail')
const otpEmail = require('../utils/emailTemplates/otpEmail');
const Wallet = require("../models/walletModel");

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

const generateOtp = () => {
	return Math.floor(1000 + Math.random() * 9000);
};


exports.signup = async (req, res) => {
	try {
		const emailExist = await User.findOne({ email: req.body.email });
		const usernameExist = await User.findOne({ username: req.body.username });
		if (emailExist) return res.json({ message: "Email already used, User Exists" });
		if (usernameExist) return res.json({ message: "Username already used, User Exists" });

        const userWallet = await Wallet.findOne({ user: requestingUser._id });

		const newOtp = generateOtp();
		const emailOtp = otpEmail(newOtp);
		const newUser = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			passwordConfirm: req.body.passwordConfirm,
			otpCode: newOtp,
			myInviterID: req.params.recruitingUserId ? req.params.recruitingUserId : null,
		});

		await Wallet.create({ user: newUser._id, tajiWalletBalance: 100 });

		if (req.params.recruitingUserId) {
			await User.findByIdAndUpdate(recruitingUserId, {
					$inc: { referralsCount: 1 },
					$push: { referralsList: newUser._id },
				}, { new: true },
			);
		}
		
		res.status(200).json({
			status: "success",
			message: "Success! OTP sent to email address. Valid for 5 minutes",
			data: {
				user: newUser,
			},
		});
		await sendEmail({
			email: newUser.email,
            subject: "Tajify Verification Code",
            message: emailOtp
		})
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message || "Something went wrong!",
		});
	}
};


/*
exports.adminSignup = async (req, res) => {
	try {
		const admin = await Admin.create({
			email: req.body.email,
			password: req.body.password,
			passwordConfirm: req.body.passwordConfirm,
		});

		res.status(200).json({
			status: "success",
			data: {
				user: admin,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message || "Something went wrong!",
		});
	}
};
*/


exports.userLogin = async (req, res) => {
	try {
		console.log(req.body);
		const { email, password } = req.body;
		if (!email || !password) {
			return res.json({ message: "Please provide email and password!" });
		}
		const user = await User.findOne({ email }).select("+password");
		if (!user || user === null) {
			return res.json({ message: "Account no longer exist" });
		}
		if (!user?.email || !(await user?.comparePassword(password, user.password))) {
			return res.json({ message: "Incorrect email or password " });
		}
		if (!user?.isActive) {
			return res.json({ message: "Account no longer active" });
		}
		if (!user.isOTPVerified) {
			return res.json({ message: "OTP Not Verified!" });
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_TOKEN, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});
		const cookieOptions = {
			expires: new Date(Date.now() + process.env.COOKIES_EXPIRES * 24 * 60 * 60 * 1000),
			httpOnly: true,
			secure: true,
		};
		res.cookie("jwt", token, cookieOptions);
		console.log(token);
		return res.status(200).json({
			status: "success",
			message: "Successfully Logged in!",
			data: {
				user,
			},
			token,
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message || "Something went wrong!",
		});
	}
};


// REQUEST OTP
exports.requestOtp = async (req, res) => {
	try {
		const requestingUser = await User.findOne({ email: req.body.email });
		if (!requestingUser) return res.json({ message: "You are not a valid user" });

		// SOME CHECKINGS
		if(requestingUser.isOTPVerified) {
			return res.json({ message: "You are already a verified user" });
		};
		if(!requestingUser.isOTPExpired()) {
			return res.json({ message: "OTP not yet expired" });
		}

		const newOtp = generateOtp();
		const emailOtp = otpEmail(newOtp)
		requestingUser.otpCode = newOtp;
		await requestingUser.save({ validateBeforeSave: false });

		res.status(200).json({
			status: 'success',
			message: 'Tajify Verification Code Resent!',
			data: {
				verifyingUser: requestingUser
			}
		})
		return await sendEmail({
			email: requestingUser.email,
            subject: "Tajify Verification Code Resent!",
            message: emailOtp,
		});

	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};

// VERIFYING OTP
exports.verifyOtp = async (req, res) => {
	try {
		const { email, otp } = req.body;

		// SOME CHECKINGS
		const requestingUser = await User.findOne({ email });
		if (!requestingUser || !requestingUser.isActive) {
			return res.json({ message: "Invalid User, User no longer exist!" });
		}
		if (requestingUser.isOTPExpired()) {
			return res.status(400).send({ error: "OTP expired. Please request a new one." });
		}
		if (requestingUser.otpCode !== otp) {
			return res.status(400).json({ message: "Invalid OTP Code, Try again!" });
		}
		requestingUser.isOTPVerified = true;
		requestingUser.otpCode = undefined;
		await requestingUser.save({ validateBeforeSave: false });

		res.status(200).json({
			status: "success",
			message: "OTP Verified",
			data: {
				verifiedUser: requestingUser,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};



// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.json({ message: "Please provide email and password!" });
		}
		const admin = await Admin.findOne({ email }).select("+password");
		if (!admin?.email || !(await admin.comparePassword(password, admin?.password))) {
			return res.json({ message: "Incorrect email or password " });
		}
		const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_TOKEN, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});
		const cookieOptions = {
			expires: new Date(Date.now() + process.env.COOKIES_EXPIRES * 24 * 60 * 60 * 1000),
			httpOnly: true,
			secure: true,
		};
		res.cookie("jwt", token, cookieOptions);

		return res.status(200).json({
			status: "success",
			data: {
				admin,
			},
			token,
		});

	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message || "Something went wrong!",
		});
	}
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
	try {
		// 1) Get user based on POSTed email
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			return res.status(404).json({ message: "There is no user with email address" });
		}

		// 2) Generate the random reset token
		const resetToken = user.createPasswordResetToken();
		await user.save({ validateBeforeSave: false });

		// 3) Send it to user's email

		const resetURL = `https://127.0.0.1:3005/api/users/reset-password/${resetToken}`;

		const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token (valid for 10 min)',
			message
		});

		user.passwordResetToken = undefined;
		user.passwordResetEpires = undefined;
		await user.save({ validateBeforeSave: false });

		res.status(200).json({
			status: "success",
			message: "Token Email successfully sent to email!",
			data: {
				user
			}
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message,
		});
	}
};


// RESET PASSWORD
exports.resetPassword = async (req, res) => {
	try {
		// get user based on token
		const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetEpires: { $gt: Date.now() },
		});
		console.log(user);

		// if token has not expired, there is a user, set new password
		if (!user) return res.status(404).json({ message: "Token is invalid or has expired" });
		user.password = req.body.password;
		user.passwordConfirm = req.body.passwordConfirm;
		user.passwordResetToken = undefined;
		user.passwordResetEpires = undefined;
		await user.save();

		// update changedPasswordAt for the user
		// done in userModel on the user schema

		// login user, send jwt
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_TOKEN, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});

		const cookieOptions = {
			expires: new Date(Date.now() + process.env.COOKIES_EXPIRES * 24 * 60 * 60 * 1000),
			httpOnly: true,
			secure: true,
		};
		res.cookies("jwt", token, cookieOptions);

		return res.status(200).json({
			status: "success",
			message: "Password reset successful",
			data: {
				user,
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "fail",
			message: err.message || "Something went wrong",
		});
	}
};


// USER LOGOUT
exports.logout = (req, res) => {
	res.clearCookie("jwt");
	res.status(200).json({ status: "success" });
};


// PASSWORD UPDATE
exports.updatePassword = async (req, res) => {
	try {
		console.log(req.params._id);
		// get user
		const user = await User.findById(req.user._id).select("+password");

		// check if POSTED current password is correct
		if (!(await user.comparePassword(req.body.passwordCurrent, user.password))) {
			return res.json({ message: "Your current password is wrong." });
		}

		// if so, update user password
		user.password = req.body.password;
		user.passwordConfirm = req.body.passwordConfirm;
		await user.save({ validateModifiedOnly: true });
		// User.findByIdAndUpdate, will not work here...

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_TOKEN, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});
		const cookieOptions = {
			expires: new Date(Date.now() + process.env.COOKIES_EXPIRES * 24 * 60 * 60 * 1000),
			httpOnly: true,
			secure: true,
		};
		res.cookie("jwt", token, cookieOptions);

		return res.status(201).json({
			status: "success",
			token,
			data: {
				user,
			},
		});
	} catch (err) {
		console.log(err);
		return res.status(404).json({
			status: "fail",
			message: err,
		});
	}
};
