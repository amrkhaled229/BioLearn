// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAZPZPnYD_s2cvqpZsXMV6tLPkz_Oz4tRg",
  authDomain: "biolearn-f55cb.firebaseapp.com",
  projectId: "biolearn-f55cb",
  storageBucket: "biolearn-f55cb.firebasestorage.app",
  messagingSenderId: "989891806111",
  appId: "1:989891806111:web:a6a9804439b215f1ed33aa",
  measurementId: "G-19CZQBXC08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Auth instance
export const auth = getAuth(app);
export const db = getFirestore(app)
