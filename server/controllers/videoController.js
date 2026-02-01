exports.uploadVideo = async (req, res) => {
  try {
    const Video = require("../models/Video");

    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    // 🔥 keep only latest video
    await Video.deleteMany(); 
    
    // Create the new entry
    const newVideo = await Video.create({
      videoUrl: req.file.path, // This is the Cloudinary URL
    });

    // CHANGE: Return the videoUrl in the response!
    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      videoUrl: newVideo.videoUrl // Add this line
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Video upload failed",
    });
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
