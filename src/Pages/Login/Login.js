import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { loginUser } from "../../Helpers/apiCalls/authApi";
import { setUserSession, toastStyle } from "../../Helpers/Utils/Common";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [username, set_username] = useState("");
  const [password, set_password] = useState("");
  const [is_loading, set_is_loading] = useState(false);
  const [error_msg, set_error_msg] = useState("");
  const [show_password, set_show_password] = useState(false);

  async function handle_login(e) {
    e.preventDefault();
    if (!username || !password) {
      set_error_msg("Please enter your username and password.");
      return;
    }
    set_is_loading(true);
    set_error_msg("");

    const response = await loginUser(username, password);
    if (response.data && response.data.token) {   // ← check for token instead
      setUserSession(response.data.token, response.data);
      toast.success("Welcome back!", { style: toastStyle() });
      navigate("/dashboard");
    } else {
      set_error_msg("Invalid username or password.");
    }
    set_is_loading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-section">
          <h1 className="login-title">Logistics ERP</h1>
          <p className="login-subtitle">Trucking Management System</p>
        </div>

        <form onSubmit={handle_login}>
          <div className="login-form-group">
            <label className="login-form-label">Username</label>
            <input
              type="text"
              className="login-form-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => set_username(e.target.value)}
              autoFocus
            />
          </div>
          <div className="login-form-group">
            <label className="login-form-label">Password</label>
            <div className="login-password-wrap">
            <input
              type={show_password ? "text" : "password"}
              className="login-form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => set_password(e.target.value)}
            />
            <span className="login-eye-btn" onClick={() => set_show_password(!show_password)}>
              <FontAwesomeIcon icon={show_password ? faEyeSlash : faEye} />
            </span>
          </div>
          </div>

          {error_msg && <div className="login-error">{error_msg}</div>}

          <button type="submit" className="login-btn" disabled={is_loading}>
            {is_loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          © 2025 Logistics ERP · All rights reserved
        </div>
      </div>
    </div>
  );
}
