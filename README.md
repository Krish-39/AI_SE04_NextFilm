# NextFlim

## AI-Powered Movie Recommendation Platform

---

## Table of Contents

- About the Project
- Features
- Technology Stack
- Recommendation System
- AI Features
- Dataset
- System Architecture
- Workflow
- Project Structure

---

# About the Project

NextFlim is an AI-powered movie recommendation platform developed to help users discover movies and TV series based on their interests and viewing behavior.

The project combines modern web technologies with recommendation algorithms to provide personalized movie suggestions. Users can search for movies, browse trending content, manage a watchlist, and receive recommendations based on their preferences.

Movie information is retrieved from TMDb, while Firebase manages authentication and user data. Recommendation logic is implemented using a combination of content-based and collaborative approaches.

---

# Features

## User Authentication

- Email and Password Login
- Google Sign-In
- Firebase Authentication
- Secure User Sessions

---

## Movie Discovery

- Browse Trending Movies
- Browse Popular Movies
- Search Movies
- Search TV Series
- View Movie Details
- View Similar Movies
- Watch Movie Trailers
- Browse by Genre

---

## Recommendation System

The recommendation engine combines multiple recommendation techniques to provide personalized suggestions.

- Content-Based Filtering
- Collaborative Filtering
- Hybrid Recommendation Model

Recommendations are generated using user watchlists, viewing preferences, genres, and movie metadata.

---

## AI Features

The application includes Gemini AI to support natural language movie search.

Example searches include:

- Recommend action movies released after 2020
- Movies similar to Interstellar
- Emotional romantic movies
- Family-friendly comedy movies

---

## Additional Features

- Personal Watchlist
- Responsive User Interface
- Framer Motion Animations
- Community Buzz
- Where to Watch Information
- Firebase Hosting

---

# Technology Stack

## Frontend

- React.js
- Vite
- React Router
- Framer Motion
- CSS3

---

## Backend Services

- Firebase Authentication
- Firebase Firestore

---

## Recommendation Engine

- JavaScript
- Content-Based Filtering
- Collaborative Filtering
- Hybrid Recommendation Logic

---

## External APIs

- TMDb API
- Gemini AI API
- Reddit API

---

## Development Tools

- Git
- GitHub
- Visual Studio Code

---

# Recommendation System

NextFlim uses a hybrid recommendation approach to improve recommendation quality.

## Content-Based Filtering

Content-based filtering recommends movies that are similar to those already liked by the user. It compares genres, keywords, cast members, and other movie characteristics to identify similar titles.

Example:

```
Interstellar

↓

Gravity
The Martian
Arrival
Contact
```

---

## Collaborative Filtering

Collaborative filtering recommends movies by comparing the preferences of users with similar viewing behavior.

If users with similar interests enjoyed certain movies, those movies are recommended to other users with matching preferences.

---

## Hybrid Recommendation

The final recommendation system combines both content-based and collaborative filtering.

This approach provides:

- Better recommendation accuracy
- More personalized suggestions
- Reduced cold-start problems
- Improved recommendation quality

---

# AI Features

Gemini AI allows users to search using natural language instead of exact movie titles.

For example:

- Recommend psychological thriller movies
- Best science fiction movies with space exploration
- Funny family movies

The AI interprets the user's request and suggests relevant content.

---

# Dataset

Movie information is primarily retrieved using:

- TMDb API
- IMDb metadata
- Firebase Firestore user preferences

The recommendation engine builds user profiles using:

- Watchlist
- Search history
- Favourite genres
- Viewing preferences

---

# System Architecture

```
                User
                  │
                  ▼
          React Frontend
                  │
                  ▼
        Firebase Authentication
                  │
                  ▼
      Recommendation Engine
        │       │        │
        ▼       ▼        ▼
   TMDb API  Firestore  Gemini AI
                  │
                  ▼
     Personalized Recommendations
```

---

# Workflow

```
User Login

↓

Browse Movies

↓

Search Movies / Manage Watchlist

↓

Recommendation Engine

↓

Content-Based Filtering

+

Collaborative Filtering

↓

Hybrid Recommendation

↓

Personalized Movie Recommendations

↓

User Feedback
```

---

# Project Structure

```
NextFlim/

├── public/

├── src/
│
├── components/
│
├── pages/
│
├── services/
│
├── utils/
│
├── assets/
│
├── firebase.js
│
├── recommendationEngine.js
│
├── Documentation/
│
├── Results/
│
└── README.md
```

---

# Screenshots

Application screenshots are available in the `Results` directory.

The project includes screenshots of:

- Login Page
- Home Page
- Search Page
- Movie Details
- Watchlist
- AI Search
- Recommendation Page

# Installation

## Prerequisites

Before running the project, ensure the following software is installed:

- Node.js (v18 or later)
- npm
- Git

Clone the repository:

```bash
git clone https://github.com/your-username/NextFlim.git
```

Navigate to the project folder:

```bash
cd NextFlim
```

Install the required dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root and add the following variables:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_TMDB_API_KEY=

VITE_GEMINI_API_KEY=

VITE_REDDIT_CLIENT_ID=
VITE_REDDIT_CLIENT_SECRET=
```

Replace each value with your own API keys.

---

# Firebase Configuration

The project uses Firebase for authentication and Firestore for storing user information.

Firebase services used:

- Authentication
- Firestore Database
- Hosting

Authentication methods:

- Email and Password
- Google Sign-In

---

# TMDb API

TMDb is used to retrieve movie information including:

- Movie titles
- Posters
- Genres
- Release dates
- Cast
- Ratings
- Similar movies
- Trending movies

Create a free TMDb account and generate an API key.

Add the key to the `.env` file.

---

# Gemini AI

Gemini AI provides natural language search functionality.

Users can search using conversational prompts instead of exact movie titles.

Examples:

- Recommend science fiction movies
- Show me comedy movies released after 2015
- Movies similar to Inception

Add your Gemini API key to the `.env` file.

---

# Reddit Integration

The application retrieves community discussions related to movies.

Examples include:

- Trending discussions
- Popular opinions
- Community recommendations

This feature helps users discover movies based on public discussions.

---

# Running the Project

Start the development server:

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

# Project Structure

```
NextFlim/

├── public/

├── src/
│
├── assets/
│
├── components/
│
├── pages/
│
├── services/
│
├── utils/
│
├── hooks/
│
├── context/
│
├── firebase.js
│
├── recommendationEngine.js
│
└── main.jsx

├── Documentation/

├── Results/

├── package.json

├── vite.config.js

└── README.md
```

---

# Recommendation Process

The recommendation process follows these steps:

1. User logs into the application.
2. User searches for or browses movies.
3. User saves movies to their watchlist.
4. User preferences are stored in Firebase Firestore.
5. Movie metadata is retrieved from TMDb.
6. The recommendation engine analyses user preferences.
7. Personalized movie recommendations are generated.
8. Recommendations are displayed to the user.

---

# Current Project Status

Completed:

- User authentication
- Google Sign-In
- Movie search
- Trending movies
- Movie details
- Similar movies
- Watchlist functionality
- Recommendation engine
- Gemini AI integration
- Reddit community integration
- Responsive user interface
- Firebase Hosting deployment

Currently being improved:

- Recommendation accuracy
- User preference learning
- Performance optimisation
- Additional filtering options

---

# Future Improvements

Possible future enhancements include:

- Movie rating system
- User reviews and comments
- Social features
- Multiple recommendation models
- Recommendation history
- Offline support
- Dark and light themes
- Multi-language support
- Mobile application

---

# Challenges Faced

During the project, several challenges were encountered:

- Selecting an appropriate recommendation approach
- Integrating multiple external APIs
- Managing user authentication securely
- Maintaining application performance
- Handling asynchronous API requests
- Organising project structure as the application grew

These challenges were addressed through modular development, testing, and continuous improvements.

---

# Contributors

| Name | Role |
|------|------|
| Krish Ahir | Project Lead, Documentation, System Design, GitHub Management |
| Team Member | Frontend Development |
| Team Member | Recommendation Engine |
| Team Member | Research and Testing |

Update this table with the names of all team members.

---

# Acknowledgements

This project makes use of the following resources:

- TMDb API
- Firebase
- React
- Vite
- Framer Motion
- Google Gemini AI
- Reddit API

We would like to acknowledge these platforms and their documentation for supporting the development of this project.

---

# License

This project was developed for academic purposes as part of the DA120B course.

It is intended for educational use only.  
