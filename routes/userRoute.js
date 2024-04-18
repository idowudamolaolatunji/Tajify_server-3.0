const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { uploadSinglePhoto, resizeProfilePhoto } = require("../middleware/multer");
const { authProtected } = require("../middleware/auth");

const router = express.Router();

/////////////////////////////////////////////////////////////////
router.post("/signup", authController.signup);
router.post("/signup/:recruitingUserId", authController.signup);
router.post("/login", authController.userLogin);
router.get("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

// 
router.get("/getMyObj", authProtected, userController.getMyObj);

// admin
// router.post("/admin/signup", authController.adminSignup); // not needed anytime soon!
router.post("/admin-login", authController.adminLogin);

// OTP
router.post("/request-otp", authController.requestOtp);
router.post("/verify-otp", authController.verifyOtp);

// update user profile
router.patch("/update-my-profile", authProtected , userController.updateMyProfile)
router.patch("/update-password", authProtected, authController.updatePassword);


// update profile picture
router.patch("/update-my-profile-picture", authProtected, uploadSinglePhoto, resizeProfilePhoto, userController.updateMyProfilePicture);

// get users
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser)
router.get("/search", userController.generalSearch);

// admin tasks
router
.route("/:id")
.get( userController.updateUser)
.delete( userController.deleteUser);

// follow implementations
router.get("/username/:id", userController.getUserName)
router.post("/:id/request-follow", authProtected, userController.sendFollowRequest);
router.post("/:id/cancle-follow-request", authProtected, userController.cancleFollowRequest);
router.post("/accept-follow/:id", authProtected, userController.acceptFollowRequest);
router.post("/reject-follow/:id", authProtected, userController.rejectFollowRequest);
router.post("/:id/unfollow", authProtected, userController.unFollowUser);


// TOP CREATOR ROUTE
router.get("/creator/top-creators", userController.topCreators);


module.exports = router;