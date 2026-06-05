import pandas as pd

movies = pd.read_csv(
    "Data/Processed/movies_cleaned.csv"
)

ratings = pd.read_csv(
    "Data/Raw/ratings.dat",
    sep="::",
    engine="python",
    names=["userId", "movieId", "rating", "timestamp"]
)

users = pd.read_csv(
    "Data/Raw/users.dat",
    sep="::",
    engine="python",
    names=["userId", "gender", "age", "occupation", "zip"]
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

movies.to_csv(
    "Data/Processed/movies_cleaned.csv",
    index=False
)

ratings.to_csv(
    "Data/Processed/ratings_cleaned.csv",
    index=False
)

users.to_csv(
    "Data/Processed/users_cleaned.csv",
    index=False
)

print("\nProcessed datasets saved successfully.")
