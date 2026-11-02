import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase web config is public by design; access is enforced by
// Firebase Auth and Firestore security rules, not by hiding these values.
const firebaseConfig = {
  apiKey: "AIzaSyAPBpk83Ksk1KDfHD3wPAL12IMLDOOESgg",
  authDomain: "nextfilm-mimi.firebaseapp.com",
  projectId: "nextfilm-mimi",
  storageBucket: "nextfilm-mimi.firebasestorage.app",
  messagingSenderId: "137067561575",
  appId: "1:137067561575:web:691c4b1614dea36607cac2",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
