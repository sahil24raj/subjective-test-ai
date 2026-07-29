import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut, 
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  browserPopupRedirectResolver
} from 'firebase/auth';

// Real Firebase SDK Config for study-buddy-a26c5 (subjective-test-ai)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAkPofxxAAySNly6_qSY7_QNF1RkneLvTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "study-buddy-a26c5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "study-buddy-a26c5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "study-buddy-a26c5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "256579313967",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:256579313967:web:ae1943bda478111f4901da",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-8K2VQG4DYE"
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

export const getFirebaseApp = (): FirebaseApp | null => {
  if (typeof window === 'undefined') return null;
  if (_app) return _app;
  try {
    _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return _app;
  } catch (e) {
    console.warn("Firebase init:", e);
    return null;
  }
};

export const getFirebaseAuth = (): Auth | null => {
  if (typeof window === 'undefined') return null;
  if (_auth) return _auth;
  try {
    const app = getFirebaseApp();
    if (!app) return null;
    _auth = getAuth(app);
    return _auth;
  } catch (e) {
    console.warn("Firebase Auth:", e);
    return null;
  }
};

/**
 * Sign in with Google — tries popup first, falls back to redirect
 */
export const signInWithFirebaseGoogle = async () => {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase not ready.");

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    // Try popup first
    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    return result.user;
  } catch (popupError: any) {
    // If popup blocked or unauthorized domain, fall back to redirect
    if (
      popupError.code === 'auth/popup-blocked' ||
      popupError.code === 'auth/unauthorized-domain' ||
      popupError.code === 'auth/popup-closed-by-user' ||
      popupError.code === 'auth/cancelled-popup-request'
    ) {
      // Use redirect as fallback — page will reload after auth
      await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
      // This line won't execute — page navigates away
      throw new Error('REDIRECT_INITIATED');
    }
    throw popupError;
  }
};

/**
 * Check for redirect result after page reload
 */
export const checkRedirectResult = async () => {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth, browserPopupRedirectResolver);
    return result?.user || null;
  } catch (e) {
    console.warn("Redirect result:", e);
    return null;
  }
};

export const signUpWithFirebaseEmail = async (email: string, pass: string, displayName: string) => {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase not ready.");
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (cred.user && displayName) {
    await updateFirebaseProfile(cred.user, { displayName });
  }
  return cred.user;
};

export const signInWithFirebaseEmail = async (email: string, pass: string) => {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase not ready.");
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
};

export const logoutFirebase = async () => {
  if (typeof window === 'undefined') return;
  try {
    const auth = getFirebaseAuth();
    if (auth) await firebaseSignOut(auth);
  } catch (e) {
    console.warn("Sign out:", e);
  }
};
