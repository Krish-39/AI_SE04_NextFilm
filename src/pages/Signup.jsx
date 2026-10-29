import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";

import AuthLayout from "../components/AuthLayout";
import { authMessage } from "../lib/authMessage";
import GoogleButton from "../components/GoogleButton";
import { auth, googleProvider } from "../firebase";
import { useToast } from "../lib/contexts";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function Signup() {
  useDocumentTitle("Create account");
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const next = location.state?.from || "/";

  const done = () => {
    toast("Account created. Start saving titles to your watchlist.", "success");
    navigate(next, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) await updateProfile(user, { displayName: name.trim() });
      done();
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      done();
    } catch (err) {
      setError(authMessage(err));
    }
  };

  return (
    <AuthLayout
      card={{ name, email }}
      title="Become a member"
      subtitle="Free, forever. One slip for every film and series you want to watch, on every device."
      footer={
        <>
          Already have an account? <Link to="/login" state={location.state}>Sign in</Link>
        </>
      }
    >
      <form className="auth__form" onSubmit={submit} noValidate>
        {error && (
          <p className="auth__alert auth__alert--error" role="alert">
            {error}
          </p>
        )}
        <div className="field">
          <label htmlFor="name">
            Name <span className="auth__hint">(optional)</span>
          </label>
          <input
            id="name"
            className="input"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="new-password"
            minLength={6}
            aria-describedby="password-hint"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p id="password-hint" className="auth__hint">
            At least 6 characters.
          </p>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !email || password.length < 6}>
          {busy ? "Printing your card…" : "Get my card"}
        </button>
        <p className="auth__divider">or</p>
        <GoogleButton onClick={google} />
      </form>
    </AuthLayout>
  );
}
