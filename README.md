# NextFilm

**Live demo:** <https://nextfilm-mimi.web.app>

An AI-assisted movie discovery app built for the DA120B group project. Search TMDb, browse curated rows, describe the kind of film you're in the mood for and get AI picks, and keep a personal watchlist behind Firebase sign-in.

The repository has two parts:

| Part | Where | What it does |
| --- | --- | --- |
| Web app | `src/`, `api/`, `server/` | React + Vite front end, small Vercel functions for Reddit and Gemini, Firebase Auth and Firestore for accounts and watchlists |
| Recommender research | `Source/Models/` | Python content-based, collaborative and hybrid recommenders on MovieLens 1M, plus EDA |

The two are independent: the live app gets its suggestions from TMDb, Reddit and Gemini, and the Python models are the offline study behind the report in `Documentation/`.

## Features

- **Home**: a full-bleed featured carousel of this week's trending films, the "ask" box, a **Picked for you** row built from your watchlist, a Top 10 rail, trending and top-rated series, and genre rails with "See all" links
- **Browse** (`/browse`): filter films or series by genres (match all), release year or decade, minimum rating, length, original language and streaming service in your country, sorted by popularity, rating, date or title. Filters live in the URL, so any view can be bookmarked or shared; on phones they open in a bottom sheet with a live result count
- **Search** (`/search`): type a title, or describe what you want ("a sad space movie", "funny Korean series from the 2010s"). A description gives three things:
  - **Recommended on Reddit**: titles real people suggested most in Reddit threads asking for the same thing, counted from their upvoted replies, with links to the threads
  - **More matches**: the request read for moods, genres, decades, languages and topics and run against TMDb (this works with no AI at all), plus up to five Gemini picks marked **Clerk's pick**
  - The page shows what it understood ("Looking for Films · Drama · Science fiction · "space""), so results are explainable
  - Every result can be filtered by type, genres, years, rating and language, and sorted; filters live in the URL
- **Title pages** for films (`/movie/:id`) and series (`/tv/:id`): backdrop, poster, runtime or seasons, genres, director or creators, cast, similar titles, the trailer in an in-page player, **Where to watch** (stream / free / rent / buy per country, data by JustWatch), and **Community buzz** (a 0–100 Reddit buzz score with the top threads)
- **Watchlist** for films and series, stored per user in Firestore (`users/{uid}/watchlist`), with Films / Series tabs and sorting
- Email/password and Google sign-in, password reset, and friendly error messages
- Fully responsive down to 320px, keyboard accessible (skip link, focus rings, labelled controls), and respects reduced-motion settings

### How "Picked for you" works

A small hybrid recommender in `src/lib/forYou.js`: TMDB's recommendations for your four most recent saves (collaborative signal), plus popular titles in the genres you save most (content signal), ranked together with rating as a tie-breaker. Titles you already saved are never suggested.

### How the Reddit picks work

`server/picks.js`: search r/MovieSuggestions, r/NetflixBestOf and r/movies (or the TV equivalents) for the request, take the four busiest matching threads, read their 30 most upvoted top-level replies, and pull out the titles each reply names (with Gemini when a key is set, otherwise with rules: bold or italic text, "Title (2009)" patterns and short title-case lines). Titles are ranked by how many different people named them, then by upvotes. The browser then keeps only titles with an exact TMDb title match, so a stray word never turns into a random film.

Reddit blocks requests made directly from browsers, so all Reddit calls go through the site's `/api` functions. If Reddit is down or rate-limits, search still works and says the Reddit picks are unavailable, and title pages fall back to a "See all discussions on Reddit" link.

## Design

The look and its rules (palette, type, spacing, motion, components) are written down in [`DESIGN.md`](DESIGN.md). In short: a late-night video rental store. Shelves with label-maker tape, yellow price-label buttons, red "staff pick" stickers, handwritten index cards for Reddit picks, and your watchlist printed as a rental receipt. Archivo for labels and titles, Instrument Sans for reading, Kalam only on the staff-pick cards, IBM Plex Mono only on the receipt.

## How the keys stay safe

Only the TMDb key is in the browser bundle (TMDb keys are meant for that). The Gemini key and the Reddit app credentials live only on the server: `api/*.js` are Vercel functions that call `server/handlers.js`. They accept GET requests only, validate input (requests up to 500 characters, an allowlist of subreddits), fence user text off from the AI instructions, treat AI output as untrusted, and cache answers for 10 minutes.

## Run the web app

Prerequisites: Node.js 20.19 or later and npm.

```bash
git clone https://github.com/Krish-39/AI_SE04_NextFilm.git
cd AI_SE04_NextFilm
npm ci
cp .env.example .env   # then fill in the keys
npm run dev
```

Open <http://localhost:5173>. The dev server also serves `/api/*` with the same code as production, so Reddit picks and AI work locally when the keys are in `.env`. Only `VITE_TMDB_API_KEY` is required; without the others, search still works from TMDb alone.

### Deploy (Vercel)

The site and its `/api` functions run on Vercel's free Hobby plan; no card needed. `vercel.json` sets the build, the single-page-app rewrite and the function timeout.

```bash
npx vercel login
npx vercel link
npx vercel env add VITE_TMDB_API_KEY production
npx vercel env add GEMINI_API_KEY production        # optional
npx vercel env add REDDIT_CLIENT_ID production      # see below, or "none"
npx vercel env add REDDIT_CLIENT_SECRET production
npx vercel deploy --prod
```

Then add the Vercel domain (e.g. `nextfilm-xxxx.vercel.app`) in Firebase console → Authentication → Settings → **Authorized domains**, so Google sign-in works there.

**Reddit credentials:** Reddit's official API needs an app from <https://www.reddit.com/prefs/apps> (type **script**). Apps created after November 2025 need Reddit's approval under its [Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy). Without credentials (`none`) the functions fall back to Reddit's public JSON, which Reddit often blocks from cloud servers.

### Database rules

The watchlist lives in Firestore at `users/{uid}/watchlist`. `firestore.rules` lets each signed-in user read and change only their own list. Publish them once (Firebase's free Spark plan is enough):

- **Console:** Firebase console → Firestore Database → Rules → paste `firestore.rules` → Publish
- **CLI:** `npx firebase-tools deploy --only firestore:rules`

The Firebase project is set in `.firebaserc` (`nextfilm-mimi`), the same project `src/firebase.js` connects to. `firebase.json` can also host the static site (`npm run build && npx firebase-tools deploy --only hosting`), but without the `/api` functions, so Reddit picks and AI only work on Vercel.

### Checks

```bash
npm run lint
npm test            # filters, search parsing, Reddit picks, recommender, sorting
npm run build
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
