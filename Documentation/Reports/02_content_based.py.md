# Content-Based Filtering Recommendation System

## Objective

The objective of this module is to recommend movies based on content similarity using movie genres.

## Methodology

1. Raw MovieLens data was preprocessed using a dedicated preprocessing pipeline.
2. Missing values and duplicate records were checked and cleaned.
3. A new feature called `genre_count` was created to represent the number of genres assigned to each movie.
4. The processed dataset was used for recommendation generation.
5. CountVectorizer was used to convert movie content features into numerical vectors.
6. Cosine Similarity was calculated between movies.
7. Movies with the highest similarity scores were recommended.

## Example

Input Movie:
Toy Story (1995)

Recommended Movies:

- Aladdin and the King of Thieves (1996)
- American Tail, An (1986)
- American Tail: Fievel Goes West (1991)
- Rugrats Movie, The (1998)
- Bug's Life, A (1998)

## Feature Engineering

The following features were used:

- Genres
- Genre Count

A combined content feature was created from movie genres and the number of genres associated with each movie. This improved the representation of movie characteristics used by the recommendation engine.

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
