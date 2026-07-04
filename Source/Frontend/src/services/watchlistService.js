import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";

import { db } from "../firebase";

export const addToWatchlist = async (userId, movie) => {
  await setDoc(
    doc(
      db,
      "users",
      userId,
      "watchlist",
      movie.id.toString()
    ),
    movie
  );
};

export const removeFromWatchlist = async (userId, movieId) => {
  await deleteDoc(
    doc(
      db,
      "users",
      userId,
      "watchlist",
      movieId.toString()
    )
  );
};

export const getWatchlist = async (userId) => {
  const snapshot = await getDocs(
    collection(db, "users", userId, "watchlist")
  );

  return snapshot.docs.map((doc) => doc.data());
};