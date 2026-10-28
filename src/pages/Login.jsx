import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

import AuthLayout from "../components/AuthLayout";
import { authMessage } from "../lib/authMessage";
import GoogleButton from "../components/GoogleButton";
import { auth, googleProvider } from "../firebase";
import { useToast } from "../lib/contexts";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function Login() {
  useDocumentTitle("Sign in");
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState(null);
  const next = location.state?.from || "/";

  const done = () => {
    toast("Welcome back", "success");
    navigate(next, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setAlert(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      done();
    } catch (err) {
      setAlert({ tone: "error", text: authMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setAlert(null);
    try {
      await signInWithPopup(auth, googleProvider);
      done();
    } catch (err) {
      setAlert({ tone: "error", text: authMessage(err) });
    }
  };

  const reset = async () => {
    if (!email.trim()) {
      setAlert({ tone: "error", text: "Enter your email above first, then choose “Forgot password?”." });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAlert({ tone: "success", text: `We sent a reset link to ${email.trim()}.` });
    } catch (err) {
      setAlert({ tone: "error", text: authMessage(err) });
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Pick up your watchlist where you left it."
      footer={
        <>
          New to NextFilm? <Link to="/signup" state={location.state}>Create an account</Link>
        </>
      }
    >
      <form className="auth__form" onSubmit={submit} noValidate>
        {alert && (
          <p className={`auth__alert auth__alert--${alert.tone}`} role="alert">
            {alert.text}
          </p>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <div className="auth__row">
            <label htmlFor="password">Password</label>
            <button type="button" className="auth__link-btn" onClick={reset}>
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !email || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="auth__divider">or</p>
        <GoogleButton onClick={google} />
      </form>
    </AuthLayout>
  );
}
