from content_based import get_content_recommendations

from collaborative_filtering import \
    get_collaborative_recommendations


# Hybrid Recommendation Function
def hybrid_recommendation(
    movie_title,
    user_id,
    n=10
):

    # Content-Based Recommendations
    content_movies = \
        get_content_recommendations(
            movie_title,
            n=5
        )

    # Collaborative Recommendations
    collaborative_movies = \
        get_collaborative_recommendations(
            user_id,
            n=5
        )

    # Combine Both
    final_recommendations = list(
        set(
            content_movies +
            collaborative_movies
        )
    )

    print("\nHybrid Recommendations:\n")

    for movie in final_recommendations[:n]:

        print(movie)


# Example
hybrid_recommendation(
    movie_title="Toy Story",
    user_id=1
)

