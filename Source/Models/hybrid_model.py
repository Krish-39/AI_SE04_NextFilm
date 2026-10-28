from collaborative_filtering import (
    get_collaborative_recommendations,
    merge_ranked,
)
from content_based import get_content_recommendations


def hybrid_recommendation(movie_title, user_id, n=10):
    """Blend content-based and collaborative results, keeping their ranking."""

    content_movies = get_content_recommendations(movie_title, n=5)
    collaborative_movies = get_collaborative_recommendations(
        user_id, movie_title, n=5
    )

    final_recommendations = merge_ranked(
        content_movies, collaborative_movies
    )[:n]

    print("\nHybrid Recommendations:\n")
    for movie in final_recommendations:
        print(movie)

    return final_recommendations


if __name__ == "__main__":
    hybrid_recommendation(movie_title="Toy Story", user_id=1)
