import pandas as pd

movies = pd.read_csv(
    "Data/Processed/movies_cleaned.csv"
)


from sklearn.feature_extraction.text import CountVectorizer

movies["content"] = (
    movies["genres"] + " " +
    movies["genre_count"].astype(str)
)

vectorizer = CountVectorizer()

genre_matrix = vectorizer.fit_transform(
    movies["content"]
)


from sklearn.metrics.pairwise import cosine_similarity

similarity_matrix = cosine_similarity(
    genre_matrix,
    genre_matrix
)



def recommend_movies(movie_title, n=5):

    movie_title = movie_title.lower()

    matches = movies[
        movies["title"].str.lower().str.contains(movie_title)
    ]

    if matches.empty:
        print("Movie not found.")
        return

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

    print(f"\nRecommendations for {matches.iloc[0]['title']}:\n")

    for movie_index, score in recommendations:
        print(
            movies.iloc[movie_index]["title"]
        )

recommend_movies("Toy Story")

