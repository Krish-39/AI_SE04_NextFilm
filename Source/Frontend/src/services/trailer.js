export async function getTrailer(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
  );

  const data = await response.json();

  return data.results?.find(
    (video) =>
      video.site === "YouTube" &&
      video.type === "Trailer"
  );
}