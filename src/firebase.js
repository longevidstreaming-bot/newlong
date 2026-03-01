// Firebase core
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCIuY5ZbCUXieG7No9rjrB27Kl9h6rM1xE",
  authDomain: "longevid-fc5b5.firebaseapp.com",
  projectId: "longevid-fc5b5",
  storageBucket: "longevid-fc5b5.appspot.com",
  messagingSenderId: "1061751722952",
  appId: "1:1061751722952:web:03f3df392b1568a1f166fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
