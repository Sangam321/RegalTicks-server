import mongoose from "mongoose";

const watch_detailsProgressSchema = new mongoose.Schema({
    watch_detailsId: { type: String },
    viewed: { type: Boolean }
});

const watchProgressSchema = new mongoose.Schema({
    userId: { type: String },
    watchId: { type: String },
    completed: { type: Boolean },
    watch_detailsProgress: [watch_detailsProgressSchema]
});

export const WatchProgress = mongoose.model("WatchProgress", watchProgressSchema);