import pandas as pd

from sklearn.metrics.pairwise import cosine_similarity


# Load Ratings Dataset
ratings = pd.read_csv(
    "../../Data/Raw/ratings.dat",
    sep="::",
    engine="python",
    encoding="latin-1",
    names=[
        "userId",
        "movieId",
        "rating",
        "timestamp"
    ]
)


# Load Movies Dataset
movies = pd.read_csv(
    "../../Data/Raw/movies.dat",
    sep="::",
    engine="python",
    encoding="latin-1",
    names=[
        "movieId",
        "title",
        "genres"
    ]
)


# Create User-Movie Matrix
user_movie_matrix = ratings.pivot_table(
    index="userId",
    columns="movieId",
    values="rating"
).fillna(0)


print("\nUser-Movie Matrix Created\n")


# USER-BASED SIMILARITY
user_similarity = cosine_similarity(
    user_movie_matrix
)

user_similarity_df = pd.DataFrame(
    user_similarity,
    index=user_movie_matrix.index,
    columns=user_movie_matrix.index
)


print("User Similarity Matrix Created\n")


# ITEM-BASED SIMILARITY
item_similarity = cosine_similarity(
    user_movie_matrix.T
)

item_similarity_df = pd.DataFrame(
    item_similarity,
    index=user_movie_matrix.columns,
    columns=user_movie_matrix.columns
)


print("Item Similarity Matrix Created\n")


# USER-BASED RECOMMENDATION
def get_user_based_recommendations(
    user_id,
    n=5
):

    similar_users = user_similarity_df[user_id] \
        .sort_values(ascending=False)

    similar_users = similar_users[1:6]

    watched_movies = set(
        ratings[
            ratings["userId"] == user_id
        ]["movieId"]
    )

    recommendations = {}

    for similar_user in similar_users.index:

        similar_user_movies = ratings[
            (ratings["userId"] == similar_user)
            &
            (ratings["rating"] >= 4)
        ]

        for _, row in similar_user_movies.iterrows():

            movie_id = row["movieId"]

            if movie_id not in watched_movies:

                recommendations[movie_id] = \
                    recommendations.get(movie_id, 0) + 1

    recommended_movie_ids = sorted(
        recommendations,
        key=recommendations.get,
        reverse=True
    )[:n]

    recommended_movies = []

    for movie_id in recommended_movie_ids:

        movie_title = movies[
            movies["movieId"] == movie_id
        ]["title"].values[0]

        recommended_movies.append(movie_title)

    return recommended_movies


# ITEM-BASED RECOMMENDATION
def get_item_based_recommendations(
    movie_title,
    n=5
):

    movie_match = movies[
        movies["title"].str.lower().str.contains(
            movie_title.lower()
        )
    ]

    if movie_match.empty:

        return []

    movie_id = movie_match.iloc[0]["movieId"]

    similar_movies = item_similarity_df[movie_id] \
        .sort_values(ascending=False)

    similar_movies = similar_movies[1:n+1]

    recommended_movies = []

    for similar_movie_id in similar_movies.index:

        movie_name = movies[
            movies["movieId"] == similar_movie_id
        ]["title"].values[0]

        recommended_movies.append(movie_name)

    return recommended_movies


# COMBINED COLLABORATIVE FILTERING
def get_collaborative_recommendations(
    user_id,
    movie_title,
    n=10
):

    user_based = \
        get_user_based_recommendations(
            user_id,
            n=5
        )

    item_based = \
        get_item_based_recommendations(
            movie_title,
            n=5
        )

    final_recommendations = list(
        set(
            user_based +
            item_based
        )
    )

    print("\nCollaborative Filtering Recommendations:\n")

    for movie in final_recommendations[:n]:

        print(movie)

    return final_recommendations


# Example
get_collaborative_recommendations(
    user_id=1,
    movie_title="Toy Story"
)

