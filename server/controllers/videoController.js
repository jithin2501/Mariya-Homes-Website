exports.uploadVideo = async (req, res) => {
  try {
    const Video = require("../models/Video");

    await Video.deleteMany();

    const video = new Video({
      videoUrl: req.file.path,
    });

    await video.save();

    res.json({ message: "Video uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVideo = async (req, res) => {
  const Video = require("../models/Video");
  const video = await Video.findOne().sort({ createdAt: -1 });
  res.json(video);
};

exports.deleteVideo = async (req, res) => {
  try {
    const Video = require("../models/Video");
    const cloudinary = require("../config/cloudinary");

    const video = await Video.findOne();
    if (!video) return res.json({ message: "No video found" });

    const parts = video.videoUrl.split("/");
    const fileName = parts[parts.length - 1].split(".")[0];
    const publicId = `website-videos/${fileName}`;

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    await Video.deleteMany();

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
