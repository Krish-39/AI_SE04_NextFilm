import { useEffect, useState } from "react";

import { Heart, Trash2 } from "lucide-react";

import { auth } from "../firebase";

import {
  getWatchlist,
  removeFromWatchlist,
} from "../services/watchlistService";

export default function Watchlist() {
  const [watchlist, setWatchlist] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadWatchlist =
      async () => {
        const user =
          auth.currentUser;

        if (!user) {
          setLoading(false);
          return;
        }

        try {
          const movies =
            await getWatchlist(
              user.uid
            );

          setWatchlist(movies);
        } catch (error) {
          console.error(error);
        }

        setLoading(false);
      };

    loadWatchlist();
  }, []);

  const handleRemove =
    async (movieId) => {
      const user =
        auth.currentUser;

      if (!user) return;

      try {
        await removeFromWatchlist(
          user.uid,
          movieId
        );

        setWatchlist((prev) =>
          prev.filter(
            (movie) =>
              movie.id !== movieId
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

  if (!auth.currentUser) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "white",
          padding: "120px 20px",
        }}
      >
        <h1>
          Please login to view your
          watchlist.
        </h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "white",
          padding: "120px 20px",
        }}
      >
        Loading Watchlist...
      </div>
    );
  }

  return (
    <section
      style={{
        padding: "60px 40px",
        color: "white",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <Heart
          size={34}
          color="#ff4d6d"
          fill="#ff4d6d"
        />

        My Watchlist
      </h1>

      {watchlist.length === 0 ? (
        <h2
          style={{
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          No movies saved yet.
        </h2>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {watchlist.map(
            (movie) => (
              <div
                key={movie.id}
                style={{
                  width: "220px",
                  background:
                    "#071126",
                  borderRadius:
                    "15px",
                  padding: "15px",
                }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={
                    movie.title
                  }
                  style={{
                    width: "100%",
                    borderRadius:
                      "10px",
                  }}
                />

                <h3>
                  {movie.title}
                </h3>

                <button
                  onClick={() =>
                    handleRemove(
                      movie.id
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "none",
                    borderRadius:
                      "10px",
                    cursor:
                      "pointer",
                    background:
                      "#ef4444",
                    color:
                      "white",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: "8px",
                  }}
                >
                  <Trash2
                    size={18}
                  />

                  Remove
                </button>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}