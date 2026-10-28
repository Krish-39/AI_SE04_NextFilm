# NextFilm

**Live demo:** <https://nextfilm-84dc1.web.app>

An AI-assisted movie discovery app built for the DA120B group project. Search TMDb, browse curated rows, describe the kind of film you're in the mood for and get AI picks, and keep a personal watchlist behind Firebase sign-in.

The repository has two parts:

| Part | Where | What it does |
| --- | --- | --- |
| Web app | `src/`, `functions/` | React + Vite front end, Firebase Auth and Firestore, a Cloud Function that calls Gemini |
| Recommender research | `Source/Models/` | Python content-based, collaborative and hybrid recommenders on MovieLens 1M, plus EDA |

The two are independent: the live app gets its suggestions from Gemini and TMDb, and the Python models are the offline study behind the report in `Documentation/`.

## Features

- **Home**: a full-bleed featured carousel of this week's trending films, a Top 10 rail, trending and top-rated series, and genre rails
- **Ask NextFilm AI**: describe a mood or plot ("a slow, sad space movie") and Gemini picks five titles, looked up on TMDb
- **Search**: short queries search titles across films and series; longer ones go to the AI, with a one-click switch between the two
- **Title pages** for films (`/movie/:id`) and series (`/tv/:id`): backdrop, poster, runtime or seasons, genres, director or creators, cast, similar titles, and the trailer in an in-page player
- **Watchlist** for films and series, stored per user in Firestore (`users/{uid}/watchlist`)
- Email/password and Google sign-in, password reset, and friendly error messages
- Fully responsive, keyboard accessible (skip link, focus rings, labelled controls), and respects reduced-motion settings

## Design

The look and its rules (palette, type, spacing, motion, components) are written down in [`DESIGN.md`](DESIGN.md). In short: a warm near-black screening room where posters and backdrops carry the colour, Archivo for title cards, Instrument Sans for everything else, and one projector-amber accent.

## How the AI search stays safe

The Gemini key never reaches the browser. `src/services/gemini.js` calls the `recommendMovies` Cloud Function (`functions/index.js`), which holds the key as a Firebase secret, validates the prompt (max 500 characters), fences it off from the instructions, and returns at most five cleaned-up titles. `maxInstances` caps how far traffic can scale.

## Run the web app

Prerequisites: Node.js 20.19 or later and npm.

```bash
git clone https://github.com/Krish-39/AI_SE04_NextFilm.git
cd AI_SE04_NextFilm
npm ci
echo "VITE_TMDB_API_KEY=your_tmdb_key" > .env
npm run dev
```

Open <http://localhost:5173>. Browsing and direct search work with just the TMDb key; AI search needs the Cloud Function deployed.

### Deploy the Cloud Function

Cloud Functions need the Firebase Blaze plan. From the repository root:

```bash
npm install -g firebase-tools
firebase login
cd functions && npm ci && cd ..
firebase functions:secrets:set GEMINI_API_KEY
firebase deploy --only functions
```

The project is set in `.firebaserc` (`nextfilm-ai`), the same project `src/firebase.js` connects to.

### Deploy the site

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` serves `dist/` with a single-page-app rewrite, so deep links like `/movie/603` work on refresh. If your hosting site lives in a different Firebase project from the one in `.firebaserc`, add `--project <id>`.

### Checks

```bash
npm run lint
npm run build
cd functions && npm test
```

## Run the recommender models

Prerequisites: Python 3.10+ with `pandas`, `scikit-learn` and `matplotlib`.

MovieLens data may not be redistributed, so it is not in this repository. Download it once, then run the pipeline from any directory:

```bash
python Source/Models/download_data.py     # MovieLens 1M into Data/Raw
python Source/Models/01_preprocessing.py  # cleaned CSVs into Data/Processed
python Source/Models/eda.py               # charts into Documentation/
python Source/Models/content_based.py
python Source/Models/collaborative_filtering.py
python Source/Models/hybrid_model.py
```

- **Content-based** (`content_based.py`): cosine similarity over genre vectors.
- **Collaborative** (`collaborative_filtering.py`): user-based and item-based cosine similarity on the user-movie rating matrix.
- **Hybrid** (`hybrid_model.py`): interleaves both ranked lists, best first, without duplicates.

Dataset: F. Maxwell Harper and Joseph A. Konstan. 2015. *The MovieLens Datasets: History and Context.* ACM TiiS 5, 4. <https://grouplens.org/datasets/movielens/1m/>

## Known gaps

- The Python models are not served to the web app.
- There is no offline evaluation (precision@k, RMSE) of the recommenders yet.

## License

[MIT](LICENSE)
