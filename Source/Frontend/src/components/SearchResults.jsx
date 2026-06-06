import { Search, Star } from "lucide-react";

export default function SearchResults({
  movies,
}) {
  if (!movies.length) return null;

  return (
    <section
      style={{
        padding: "50px",
        color: "white",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "48px",
          marginBottom: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "15px",
          fontWeight: "800",
        }}
      >
        <Search
          size={42}
          color="#00E5A8"
          strokeWidth={2.5}
        />

        Search Results
      </h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "25px",
          justifyContent: "center",
        }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              width: "220px",
            }}
          >
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://via.placeholder.com/220x330?text=No+Image"
              }
              alt={movie.title}
              style={{
                width: "100%",
                height: "330px",
                objectFit: "cover",
                borderRadius: "15px",
                boxShadow:
                  "0 10px 25px rgba(0,0,0,.4)",
              }}
            />

            <h3
              style={{
                textAlign: "center",
                marginTop: "12px",
                fontSize: "22px",
                fontWeight: "600",
              }}
            >
              {movie.title}
            </h3>

            <p
              style={{
                textAlign: "center",
                color: "#00E5A8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontWeight: "600",
                marginTop: "8px",
              }}
            >
              <Star
                size={16}
                fill="#FFD700"
                color="#FFD700"
              />

              {movie.vote_average?.toFixed(1)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}