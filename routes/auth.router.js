const express = require('express');

const singupHandler = require("../controllers/signupController");
const loginHandler = require("../controllers/loginController");
const { 
    logoutHandler, 
    forgotPasswordHandler, 
    resetPasswordHandler, 
    verifyEmailHandler,
    refreshTokenHandler
} = require("../controllers/authController");

const verifyUser = require("../middleware/verifyUser");

const router = express.Router();

// User registration
router.route("/register")
    .post(singupHandler);

// User login
router.route("/login")
    .post(loginHandler);

// User logout
router.route("/logout")
    .post(verifyUser, logoutHandler);

// Password management
router.route("/forgot-password")
    .post(forgotPasswordHandler);

router.route("/reset-password")
    .post(resetPasswordHandler);

// Email verification
router.route("/verify-email/:token")
    .get(verifyEmailHandler);

// Token refresh
router.route("/refresh-token")
    .post(refreshTokenHandler);

module.exports = router;