import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdAONYZVo_ldweqy1yIG6r5FEUc_8Hakw",
  authDomain: "aroma-notes.firebaseapp.com",
  projectId: "aroma-notes",
  storageBucket: "aroma-notes.firebasestorage.app",
  messagingSenderId: "139403882721",
  appId: "1:139403882721:web:d0c41daf5d0d64b15807a0",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const EMAIL = "nimsaraheshan08@gmail.com";
const PASSWORD = "Aroma119@";

async function main() {
  let uid: string;

  // Try signing in first; if user doesn't exist, create them
  try {
    const cred = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
    uid = cred.user.uid;
    console.log("Signed in existing user:", cred.user.email, "UID:", uid);
  } catch {
    console.log("Sign-in failed, creating new user...");
    const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
    await updateProfile(cred.user, { displayName: "Super Admin" });
    uid = cred.user.uid;
    console.log("Created new user:", cred.user.email, "UID:", uid);
  }

  // Write super admin document to Firestore
  await setDoc(doc(db, "admins", uid), {
    email: EMAIL,
    displayName: "Super Admin",
    role: "super_admin",
    createdAt: serverTimestamp(),
  });

  console.log("Super admin document created in Firestore (admins/" + uid + ")");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
