import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "subjective-test-ai.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "subjective-test-ai",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "subjective-test-ai.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = typeof window !== 'undefined' ? getAuth(app) : ({} as any);

/**
 * Triggers Real Firebase Google OAuth Popup
 */
export const signInWithFirebaseGoogle = async () => {
  if (typeof window === 'undefined') throw new Error("Firebase Auth can only run in client browser environment.");
  
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  const result = await signInWithPopup(auth, provider);
  return result.user;
};

/**
 * Sign out from Firebase Auth
 */
export const logoutFirebase = async () => {
  if (auth && auth.signOut) {
    await firebaseSignOut(auth);
  }
};
