import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // When GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT is set, use it.
  // Otherwise fall back to Application Default Credentials (works on Vercel with
  // the Firebase integration, Google Cloud, etc.)
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (sa) {
    try {
      const parsed = JSON.parse(sa);
      return initializeApp({ credential: cert(parsed) });
    } catch {
      // fall through to default init
    }
  }

  return initializeApp({ projectId: "aroma-notes" });
}

let _db: Firestore | null = null;

export function adminDb(): Firestore {
  if (!_db) {
    const app = getAdminApp();
    _db = getFirestore(app);
  }
  return _db;
}
