import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import WatchlistPage from "./pages/WatchlistPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <div
      style={{
        background: "#050816",
        minHeight: "100vh",
      }}
    >
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}