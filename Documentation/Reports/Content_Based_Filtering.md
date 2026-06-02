# Content-Based Filtering Recommendation System

## Objective

The objective of this module is to recommend movies based on content similarity using movie genres.

## Methodology

1. Movie data was loaded from the MovieLens dataset.
2. Genres were extracted from each movie.
3. CountVectorizer was used to convert genres into numerical feature vectors.
4. Cosine Similarity was calculated between movies.
5. Movies with the highest similarity scores were recommended.

## Example

Input Movie:
Toy Story (1995)

Recommended Movies:

- Aladdin and the King of Thieves (1996)
- American Tail, An (1986)
- American Tail: Fievel Goes West (1991)
- Rugrats Movie, The (1998)
- Bug's Life, A (1998)

## Advantages

- Fast recommendation generation
- Easy implementation
- Does not require user history
- Provides relevant recommendations based on movie characteristics

## Technologies Used

- Python
- Pandas
- Scikit-learn
- CountVectorizer
- Cosine Similarity
