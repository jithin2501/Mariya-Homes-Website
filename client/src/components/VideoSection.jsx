import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/VideoSection.css';

const VideoSection = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/video")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.videoUrl) {
          setVideoUrl(data.videoUrl);
        }
      })
      .catch((err) => console.error("Video fetch error:", err));
  }, []);

  return (
    <section className="video-section">
      <div className="video-container">
       <div className="video-overlay-text">
  <h2>
    See Our Properties <br /> in Action.
  </h2>

  <p>
    Step inside and explore our <strong>exclusive listings</strong> with
    high-quality video tours. Get a real feel for the space, design, and neighborhood from the
    comfort of your screen.
  </p>

  <button
    className="btn-overlay-primary"
    onClick={() => navigate("/properties")}
  >
    Get Started
  </button>
</div>
        {/* Only render video if URL exists */}
        {videoUrl && (
          <video autoPlay muted loop playsInline preload="auto">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </section>
  );
};

export default VideoSection;
