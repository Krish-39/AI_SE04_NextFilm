import { Heart } from "lucide-react";

import { auth } from "../firebase";

import {
  addToWatchlist,
} from "../services/watchlistService";

export default function MovieCard({
  movie,
}) {
  const handleWatchlist =
    async () => {
      const user =
        auth.currentUser;

      if (!user) {
        alert(
          "Please login to save movies."
        );
        return;
      }

      try {
        await addToWatchlist(
          user.uid,
          movie
        );

        alert(
          `${movie.title} added to watchlist ❤️`
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
      style={{
        minWidth: "220px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
        }}
      >
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          style={{
            width: "220px",
            height: "330px",
            objectFit: "cover",
            borderRadius: "15px",
          }}
        />

        <button
          onClick={
            handleWatchlist
          }
          style={{
            position:
              "absolute",
            top: "10px",
            right: "10px",
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background:
              "rgba(0,0,0,.7)",
            backdropFilter:
              "blur(10px)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          <Heart
            size={20}
            color="#ff4d6d"
          />
        </button>
      </div>

      <h3
        style={{
          color: "white",
          marginTop: "10px",
        }}
      >
        {movie.title}
      </h3>
    </div>
  );
}