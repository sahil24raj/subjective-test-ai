import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, Auth } from 'firebase/auth';

const getFirebaseConfig = () => {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "subjective-test-ai.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "subjective-test-ai",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "subjective-test-ai.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef"
  };
};

/**
 * Safe lazy Firebase App initialization (prevents SSR crash on Vercel)
 */
export const getFirebaseApp = (): FirebaseApp | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (getApps().length > 0) return getApp();
    const config = getFirebaseConfig();
    return initializeApp(config);
  } catch (e) {
    console.warn("Firebase App initialization warning:", e);
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
    console.warn("Firebase Auth getter warning:", e);
    return null;
  }
};

/**
 * Triggers Real Firebase Google OAuth Popup safely in client browser
 */
export const signInWithFirebaseGoogle = async () => {
  if (typeof window === 'undefined') {
    throw new Error("Firebase Auth can only run in client browser environment.");
  }
  
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error("Firebase Auth is initializing. Please verify NEXT_PUBLIC_FIREBASE_API_KEY environment variable in Vercel project settings.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  const result = await signInWithPopup(authInstance, provider);
  return result.user;
};

/**
 * Sign out from Firebase Auth safely
 */
export const logoutFirebase = async () => {
  if (typeof window === 'undefined') return;
  try {
    const authInstance = getFirebaseAuth();
    if (authInstance) {
      await firebaseSignOut(authInstance);
    }
  } catch (e) {
    console.warn("Error signing out of Firebase:", e);
  }
};
