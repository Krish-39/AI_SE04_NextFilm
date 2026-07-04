#NextFilm – AI-Powered Movie Recommendation System
# Overview

NextFilm is an AI-powered movie recommendation platform designed to help users discover movies that match their interests through intelligent recommendation algorithms and real-time movie data.

The application combines modern web development technologies with machine learning concepts to provide a personalized movie discovery experience. Users can browse movies, search for titles, manage watchlists, rate movies, and receive customized recommendations based on their preferences.

Movie information is retrieved using **The Movie Database (TMDb) API**, while user authentication and cloud storage are handled using **Firebase Authentication** and **Firebase Firestore**.

This project was developed as part of a university Software Engineering course to demonstrate the integration of Artificial Intelligence techniques into a full-stack web application.


#  Project Objectives

- Build an intelligent movie recommendation platform.
- Apply machine learning recommendation techniques.
- Integrate real-time movie information using TMDb API.
- Develop a responsive React web application.
- Implement secure Firebase authentication.
- Demonstrate Software Engineering best practices.
- Provide an intuitive and engaging user experience.


#  Features

##  User Features

- User Registration & Login
- Secure Firebase Authentication
- Personalized User Profiles
- Responsive User Interface
- Watchlist Management
- Favorite Movies
- Movie Ratings
- Personalized Recommendations


## Movie Discovery

- Browse Popular Movies
- Search Movies
- Movie Details
- Genre Filtering
- Trending Movies
- Responsive Movie Cards



## Recommendation Features

- Content-Based Filtering
- Collaborative Filtering
- Hybrid Recommendation System
- Genre-Based Similarity Analysis
- User Preference Learning
- Rating-Based Recommendations



##  External Integrations

- TMDb API
- Firebase Authentication
- Firebase Firestore Database


# System Architecture

## Frontend

- React.js
- Vite
- React Router
- Framer Motion
- CSS3

## Backend Services

- Firebase Authentication
- Firebase Firestore

## Machine Learning

- Python
- Scikit-learn
- Pandas
- NumPy

## External APIs

- TMDb API

#Recommendation Models

## Content-Based Filtering

Recommends movies similar to those a user has previously enjoyed by analyzing:

- Genres
- Keywords
- Movie Metadata
- Content Similarity

## Collaborative Filtering

Generates recommendations by identifying users with similar interests and movie rating patterns.


## Hybrid Recommendation System

Combines Content-Based and Collaborative Filtering techniques to improve recommendation accuracy, diversity, and personalization.


# Recommendation Workflow

1. User logs into the application.
2. User searches or browses movies.
3. User rates or saves favorite movies.
4. User preferences are stored in Firebase.
5. Recommendation algorithms analyze user behavior.
6. Personalized movie recommendations are generated.
7. Recommended movies are displayed to the user.


# Dataset

## MovieLens Dataset

**Source**

GroupLens Research

### Files Used

- ratings.dat
- movies.dat
- users.dat

### Dataset Statistics

- 1,000,000+ Ratings
- 6,000+ Users
- 3,900+ Movies


#  Project Structure

```text
NextFilm/
│
├── Data/
│   ├── Raw/
│   │   ├── movies.dat
│   │   ├── ratings.dat
│   │   └── users.dat
│   │
│   └── Processed/
│       ├── movies_cleaned.csv
│       ├── ratings_cleaned.csv
│       └── users_cleaned.csv
│
├── Source/
│   ├── Frontend/
│   ├── Backend/
│   └── Models/
│       ├── content_based.py
│       ├── collaborative_filtering.py
│       └── hybrid_model.py
│
├── Documentation/
│   ├── Reports/
│   ├── Presentation/
│   └── Visualizations/
│
├── dist/
├── public/
├── src/
├── package.json
├── README.md
├── .env
└── vite.config.js
```



#  Data Processing Pipeline

1. Dataset Collection
2. Data Cleaning
3. Missing Value Handling
4. Feature Engineering
5. Exploratory Data Analysis
6. Recommendation Model Training
7. Recommendation Generation



# Installation

## Clone the Repository

```bash
git clone https://github.com/Krish-39/AI_SE04_NextFilm.git

cd AI_SE04_NextFilm
```


## Install Dependencies

```bash
npm install
```


## Configure Environment Variables

Create a `.env` file inside the project root.

```env
VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=

VITE_TMDB_API_KEY=
```

## Start Development Server

```bash
npm run dev
```


## Build Production Version

```bash
npm run build
```


# Technologies Used

| Category | Technology |
|-----------|------------|
| Frontend | React.js |
| Build Tool | Vite |
| Styling | CSS3, Framer Motion |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore |
| Machine Learning | Python |
| AI Libraries | Scikit-learn |
| Data Processing | Pandas, NumPy |
| Movie Data | TMDb API |
| Routing | React Router |
| Version Control | Git & GitHub |


#  Screenshots

The following screenshots will be added after the final release.

- Home Page
- Login Page
- Movie Search
- Movie Details
- Recommendation Page
- User Profile
- Watchlist


# Future Improvements

- AI-powered chatbot assistant
- Recommendation explanation system
- Real-time recommendation updates
- Movie review sentiment analysis
- Advanced user preference learning
- Recommendation evaluation metrics
- Cloud deployment
- Docker support
- Social movie sharing
- Dark mode
- Mobile application


# 🗺️ Roadmap

- ✅ User Authentication
- ✅ Firebase Integration
- ✅ Movie Search
- ✅ TMDb API Integration
- ✅ Responsive Interface
- ⏳ Content-Based Recommendation
- ⏳ Collaborative Filtering
- ⏳ Hybrid Recommendation
- ⏳ Cloud Deployment
- ⏳ Docker Containerization



# Acknowledgements

This project makes use of the following technologies and datasets:

- TMDb API
- Firebase
- MovieLens Dataset
- GroupLens Research
- React
- Vite
- Scikit-learn
- Pandas
- NumPy



#Contributors
## Krish Ahir
## Ajin Rajeev
## kirtika Chaudhary
## Harkaran 

### Responsibilities

- Project Planning
- Frontend Development
- Firebase Integration
- Recommendation System Research
- Documentation
- Testing & Evaluation


# 📄 License

This project was developed for academic and educational purposes as part of a university Software Engineering course.

It is intended solely for learning, research, and demonstration purposes.


If you found this project helpful, consider giving it a star on GitHub!
