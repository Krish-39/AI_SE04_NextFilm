import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// Firebase restores a signed-in session asynchronously after a page load, so
// `auth.currentUser` is briefly null even for logged-in users. Wait for the
// first auth state before deciding whether to redirect.
export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(auth.currentUser);
  const [checking, setChecking] = useState(!auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  if (checking) {
    return (
      <div
        role="status"
        style={{ color: "#94a3b8", textAlign: "center", padding: "6rem 1rem" }}
      >
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
