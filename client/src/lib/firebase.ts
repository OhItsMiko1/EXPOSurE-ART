import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type UserCredential
} from "firebase/auth";

// Configure Firebase with environment variables. Only initialize when a key
// is actually present -- getAuth() throws immediately on a missing/invalid
// API key, and this module is imported from local-auth.tsx, which wraps the
// entire app, so an eager throw here would crash every page.
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = firebaseApiKey ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Google sign-in
export async function signInWithGoogle(): Promise<UserCredential> {
  if (!auth) {
    throw new Error("Google sign-in isn't configured yet.");
  }
  return signInWithPopup(auth, googleProvider);
}

// GitHub sign-in
export async function signInWithGithub(): Promise<UserCredential> {
  if (!auth) {
    throw new Error("GitHub sign-in isn't configured yet.");
  }
  return signInWithPopup(auth, githubProvider);
}

// Sign out
export async function signOut(): Promise<void> {
  if (!auth) return;
  return firebaseSignOut(auth);
}

// Observer for auth state changes
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}