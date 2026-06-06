const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export async function getTrendingMovies() {
  console.log("API KEY:", API_KEY);

  const response = await fetch(
    `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`
  );

  const data = await response.json();

  console.log("TMDB DATA:", data);

  return data;
}