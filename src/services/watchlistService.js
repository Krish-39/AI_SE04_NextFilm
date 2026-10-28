// Firestore is loaded on demand so it stays out of the first page load.
import { app } from "../firebase";

async function firestore() {
  const { getFirestore, doc, setDoc, deleteDoc, getDocs, collection } = await import("firebase/firestore");
  return { db: getFirestore(app), doc, setDoc, deleteDoc, getDocs, collection };
}

// Movies keep their plain TMDB id as the document id (as before);
// series are prefixed so a show and a film with the same id can't collide.
export function watchlistKey(item) {
  return item.media_type === "tv" ? `tv-${item.id}` : String(item.id);
}

function slim(item) {
  return {
    id: item.id,
    media_type: item.media_type === "tv" ? "tv" : "movie",
    title: item.title || item.name || "",
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    vote_average: item.vote_average ?? null,
    release_date: item.release_date || item.first_air_date || null,
    addedAt: Date.now(),
  };
}

export async function addToWatchlist(userId, item) {
  const { db, doc, setDoc } = await firestore();
  const entry = slim(item);
  await setDoc(doc(db, "users", userId, "watchlist", watchlistKey(entry)), entry);
  return entry;
}

export async function removeFromWatchlist(userId, item) {
  const { db, doc, deleteDoc } = await firestore();
  await deleteDoc(doc(db, "users", userId, "watchlist", watchlistKey(item)));
}

export async function getWatchlist(userId) {
  const { db, getDocs, collection } = await firestore();
  const snapshot = await getDocs(collection(db, "users", userId, "watchlist"));
  return snapshot.docs
    .map((d) => ({ media_type: "movie", ...d.data() }))
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
}
