const express = require("express");
const upload = require("../middleware/videoUpload");
const {
  uploadVideo,
  getVideo,
  deleteVideo,
} = require("../controllers/videoController");

const router = express.Router();

router.post("/admin/video", upload.single("video"), uploadVideo);
router.get("/video", getVideo);
router.delete("/admin/video", deleteVideo);

module.exports = router;
