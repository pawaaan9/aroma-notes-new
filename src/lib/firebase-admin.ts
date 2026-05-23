import { initializeApp, getApps, cert, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "aroma-notes";

function parseServiceAccountJson(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const attempts = [
    trimmed,
    trimmed.replace(/^['"]|['"]$/g, ""),
  ];

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      /* try next */
    }
  }

  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf8");
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (sa) {
    const parsed = parseServiceAccountJson(sa);
    if (parsed) {
      return initializeApp({ credential: cert(parsed as Parameters<typeof cert>[0]) });
    }
    console.warn("[firebase-admin] FIREBASE_SERVICE_ACCOUNT is set but could not be parsed.");
  }

  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return initializeApp({
      credential: cert({
        projectId: PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({
      credential: applicationDefault(),
      projectId: PROJECT_ID,
    });
  }

  // Token verification can work with project id only; Firestore admin writes need a service account.
  return initializeApp({ projectId: PROJECT_ID });
}

let _db: Firestore | null = null;

export function adminDb(): Firestore {
  if (!_db) {
    const app = getAdminApp();
    _db = getFirestore(app);
  }
  return _db;
}

let _auth: Auth | null = null;

export function adminAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getAdminApp());
  }
  return _auth;
}

/**
 * Verifies a `Authorization: Bearer <idToken>` header. Returns the UID of the
 * signed-in Firebase user, or `null` if the token is missing/invalid.
 * The whole admin panel is gated behind Firebase Auth, so any signed-in user
 * is considered an admin operator.
 */
export async function verifyAdminFromRequest(req: Request): Promise<string | null> {
  try {
    const header = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!header) return null;
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) return null;
    const idToken = match[1].trim();
    if (!idToken) return null;

    const decoded = await adminAuth().verifyIdToken(idToken);
    return decoded?.uid ?? null;
  } catch {
    return null;
  }
}
