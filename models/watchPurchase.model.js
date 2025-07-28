import mongoose from "mongoose";
const watchPurchaseSchema = new mongoose.Schema({
    watchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Watch',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentId: {
        type: String,
        required: true
    }

}, { timestamps: true });
export const WatchPurchase = mongoose.model('WatchPurchase', watchPurchaseSchema);