import { useEffect, useState } from "react";
import "./styles/AdminVideo.css";

const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB

const AdminVideo = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch current video
  const fetchVideo = async () => {
    try {
      const res = await fetch("/api/video");
      const data = await res.json();

      if (data && data.videoUrl) {
        setCurrentVideo(data.videoUrl);
      } else {
        setCurrentVideo(null);
      }
    } catch (err) {
      console.error("Video fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, []);

  // Upload video
  const handleUpload = async () => {
    if (!videoFile) {
      alert("Please select a video file");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
    setLoading(true);
    const res = await fetch("/api/admin/video", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // Check res.ok first; this ensures status 200 codes pass
    if (!res.ok) {
      throw new Error("Upload failed");
    }

    // Set the video if it exists, otherwise fetch it manually
    if (data.videoUrl) {
      setCurrentVideo(data.videoUrl);
    } else {
      await fetchVideo(); // Fallback to refresh data
    }

    setVideoFile(null);
    alert("Video uploaded successfully");
  } catch (err) {
    console.error(err);
    alert("Video upload failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // Delete video
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the current video?"))
      return;

    try {
      await fetch("/api/admin/video", {
        method: "DELETE",
      });

      setCurrentVideo(null);
      alert("Video deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="admin-video-page">
      <h1 className="admin-page-title">UPLOAD WEBSITE VIDEO</h1>

      <div className="admin-video-card">
        {/* Upload Section */}
        <div className="upload-row">
          <label className="file-input-wrapper">
            <input
              type="file"
              accept="video/*"   // ✅ ALLOW ALL VIDEOS
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                // Size check only
                if (file.size > MAX_VIDEO_SIZE) {
                  alert("Video size must be less than 200MB");
                  e.target.value = null;
                  return;
                }

                setVideoFile(file);
              }}
            />
            <span>
              {videoFile
                ? videoFile.name
                : "Choose video file (max 100MB)"}
            </span>
          </label>

          <button
            onClick={handleUpload}
            className="upload-btn"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Video"}
          </button>
        </div>

        {/* Current Video Preview */}
        {currentVideo && (
          <div className="current-video-section">
            <p className="current-video-label">Current Uploaded Video</p>

            <video controls className="admin-video-preview">
              <source src={currentVideo} />
              Your browser does not support the video tag.
            </video>

            <button
              onClick={handleDelete}
              className="delete-video-btn"
            >
              Delete Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVideo;
