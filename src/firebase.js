import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSAKkNe48drloTUMJQbVZCeVOuBQcIPV4",
  authDomain: "longevid-4963d.firebaseapp.com",
  projectId: "longevid-4963d",
  storageBucket: "longevid-4963d.firebasestorage.app",
  messagingSenderId: "429778146632",
  appId: "1:429778146632:web:aefed188d2120056c98f7d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export function onAuthChanged(callback) {
  return onAuthStateChanged(auth, callback);
}
