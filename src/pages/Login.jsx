import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  auth,
  googleProvider,
} from "../firebase";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/");
    } catch (err) {
      setError(
        "Invalid email or password."
      );
    }

    setLoading(false);
  };

  const handleGoogleLogin =
    async () => {
      setError("");
      setMessage("");
      setLoading(true);

      try {
        await signInWithPopup(
          auth,
          googleProvider
        );

        navigate("/");
      } catch (err) {
        setError(
          "Google login failed."
        );
      }

      setLoading(false);
    };

  const handleForgotPassword =
    async () => {
      if (!email) {
        setError(
          "Enter your email first."
        );
        return;
      }

      try {
        await sendPasswordResetEmail(
          auth,
          email
        );

        setMessage(
          "Password reset email sent successfully."
        );
      } catch (err) {
        setError(
          "Unable to send reset email."
        );
      }
    };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#050816,#0B1120)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "430px",
          background:
            "rgba(255,255,255,0.05)",
          backdropFilter: "blur(18px)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          padding: "40px",
          borderRadius: "28px",
          color: "white",
          boxShadow:
            "0 20px 60px rgba(0,0,0,.5)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "34px",
          }}
        >
          Welcome Back 👋
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#9CA3AF",
            marginBottom: "30px",
          }}
        >
          Login to continue using
          NextFilm AI
        </p>

        {message && (
          <div
            style={{
              background:
                "rgba(16,185,129,.15)",
              border:
                "1px solid rgba(16,185,129,.3)",
              color: "#10B981",
              padding: "12px",
              borderRadius: "12px",
              marginBottom: "15px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background:
                "rgba(239,68,68,.15)",
              border:
                "1px solid rgba(239,68,68,.3)",
              color: "#EF4444",
              padding: "12px",
              borderRadius: "12px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div
            style={{
              position: "relative",
              marginBottom: "15px",
            }}
          >
            <Mail
              size={18}
              style={{
                position: "absolute",
                top: "18px",
                left: "15px",
                color: "#9CA3AF",
              }}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              style={{
                ...inputStyle,
                paddingLeft: "45px",
              }}
            />
          </div>

          <div
            style={{
              position: "relative",
            }}
          >
            <Lock
              size={18}
              style={{
                position: "absolute",
                top: "18px",
                left: "15px",
                color: "#9CA3AF",
              }}
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              style={{
                ...inputStyle,
                paddingLeft: "45px",
                paddingRight: "50px",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              style={{
                position: "absolute",
                right: "15px",
                top: "16px",
                background: "none",
                border: "none",
                color: "#9CA3AF",
                cursor: "pointer",
              }}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <div
            style={{
              textAlign: "right",
              marginTop: "12px",
            }}
          >
            <span
              onClick={
                handleForgotPassword
              }
              style={{
                color: "#00E5A8",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loginButton}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "25px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#1F2937",
            }}
          />

          <span
            style={{
              padding: "0 15px",
              color: "#9CA3AF",
            }}
          >
            OR
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#1F2937",
            }}
          />
        </div>

        <button
          onClick={
            handleGoogleLogin
          }
          style={googleButton}
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "30px",
            color: "#D1D5DB",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#00E5A8",
              textDecoration:
                "none",
              fontWeight: "600",
            }}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "14px",
  border: "1px solid #1F2937",
  background:
    "rgba(255,255,255,0.05)",
  color: "white",
  fontSize: "16px",
  outline: "none",
  boxSizing: "border-box",
};

const loginButton = {
  width: "100%",
  marginTop: "20px",
  padding: "15px",
  borderRadius: "14px",
  border: "none",
  background:
    "linear-gradient(135deg,#00E5A8,#7C3AED)",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
};

const googleButton = {
  width: "100%",
  padding: "15px",
  borderRadius: "14px",
  border: "none",
  background: "#ffffff",
  color: "#111827",
  fontWeight: "600",
  fontSize: "16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
};