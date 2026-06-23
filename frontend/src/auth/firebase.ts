/**
 * firebase.ts — Firebase app initialisation + Google auth provider.
 *
 * Config is read from Vite env vars so no credentials are ever committed.
 * Set them in frontend/.env (copy from frontend/.env.example).
 */

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error("Missing Firebase configuration. Please create frontend/.env and add VITE_FIREBASE_API_KEY.");
}

// Guard against hot-module-reload re-initialisation in development.
const app = getApps().length === 0 && firebaseConfig.apiKey ? initializeApp(firebaseConfig) : getApps()[0] || null;

export const auth = app ? getAuth(app) : null as any;
export const googleProvider = app ? new GoogleAuthProvider() : null as any;

/** Trigger the Google OAuth popup and return the signed-in Firebase User. */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/** Sign the current user out of Firebase. */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged };
export type { User };
