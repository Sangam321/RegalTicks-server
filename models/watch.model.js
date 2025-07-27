import mongoose from "mongoose";

const watchSchema = new mongoose.Schema({
    watchTitle: {
        type: String,
        required: true
    },
    subTitle: { type: String },
    description: { type: String },
    category: {
        type: String,
        required: true
    },
    watchLevel: {
        type: String,
        enum: ["Smart", "Analog", "Luxury"]
    },
    watchPrice: {
        type: Number
    },
    watchThumbnail: {
        type: String
    },
    enrolledBuyers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    watch_detailss: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Watch_Details"
        }
    ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isPublished: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

export const Watch = mongoose.model("Watch", watchSchema);