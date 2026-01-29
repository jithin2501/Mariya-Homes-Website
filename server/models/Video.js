const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    videoUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
