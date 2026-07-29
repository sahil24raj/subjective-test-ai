import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';

// Real Firebase SDK Config for study-buddy-a26c5 (subjective-test-ai)
// Client-side keys are safe to expose — Firebase Security Rules protect data access
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAkPofxxAAySNly6_qSY7_QNF1RkneLvTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "study-buddy-a26c5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "study-buddy-a26c5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "study-buddy-a26c5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "256579313967",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:256579313967:web:ae1943bda478111f4901da",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-8K2VQG4DYE"
};

/**
 * Safe lazy Firebase App initialization — works on SSR and client
 */
export const getFirebaseApp = (): FirebaseApp | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (getApps().length > 0) return getApp();
    return initializeApp(firebaseConfig);
  } catch (e) {
    console.warn("Firebase init error:", e);
    return null;
  }
};

/**
 * Safe lazy Firebase Auth getter
 */
export const getFirebaseAuth = (): Auth | null => {
  if (typeof window === 'undefined') return null;
  try {
    const app = getFirebaseApp();
    if (!app) return null;
    return getAuth(app);
  } catch (e) {
    console.warn("Firebase Auth error:", e);
    return null;
  }
};

/**
 * Firebase Google OAuth Popup Sign In
 */
export const signInWithFirebaseGoogle = async () => {
  if (typeof window === 'undefined') {
    throw new Error("Firebase Auth requires a browser environment.");
  }
  
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error("Firebase could not initialize. Please try again.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(authInstance, provider);
  return result.user;
};

/**
 * Firebase Email/Password Sign Up
 */
export const signUpWithFirebaseEmail = async (email: string, pass: string, displayName: string) => {
  const authInstance = getFirebaseAuth();
  if (!authInstance) throw new Error("Firebase could not initialize.");

  const cred = await createUserWithEmailAndPassword(authInstance, email, pass);
  if (cred.user && displayName) {
    await updateFirebaseProfile(cred.user, { displayName });
  }
  return cred.user;
};

/**
 * Firebase Email/Password Sign In
 */
export const signInWithFirebaseEmail = async (email: string, pass: string) => {
  const authInstance = getFirebaseAuth();
  if (!authInstance) throw new Error("Firebase could not initialize.");

  const cred = await signInWithEmailAndPassword(authInstance, email, pass);
  return cred.user;
};

/**
 * Firebase Sign Out
 */
export const logoutFirebase = async () => {
  if (typeof window === 'undefined') return;
  try {
    const authInstance = getFirebaseAuth();
    if (authInstance) {
      await firebaseSignOut(authInstance);
    }
  } catch (e) {
    console.warn("Firebase sign out error:", e);
  }
};
