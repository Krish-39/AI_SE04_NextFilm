import { useState, useRef } from "react";

import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import SearchResults from "../components/SearchResults";
import StatsBar from "../components/StatsBar";
import Footer from "../components/Footer";

import {
  TrendingUp,
  Trophy,
  Swords,
  Laugh,
  Rocket,
  Skull,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

import { getMovieRecommendations } from "../services/gemini";

export default function Home() {
  const [searchResults, setSearchResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const resultsRef = useRef(null);

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      let movies = [];

      const isLikelyMovieSearch =
        query.trim().split(" ").length <= 3;

      // Direct TMDB Search
      if (isLikelyMovieSearch) {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&query=${encodeURIComponent(query)}`
        );

        const data = await res.json();

        movies = data.results || [];
      }

      // AI Recommendation Search
      else {
        const aiResponse =
          await getMovieRecommendations(query);

        console.log(
          "AI Response:",
          aiResponse
        );

        if (!aiResponse) {
          alert(
            "AI could not generate recommendations."
          );

          setLoading(false);
          return;
        }

        const titles = aiResponse
          .split(",")
          .map((movie) =>
            movie.trim()
          )
          .filter(Boolean)
          .slice(0, 5);

        for (const title of titles) {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${
              import.meta.env
                .VITE_TMDB_API_KEY
            }&query=${encodeURIComponent(
              title
            )}`
          );

          const data = await res.json();

          if (data.results?.length) {
            movies.push(
              data.results[0]
            );
          }
        }
      }

      setSearchResults(movies);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          }
        );
      }, 100);
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong."
      );
    }

    setLoading(false);
  };

  const clearSearch = () => {
    setSearchResults([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Hero
        searchMovies={handleSearch}
      />

      <div ref={resultsRef}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "white",
              padding: "100px",
              fontSize: "28px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <Sparkles
              size={36}
              color="#00E5A8"
            />

            AI is finding the perfect
            movies...
          </div>
        ) : (
          <SearchResults
            movies={searchResults}
          />
        )}
      </div>

      {searchResults.length > 0 ? (
        <div
          style={{
            textAlign: "center",
            paddingBottom: "60px",
          }}
        >
          <button
            onClick={clearSearch}
            style={{
              background:
                "linear-gradient(135deg,#00E5A8,#7C3AED)",
              color: "white",
              border: "none",
              padding: "15px 30px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              margin: "0 auto",
            }}
          >
            <ArrowLeft size={18} />
            Back To Home
          </button>
        </div>
      ) : (
        <>
          <MovieRow
            id="trending"
            title="Trending Today"
            icon={
              <TrendingUp size={42} />
            }
            iconColor="#facc15"
            endpoint={`https://api.themoviedb.org/3/trending/movie/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`}
          />

          <MovieRow
            id="top-rated"
            title="Top Rated"
            icon={
              <Trophy size={42} />
            }
            iconColor="#a855f7"
            endpoint={`https://api.themoviedb.org/3/movie/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY}`}
          />

          <MovieRow
            id="action"
            title="Action Movies"
            icon={
              <Swords size={42} />
            }
            iconColor="#ef4444"
            endpoint={`https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=28`}
          />

          <MovieRow
            id="comedy"
            title="Comedy Movies"
            icon={
              <Laugh size={42} />
            }
            iconColor="#f59e0b"
            endpoint={`https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=35`}
          />

          <MovieRow
            id="scifi"
            title="Sci-Fi Movies"
            icon={
              <Rocket size={42} />
            }
            iconColor="#06b6d4"
            endpoint={`https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=878`}
          />

          <MovieRow
            id="horror"
            title="Horror Movies"
            icon={
              <Skull size={42} />
            }
            iconColor="#8b5cf6"
            endpoint={`https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=27`}
          />

          <StatsBar />

          <Footer />
        </>
      )}
    </>
  );
}