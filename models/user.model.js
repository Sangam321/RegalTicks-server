import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["seller", "buyer"],
        default: 'buyer'
    },
    enrolledWatchs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Watch'
        }
    ],
    photoUrl: {
        type: String,
        default: ""
    },
    // New fields for OTP verification
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);