import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { auth } from "../firebase";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

export default function Navbar() {
  const [showCategories, setShowCategories] =
    useState(false);

  const [user, setUser] = useState(null);

  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setShowCategories(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const goToSection = (id) => {
    setShowCategories(false);

    navigate("/");

    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 300);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #1f2937",
        padding: "18px 50px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg,#00E5A8,#7C3AED)",
            }}
          />

          <h2
            style={{
              color: "white",
              margin: 0,
            }}
          >
            NextFilm
            <span
              style={{
                color: "#00E5A8",
              }}
            >
              {" "}
              AI
            </span>
          </h2>
        </Link>

        {/* Center */}
        <div
          style={{
            display: "flex",
            gap: "35px",
            alignItems: "center",
            color: "#d1d5db",
            fontSize: "18px",
          }}
        >
          <div
            ref={dropdownRef}
            style={{
              position: "relative",
            }}
          >
            <span
              onClick={() =>
                setShowCategories(
                  !showCategories
                )
              }
              style={{
                cursor: "pointer",
              }}
            >
              Categories ▼
            </span>

            {showCategories && (
              <div
                style={{
                  position: "absolute",
                  top: "45px",
                  left: "-40px",
                  width: "280px",
                  background: "#0f172a",
                  borderRadius: "20px",
                  padding: "20px",
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "16px",
                  boxShadow:
                    "0 20px 40px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  onClick={() =>
                    goToSection(
                      "trending"
                    )
                  }
                  style={{
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  Trending Today
                </div>

                <div
                  onClick={() =>
                    goToSection(
                      "top-rated"
                    )
                  }
                  style={{
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  Top Rated
                </div>

                <div
                  onClick={() =>
                    goToSection(
                      "action"
                    )
                  }
                  style={{
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  Action Movies
                </div>

                <div
                  onClick={() =>
                    goToSection(
                      "comedy"
                    )
                  }
                  style={{
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  Comedy Movies
                </div>

                <div
                  onClick={() =>
                    goToSection(
                      "scifi"
                    )
                  }
                  style={{
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  Sci-Fi Movies
                </div>

                <div
                  onClick={() =>
                    goToSection(
                      "horror"
                    )
                  }
                  style={{
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  Horror Movies
                </div>
              </div>
            )}
          </div>

          <Link
            to="/watchlist"
            style={{
              color: "#d1d5db",
              textDecoration: "none",
            }}
          >
            ❤️ Watchlist
          </Link>
        </div>

        {/* Right Side */}
        {user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <img
              src={
                user.photoURL ||
                "https://ui-avatars.com/api/?name=User"
              }
              alt="profile"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
              }}
            />

            <span
              style={{
                color: "white",
                fontSize: "14px",
              }}
            >
              {user.email}
            </span>

            <button
              onClick={handleLogout}
              style={{
                background:
                  "#ef4444",
                border: "none",
                color: "white",
                padding:
                  "10px 16px",
                borderRadius:
                  "12px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "15px",
            }}
          >
            <Link to="/login">
              <button
                style={{
                  background:
                    "transparent",
                  border:
                    "1px solid #374151",
                  color: "white",
                  padding:
                    "10px 18px",
                  borderRadius:
                    "12px",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </Link>

            <Link to="/signup">
              <button
                style={{
                  background:
                    "linear-gradient(135deg,#00E5A8,#7C3AED)",
                  border: "none",
                  color: "white",
                  padding:
                    "10px 18px",
                  borderRadius:
                    "12px",
                  cursor: "pointer",
                  fontWeight:
                    "600",
                }}
              >
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}