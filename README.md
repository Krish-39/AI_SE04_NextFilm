# NextFilm – AI-Powered Movie Recommendation System

## Overview

NextFilm is an AI-powered movie recommendation platform designed to help users discover movies that match their interests. The system combines machine learning recommendation techniques with real-time movie metadata to deliver personalized suggestions and improve content discovery.

The application allows users to browse movies, create accounts, manage watchlists, rate movies, and receive recommendations generated through content-based, collaborative, and hybrid recommendation models.

---

## Features

### User Features

* User Registration and Login
* Personalized User Profiles
* Movie Search and Discovery
* Movie Details and Metadata
* Watchlist Management
* Personalized Movie Recommendations
* Responsive User Interface

### Recommendation Features

* Content-Based Filtering
* Collaborative Filtering
* Hybrid Recommendation System
* Genre-Based Similarity Analysis
* User Rating-Based Recommendations

### External Integrations

* TMDb API for movie information
* Firebase Authentication
* Firebase Firestore Database

---

## System Architecture

### Frontend

* React.js
* Vite
* React Router
* Framer Motion

### Backend Services

* Firebase Authentication
* Firebase Firestore

### Machine Learning

* Python
* Scikit-learn
* Pandas
* NumPy

### External APIs

* TMDb API

---

## Recommendation Models

### Content-Based Filtering

Recommends movies similar to those previously liked by a user by analyzing:

* Genres
* Movie metadata
* Content similarity

### Collaborative Filtering

Generates recommendations by identifying users with similar rating patterns and preferences.

### Hybrid Recommendation System

Combines content-based and collaborative filtering methods to improve recommendation accuracy and diversity.

---

## Dataset

### MovieLens Dataset

Source: GroupLens Research

Files Used:

* ratings.dat
* movies.dat
* users.dat

Dataset Statistics:

* 1,000,000+ Ratings
* 6,000+ Users
* 3,900+ Movies

---

## Project Structure

```text
NextFilm/

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
│
├── src/
│
├── package.json
├── README.md
└── .env
```

---

## Data Processing Pipeline

1. Dataset Collection
2. Data Cleaning
3. Missing Value Handling
4. Feature Engineering
5. Exploratory Data Analysis
6. Recommendation Model Training
7. Recommendation Generation

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd NextFilm
```

### Install Frontend Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file and add:

```env
VITE_TMDB_API_KEY=b35f346d1a85925edf88a92dc53c87d3
VITE_GEMINI_API_KEY=AQ.Ab8RN6I01CWf-_YjTRbxm_T4R_JVLPNqMtq_8bqDRI3wIIpg2A
```

### Start Development Server

```bash
npm run dev
```

### Build Production Version

```bash
npm run build
```

---

## Technologies Used

| Component        | Technology         |
| ---------------- | ------------------ |
| Frontend         | React.js           |
| Build Tool       | Vite               |
| Authentication   | Firebase Auth      |
| Database         | Firebase Firestore |
| Machine Learning | Scikit-learn       |
| Data Processing  | Pandas, NumPy      |
| Movie Metadata   | TMDb API           |
| Routing          | React Router       |
| Animations       | Framer Motion      |
| Version Control  | Git & GitHub       |

---

## Future Improvements

* Real-time recommendation updates
* Recommendation explanation system
* AI-powered movie assistant
* Advanced user preference learning
* Movie review sentiment analysis
* Recommendation evaluation metrics
* Cloud deployment

---

## Contributors

DA120B – NextFilm Project Team

* Project Management and Documentation
* Dataset Collection and Preprocessing
* Recommendation System Development
* Frontend Development
* Firebase Integration
* Testing and Evaluation

---

## License

This project was developed for academic and educational purposes.
