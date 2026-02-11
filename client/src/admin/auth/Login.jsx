import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import "./Login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocusedOnPassword, setIsFocusedOnPassword] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    gsap.set('.character', { transformOrigin: "50% 100%" });
    gsap.to('.character', {
      scaleY: 1.05,
      scaleX: 0.98,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.2
    });

    const handleMouseMove = (e) => {
      if (isFocusedOnPassword || isPasswordVisible) return;
      const { clientX, clientY } = e;
      const x = (clientX - window.innerWidth / 2) / 30;
      const y = (clientY - window.innerHeight / 2) / 30;

      gsap.to('.eye-group', { x: x * 0.4, y: y * 0.2, duration: 0.4, ease: "power2.out" });
      gsap.to('#purple-group', { x: x * 0.2, duration: 0.6 });
      gsap.to('#black-group', { x: x * 0.5, duration: 0.6 });
      gsap.to('#orange-group', { x: x * 0.4, duration: 0.6 });
      gsap.to('#yellow-group', { x: x * 0.7, duration: 0.6 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isFocusedOnPassword, isPasswordVisible]);

  const updateEyeState = (focused, visible) => {
    if (visible) {
      gsap.to('.eye-group', { x: 0, y: -120, opacity: 0, scale: 0.6, duration: 0.35, ease: "power2.in" });
    } else if (focused) {
      gsap.to('.eye-group', { x: -25, y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
    } else {
      gsap.to('.eye-group', { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" });
    }
  };

const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Record the login event in the database
        await fetch(`/api/admin/users/${data.user.username}/last-login`, {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${data.token}` }
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("isAdminAuthenticated", "true");
        localStorage.setItem("adminUsername", data.user.username);
        localStorage.setItem("adminRole", data.user.role);
        
        navigate("/admin/contact");
      } else {
        alert(data.message || "Invalid Credentials");
      }
    } catch (err) {
      alert("Backend server connection error.");
    }
  };

  return (
    <div className="login-full-page">
      <div className="login-card">
        <div className="illustration-side">
          <svg id="blob-scene" viewBox="0 0 400 400">
            <g id="purple-group" className="character">
              <rect x="130" y="80" width="105" height="280" fill="#6B38FB" />
              <g className="eye-group" id="purple-eyes">
                <circle cx="160" cy="115" r="3.5" fill="white" />
                <circle cx="205" cy="115" r="3.5" fill="white" />
                <rect x="175" y="130" width="15" height="2.5" rx="1.25" fill="white" />
              </g>
            </g>
            <g id="black-group" className="character">
              <rect x="210" y="150" width="65" height="210" fill="#1C1C1E" />
              <g className="eye-group" id="black-eyes">
                <circle cx="225" cy="180" r="4.5" fill="white" />
                <circle cx="245" cy="180" r="4.5" fill="white" />
              </g>
            </g>
            <g id="orange-group" className="character">
              <path d="M60 360 A 80 80 0 0 1 240 360 Z" fill="#FF7426" />
              <g className="eye-group" id="orange-eyes">
                <circle cx="110" cy="315" r="5" fill="#222" />
                <circle cx="160" cy="315" r="5" fill="#222" />
                <path d="M125 325 Q 135 335 145 325" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
            </g>
            <g id="yellow-group" className="character">
              <path d="M260 360 L 260 270 A 40 40 0 0 1 340 270 L 340 360 Z" fill="#FFD200" />
              <g className="eye-group" id="yellow-eyes">
                <circle cx="285" cy="275" r="3" fill="#222" />
                <circle cx="315" cy="275" r="3" fill="#222" />
                <rect x="292.5" y="290" width="15" height="2.5" rx="1.25" fill="#222" />
              </g>
            </g>
          </svg>
        </div>

        <div className="form-side">
          <div className="header-section">
            <h2>Welcome back!</h2>
            <p>Please enter admin details</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="Enter username"
                onChange={(e) => {
                  setCredentials({...credentials, username: e.target.value});
                  const val = e.target.value.length;
                  const moveX = Math.min(val * 1.5, 25) - 10;
                  gsap.to('.eye-group', { x: moveX, duration: 0.3 });
                }}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input 
                  type={isPasswordVisible ? "text" : "password"} 
                  className="input-field"
                  placeholder="••••••••"
                  onFocus={() => { setIsFocusedOnPassword(true); updateEyeState(true, isPasswordVisible); }}
                  onBlur={() => { setIsFocusedOnPassword(false); updateEyeState(false, isPasswordVisible); }}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => {
                    const next = !isPasswordVisible;
                    setIsPasswordVisible(next);
                    updateEyeState(isFocusedOnPassword, next);
                  }}
                >
                  <svg className={isPasswordVisible ? "is-hidden" : ""} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg className={!isPasswordVisible ? "is-hidden" : ""} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary">Log in</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;