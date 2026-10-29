import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../lib/contexts";
import Reels from "./Reels";

// Firebase restores a session asynchronously, so wait for the first auth
// state before deciding to redirect a signed-in user to /login.
export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="page page--loading">
        <Reels label="Checking your membership…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
