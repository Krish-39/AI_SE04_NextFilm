import { useState } from "react";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase";

import {
  Link,
  useNavigate,
} from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
      }}
    >
      <form
        onSubmit={handleSignup}
        style={{
          width: "400px",
          background: "#0B1120",
          padding: "40px",
          borderRadius: "20px",
        }}
      >
        <h1>Create Account</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={inputStyle}
        />

        <button
          type="submit"
          style={buttonStyle}
        >
          Sign Up
        </button>

        <p
          style={{
            marginTop: "20px",
          }}
        >
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "15px",
  marginTop: "15px",
  borderRadius: "10px",
  border: "none",
};

const buttonStyle = {
  width: "100%",
  marginTop: "20px",
  padding: "15px",
  borderRadius: "10px",
  border: "none",
  background:
    "linear-gradient(135deg,#00E5A8,#7C3AED)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};