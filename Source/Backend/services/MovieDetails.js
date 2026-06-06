export async function getMovieDetails(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
  );

  return response.json();
}

export async function getMovieCredits(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
  );

  return response.json();
}