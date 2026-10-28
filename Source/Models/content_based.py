import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from paths import PROCESSED_DIR

movies = pd.read_csv(PROCESSED_DIR / "movies_cleaned.csv")

movies["content"] = (
    movies["genres"] + " " +
    movies["genre_count"].astype(str)
)

vectorizer = CountVectorizer()
genre_matrix = vectorizer.fit_transform(movies["content"])
similarity_matrix = cosine_similarity(genre_matrix, genre_matrix)


def get_content_recommendations(movie_title, n=5):
    """Return up to n titles most similar in genre to movie_title, best first."""

    matches = movies[
        movies["title"].str.lower().str.contains(
            movie_title.lower(), regex=False
        )
    ]

    if matches.empty:
        return []

    idx = matches.index[0]
    scores = sorted(
        enumerate(similarity_matrix[idx]),
        key=lambda x: x[1],
        reverse=True,
    )

    return [
        movies.iloc[movie_index]["title"]
        for movie_index, _ in scores
        if movie_index != idx
    ][:n]


def recommend_movies(movie_title, n=5):
    """Print content-based recommendations (kept for the EDA report)."""

    recommendations = get_content_recommendations(movie_title, n)
    if not recommendations:
        print("Movie not found.")
        return

    print(f"\nRecommendations for {movie_title}:\n")
    for title in recommendations:
        print(title)


if __name__ == "__main__":
    recommend_movies("Toy Story")
