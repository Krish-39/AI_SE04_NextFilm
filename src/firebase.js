import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase web config is public by design; access is enforced by
// Firebase Auth and Firestore security rules, not by hiding these values.
const firebaseConfig = {
  apiKey: "AIzaSyD-wis5h-Q5lf4K98HarAHlEbQcFGsGEjw",
  authDomain: "nextfilm-84dc1.firebaseapp.com",
  projectId: "nextfilm-84dc1",
  storageBucket: "nextfilm-84dc1.firebasestorage.app",
  messagingSenderId: "330478566830",
  appId: "1:330478566830:web:ee6b1e844b45faab75dc3f",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
