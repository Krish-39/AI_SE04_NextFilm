import pandas as pd

from paths import PROCESSED_DIR, RAW_DIR

# MovieLens 1M uses "::" separators and Latin-1 text.
movies = pd.read_csv(
    RAW_DIR / "movies.dat",
    sep="::",
    engine="python",
    encoding="latin-1",
    names=["movieId", "title", "genres"],
)

ratings = pd.read_csv(
    RAW_DIR / "ratings.dat",
    sep="::",
    engine="python",
    names=["userId", "movieId", "rating", "timestamp"],
)

users = pd.read_csv(
    RAW_DIR / "users.dat",
    sep="::",
    engine="python",
    names=["userId", "gender", "age", "occupation", "zip"],
)

print("\n=== MISSING VALUES ===")

print("\nMovies")
print(movies.isnull().sum())

print("\nRatings")
print(ratings.isnull().sum())

print("\nUsers")
print(users.isnull().sum())

print("\n=== DUPLICATES ===")

print("Movies:", movies.duplicated().sum())
print("Ratings:", ratings.duplicated().sum())
print("Users:", users.duplicated().sum())

movies = movies.drop_duplicates()
ratings = ratings.drop_duplicates()
users = users.drop_duplicates()

movies["genre_count"] = movies["genres"].str.split("|").str.len()

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

movies.to_csv(PROCESSED_DIR / "movies_cleaned.csv", index=False)
ratings.to_csv(PROCESSED_DIR / "ratings_cleaned.csv", index=False)
users.to_csv(PROCESSED_DIR / "users_cleaned.csv", index=False)

print("\nProcessed datasets saved successfully.")
