import pandas as pd

movies = pd.read_csv(
    "Data/Processed/movies_cleaned.csv"
) 
    sep="::",
    engine="python",
    encoding="latin-1",
    names=["movieId", "title", "genres"]
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
print("\n=== MOVIES INFO ===")
print(movies.info())

print("\n=== RATINGS INFO ===")
print(ratings.info())

print("\n=== USERS INFO ===")
print(users.info())


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


import matplotlib.pyplot as plt

ratings["rating"].hist(bins=5)

plt.title("Rating Distribution")
plt.xlabel("Rating")
plt.ylabel("Number of Ratings")

plt.savefig("Documentation/rating_distribution.png")
plt.close()


genres = movies["genres"].str.split("|").explode()

genre_counts = genres.value_counts()

plt.figure(figsize=(10,5))
genre_counts.plot(kind="bar")

plt.title("Genre Distribution")
plt.xlabel("Genre")
plt.ylabel("Count")

plt.savefig("Documentation/genre_distribution.png")
plt.close()

movie_counts = ratings.groupby("movieId").size()

top_movies = movie_counts.sort_values(
    ascending=False
).head(10)

plt.figure(figsize=(8,5))
top_movies.plot(kind="bar")

plt.title("Top 10 Most Rated Movies")
plt.xlabel("Movie ID")
plt.ylabel("Number of Ratings")

plt.savefig("Documentation/top_movies.png")
plt.close()





