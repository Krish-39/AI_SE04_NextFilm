import { initializeApp } from "firebase/app";

import {
	getAuth,
	GoogleAuthProvider,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyDs-dqZSvAvD1Wl1u3CWHQh5wGyjOEe41s",
	authDomain: "nextfilm-ai.firebaseapp.com",
	projectId: "nextfilm-ai",
	storageBucket: "nextfilm-ai.firebasestorage.app",
	messagingSenderId: "905557752553",
	appId: "1:905557752553:web:371832f67bb7c626670e78",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);