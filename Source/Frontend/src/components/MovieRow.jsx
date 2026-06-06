import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import MovieModal from "./MovieModal";

export default function MovieRow({
  title,
  icon,
  iconColor = "#fff",
  endpoint,
  id,
}) {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] =
    useState(null);

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results || []);
      })
      .catch((err) => {
        console.error(
          "Movie fetch error:",
          err
        );
      });
  }, [endpoint]);

  return (
    <>
      <motion.section
        id={id}
        initial={{
          opacity: 0,
          y: 80,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        transition={{
          duration: 0.8,
        }}
        style={{
          width: "100%",
          padding: "40px 60px",
          color: "white",
          scrollMarginTop: "100px",
          boxSizing: "border-box",
        }}
      >
        {/* Title */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          {icon && (
            <span
              style={{
                color: iconColor,
                display: "flex",
                alignItems: "center",
              }}
            >
              {icon}
            </span>
          )}

          <h2
            style={{
              margin: 0,
              fontSize: "52px",
              fontWeight: "700",
            }}
          >
            {title}
          </h2>
        </motion.div>

        {/* Movies Row */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: "15px",
            scrollbarWidth: "thin",
          }}
        >
          {movies.map(
            (movie, index) => (
              <motion.div
                key={movie.id}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay:
                    index * 0.05,
                }}
                whileHover={{
                  scale: 1.08,
                  y: -10,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  setSelectedMovie(
                    movie
                  )
                }
                style={{
                  flex:
                    "0 0 220px",
                  cursor:
                    "pointer",
                }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  style={{
                    width: "220px",
                    height: "330px",
                    objectFit:
                      "cover",
                    borderRadius:
                      "15px",
                    display:
                      "block",
                    boxShadow:
                      "0 10px 25px rgba(0,0,0,0.35)",
                  }}
                />

                <h3
                  style={{
                    marginTop:
                      "12px",
                    textAlign:
                      "center",
                    fontSize:
                      "18px",
                  }}
                >
                  {movie.title}
                </h3>
              </motion.div>
            )
          )}
        </div>
      </motion.section>

      <MovieModal
        movie={selectedMovie}
        onClose={() =>
          setSelectedMovie(null)
        }
      />
    </>
  );
}