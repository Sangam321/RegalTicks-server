import mongoose from "mongoose";

const watch_detailsSchema = new mongoose.Schema({
  watch_detailsTitle: {
    type: String,
    required: true,
  },
  videoUrl: { type: String },
  publicId: { type: String },
  isPreviewFree: { type: Boolean },
}, { timestamps: true });

export const Watch_Details = mongoose.model("Watch_Details", watch_detailsSchema);
