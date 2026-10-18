# NextFlim

An AI-powered movie and TV discovery platform. It combines searchable TMDb titles, user preferences stored in Firebase, and content-based, collaborative, and hybrid recommendation approaches.

## Features

- Search and browse movies and TV series, including trending and popular titles
- View title details, similar titles, trailers, and genres
- Sign in with Firebase Authentication and maintain a personal watchlist
- Generate recommendations from watchlists, genres, search history, and user preferences
- Use Gemini AI for natural-language movie discovery
- Surface movie-related community discussions through Reddit integration

## Technology

- React, Vite, React Router, Framer Motion
- Firebase Authentication and Firestore
- TMDb API, Gemini AI API, Reddit API
- JavaScript, CSS

## Recommendation flow

1. A user browses titles or saves movies to a watchlist.
2. User preferences are stored in Firestore and movie metadata is retrieved from TMDb.
3. Content-based and collaborative methods produce a hybrid set of suggestions.
4. Recommendations are shown in the application; Gemini AI also supports natural-language searches.

## Run locally

Prerequisites: Node.js 18 or later, npm, and Git.

```bash
git clone https://github.com/Krish-39/AI_SE04_NextFilm.git
cd AI_SE04_NextFilm
npm install
npm run dev
```

The Vite development server is available at http://localhost:5173.

## Environment variables

Create a local `.env` file and add the API credentials for the services you use. Never commit real keys or secrets.

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

## Build and preview

```bash
npm run build
npm run preview
```

## Project notes

This repository documents the project as an academic DA120B project. Further improvement ideas recorded in the project notes include recommendation accuracy, preference learning, performance, and additional filtering options.
