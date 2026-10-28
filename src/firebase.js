import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase web config is public by design; access is enforced by
// Firebase Auth and Firestore security rules, not by hiding these values.
const firebaseConfig = {
  apiKey: "AIzaSyDs-dqZSvAvD1Wl1u3CWHQh5wGyjOEe41s",
  authDomain: "nextfilm-ai.firebaseapp.com",
  projectId: "nextfilm-ai",
  storageBucket: "nextfilm-ai.firebasestorage.app",
  messagingSenderId: "905557752553",
  appId: "1:905557752553:web:371832f67bb7c626670e78",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
