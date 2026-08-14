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

// Configure Firebase with environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Google sign-in
export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

// GitHub sign-in
export async function signInWithGithub(): Promise<UserCredential> {
  return signInWithPopup(auth, githubProvider);
}

// Sign out
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

// Observer for auth state changes
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}