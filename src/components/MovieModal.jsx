import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Calendar,
  Globe,
  Flame,
  Clock3,
  Clapperboard,
  Users,
  Heart,
  Play,
  X,
} from "lucide-react";

import { auth } from "../firebase";
import { addToWatchlist } from "../services/watchlistService";

import { getTrailer } from "../services/trailer";

import {
  getMovieDetails,
  getMovieCredits,
} from "../services/MovieDetails";

import { getSimilarMovies } from "../services/similarMovies";

export default function MovieModal({
  movie,
  onClose,
}) {
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] =
    useState([]);

  useEffect(() => {
    if (!movie) return;

    async function loadData() {
      try {
        const movieDetails =
          await getMovieDetails(movie.id);

        const credits =
          await getMovieCredits(movie.id);

        const similar =
          await getSimilarMovies(movie.id);

        setDetails(movieDetails);

        setCast(
          credits.cast?.slice(0, 5) || []
        );

        setSimilarMovies(
          similar.slice(0, 8)
        );
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, [movie]);

  if (!movie) return null;

  const handleTrailer = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert(
        "Please login to watch trailers."
      );

      navigate("/login");
      return;
    }

    try {
      const trailer =
        await getTrailer(movie.id);

      if (trailer) {
        window.open(
          `https://www.youtube.com/watch?v=${trailer.key}`,
          "_blank"
        );
      } else {
        alert("Trailer not available");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToWatchlist =
    async () => {
      const user =
        auth.currentUser;

      if (!user) {
        alert(
          "Please login to use your watchlist."
        );

        navigate("/login");
        return;
      }

      try {
        await addToWatchlist(
          user.uid,
          movie
        );

        alert(
          "Added to Watchlist ❤️"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to save movie."
        );
      }
    };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(0,0,0,0.88)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          width: "1000px",
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "25px",
          padding: "30px",
          color: "white",

          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,0.85),
              rgba(0,0,0,0.95)
            ),
            url(https://image.tmdb.org/t/p/original${movie.backdrop_path})
          `,
          backgroundSize: "cover",
          backgroundPosition:
            "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "280px 1fr",
            gap: "35px",
          }}
        >
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            style={{
              width: "100%",
              borderRadius: "20px",
            }}
          />

          <div>
            <h1
              style={{
                fontSize: "42px",
                marginBottom: "10px",
              }}
            >
              {movie.title}
            </h1>

            <h2
              style={{
                color: "#FFD700",
                marginBottom: "20px",
              }}
            >
              ⭐{" "}
              {movie.vote_average?.toFixed(
                1
              )}
            </h2>

            <p style={infoRow}>
              <Calendar size={18} />
              Release Date:{" "}
              {movie.release_date}
            </p>

            <p style={infoRow}>
              <Globe size={18} />
              Language:{" "}
              {movie.original_language?.toUpperCase()}
            </p>

            <p style={infoRow}>
              <Flame size={18} />
              Popularity:{" "}
              {Math.round(
                movie.popularity
              )}
            </p>

            {details && (
              <>
                <p style={infoRow}>
                  <Clock3 size={18} />
                  Runtime:{" "}
                  {details.runtime} min
                </p>

                <p style={infoRow}>
                  <Clapperboard
                    size={18}
                  />
                  Genres:{" "}
                  {details.genres
                    ?.map(
                      (g) => g.name
                    )
                    .join(", ")}
                </p>
              </>
            )}

            <p
              style={{
                marginTop: "25px",
                lineHeight: "1.8",
              }}
            >
              {movie.overview}
            </p>

            <div
              style={{
                marginTop: "25px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Users size={22} />
                Top Cast
              </h3>

              {cast.map((actor) => (
                <p key={actor.id}>
                  • {actor.name}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
          }}
        >
          <h2
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <Clapperboard size={28} />
            Similar Movies
          </h2>

          <div
            style={{
              display: "flex",
              gap: "15px",
              overflowX: "auto",
            }}
          >
            {similarMovies.map(
              (item) => (
                <div
                  key={item.id}
                  style={{
                    flex:
                      "0 0 140px",
                  }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                    alt={item.title}
                    style={{
                      width:
                        "140px",
                      height:
                        "210px",
                      objectFit:
                        "cover",
                      borderRadius:
                        "12px",
                    }}
                  />

                  <p
                    style={{
                      textAlign:
                        "center",
                      marginTop: "8px",
                    }}
                  >
                    {item.title}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "35px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleTrailer}
            style={buttonPrimary}
          >
            <Play size={18} />
            Watch Trailer
          </button>

          <button
            onClick={
              handleAddToWatchlist
            }
            style={buttonDanger}
          >
            <Heart size={18} />
            Add to Watchlist
          </button>

          <button
            onClick={onClose}
            style={buttonSecondary}
          >
            <X size={18} />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const infoRow = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "10px",
};

const buttonPrimary = {
  padding: "14px 28px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  background:
    "linear-gradient(90deg,#00F5D4,#7B61FF)",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const buttonDanger = {
  padding: "14px 28px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  background: "#E50914",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const buttonSecondary = {
  padding: "14px 28px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  background: "#444",
  color: "white",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};