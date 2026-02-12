import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBdAONYZVo_ldweqy1yIG6r5FEUc_8Hakw",
  authDomain: "aroma-notes.firebaseapp.com",
  projectId: "aroma-notes",
  storageBucket: "aroma-notes.firebasestorage.app",
  messagingSenderId: "139403882721",
  appId: "1:139403882721:web:d0c41daf5d0d64b15807a0",
  measurementId: "G-1MY3BT6EXX",
};

// Initialize Firebase (prevent re-initialization in dev hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
