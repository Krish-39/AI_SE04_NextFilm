import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Load Movies Dataset
movies = pd.read_csv(
    "../../Data/Raw/movies.dat",
    sep="::",
    engine="python",
    encoding="latin-1",
    names=["movieId", "title", "genres"]
)


# Convert genres into vectors
vectorizer = TfidfVectorizer(
    tokenizer=lambda x: x.split('|')
)

genre_matrix = vectorizer.fit_transform(
    movies["genres"]
)


# Compute similarity matrix
similarity_matrix = cosine_similarity(
    genre_matrix,
    genre_matrix
)


# Recommendation Function
def get_content_recommendations(movie_title, n=5):

    movie_title = movie_title.lower()

    matches = movies[
        movies["title"].str.lower().str.contains(movie_title)
    ]

    if matches.empty:
        return []

    idx = matches.index[0]

    scores = list(
        enumerate(similarity_matrix[idx])
    )

    scores = sorted(
        scores,
        key=lambda x: x[1],
        reverse=True
    )

    recommendations = scores[1:n+1]

    recommended_movies = []

    for movie_index, score in recommendations:

        recommended_movies.append(
            movies.iloc[movie_index]["title"]
        )

    return recommended_movies

