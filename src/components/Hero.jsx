import { useState } from "react";

import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

import heroBg from "../assets/hero-bg.png";

export default function Hero({
  searchMovies,
}) {
  const [query, setQuery] =
    useState("");

  const { scrollY } = useScroll();

  const backgroundY =
    useTransform(
      scrollY,
      [0, 1000],
      [0, 250]
    );

  const contentY = useTransform(
    scrollY,
    [0, 1000],
    [0, 100]
  );

  const aiPrompts = [
    "Recommend a mind-bending sci-fi movie",
    "Suggest a dark psychological thriller",
    "Find a hidden sci-fi masterpiece",
    "Recommend a feel-good comedy movie",
    "Show me an emotional movie like Interstellar",
    "Suggest an action movie with amazing visuals",
    "Recommend a movie for a rainy evening",
    "Find a movie with a shocking twist ending",
    "Suggest a movie similar to Inception",
    "Recommend a highly rated mystery film",
    "Show me the best survival movies",
    "Recommend a futuristic cyberpunk movie",
    "Find an underrated Netflix movie",
    "Suggest a movie with beautiful cinematography",
    "Recommend a movie based on true events",
  ];

  const handleSearch = () => {
    if (!query.trim()) return;

    searchMovies(query);
  };

  const handleAiSuggestion =
    () => {
      const randomPrompt =
        aiPrompts[
          Math.floor(
            Math.random() *
              aiPrompts.length
          )
        ];

      setQuery(randomPrompt);

      setTimeout(() => {
        searchMovies(
          randomPrompt
        );
      }, 100);
    };

  return (
    <motion.section
      style={{
        minHeight: "85vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        padding: "80px",
        boxSizing: "border-box",
        color: "white",
        position: "relative",
        overflow: "hidden",

        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(3,7,18,0.95) 0%,
            rgba(3,7,18,0.75) 40%,
            rgba(3,7,18,0.55) 70%,
            rgba(3,7,18,0.9) 100%
          ),
          url(${heroBg})
        `,
        backgroundSize: "cover",
        backgroundPosition:
          "center",
      }}
    >
      {/* Glow */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          y: backgroundY,

          background:
            "radial-gradient(circle at left center, rgba(0,229,168,.15), transparent 40%)",
        }}
      />

      {/* LEFT */}
      <motion.div
        initial={{
          opacity: 0,
          x: -80,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 1,
        }}
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "650px",
          y: contentY,
        }}
      >
        <h1
          style={{
            fontSize: "78px",
            lineHeight: "1",
            marginBottom: "25px",
            fontWeight: "900",
            letterSpacing: "-2px",
          }}
        >
          Discover Movies
          <br />

          <span
            style={{
              color: "#00E5A8",
            }}
          >
            With AI
          </span>
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            fontSize: "22px",
            lineHeight: "1.8",
            marginBottom: "35px",
            maxWidth: "600px",
          }}
        >
          Find your next favorite
          movie in seconds.
          Describe a mood, story,
          actor or genre and let
          NextFilm AI find the
          perfect movie.
        </p>

        {/* Search */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <input
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              handleSearch()
            }
            placeholder="Search movies, genres, moods..."
            style={{
              flex: 1,
              padding: "18px 22px",
              borderRadius:
                "14px",
              border:
                "1px solid rgba(255,255,255,.12)",
              background:
                "rgba(255,255,255,.08)",
              backdropFilter:
                "blur(10px)",
              color: "white",
              outline: "none",
              fontSize: "17px",
            }}
          />

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={
              handleSearch
            }
            style={{
              padding:
                "18px 35px",
              border: "none",
              borderRadius:
                "14px",
              fontWeight: "700",
              cursor: "pointer",
              color: "white",
              fontSize: "16px",
              background:
                "linear-gradient(135deg,#00E5A8,#7C3AED)",
              boxShadow:
                "0 0 25px rgba(124,58,237,.45)",
            }}
          >
            Search
          </motion.button>
        </div>

        {/* AI CARD */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={
            handleAiSuggestion
          }
          style={{
            cursor: "pointer",
            padding: "22px",
            borderRadius: "20px",
            background:
              "rgba(255,255,255,.05)",
            backdropFilter:
              "blur(12px)",
            border:
              "1px solid rgba(0,229,168,.3)",
            boxShadow:
              "0 0 30px rgba(0,229,168,.12)",
            maxWidth: "520px",
          }}
        >
          <div
            style={{
              fontSize: "26px",
              fontWeight: "700",
              marginBottom: "10px",
              color: "#00E5A8",
            }}
          >
            ✨ Ask NextFilm AI
          </div>

          <div
            style={{
              color: "#d1d5db",
              lineHeight: "1.7",
            }}
          >
            Click here to get a
            random AI-powered movie
            recommendation instantly.
          </div>
        </motion.div>
      </motion.div>

      {/* RIGHT */}
      <motion.div
        initial={{
          opacity: 0,
          x: 80,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 1.2,
        }}
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "320px",
          textAlign: "left",
        }}
      >
        <p
          style={{
            color: "#f3f4f6",
            fontSize: "30px",
            lineHeight: "1.7",
            fontStyle: "italic",
          }}
        >
          “Movies are mirrors.
          <br />
          You only see in them
          <br />
          what you already
          <br />
          have inside you.”
        </p>

        <p
          style={{
            marginTop: "20px",
            color: "#9ca3af",
            fontSize: "18px",
          }}
        >
          — Neil Gaiman
        </p>
      </motion.div>
    </motion.section>
  );
}