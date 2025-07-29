import express from "express";
import rateLimit from "express-rate-limit";
import {
    getUserProfile,
    login,
    logout,
    register,
    updateProfile,
    verifyOTP // Import the new controller
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { verifyRecaptcha } from "../middlewares/recaptchaMiddleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 5, // Limit each IP to 5 login attempts 
    handler: (req, res) => {
        const resetTime = req.rateLimit.resetTime;
        const retryAfterSec = Math.ceil((resetTime - Date.now()) / 1000);

        return res.status(429).json({
            success: false,
            message: "Too many login attempts",
            retryAfter: retryAfterSec,
            resetTime: resetTime
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

// OTP-specific rate limiter (more strict than general auth)
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 OTP attempts per window
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many OTP attempts. Please try again later."
        });
    }
});

// Routes
router.route("/register").post(authLimiter, verifyRecaptcha, register);
router.route("/login").post(authLimiter, login);
router.route("/verify-otp").post(otpLimiter, verifyOTP);

// Protected routes
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(
    isAuthenticated,
    upload.single("profilePhoto"),
    updateProfile
);

export default router;