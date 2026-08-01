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
import { 
  getFirestore, 
  doc, 
  getDoc,
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  Firestore 
} from 'firebase/firestore';

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
let _db: Firestore | null = null;

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

export const getFirebaseFirestore = (): Firestore | null => {
  if (typeof window === 'undefined') return null;
  if (_db) return _db;
  try {
    const app = getFirebaseApp();
    if (!app) return null;
    _db = getFirestore(app);
    return _db;
  } catch (e) {
    console.warn("Firebase Firestore:", e);
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
    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    return result.user;
  } catch (popupError: any) {
    if (
      popupError.code === 'auth/popup-blocked' ||
      popupError.code === 'auth/unauthorized-domain' ||
      popupError.code === 'auth/popup-closed-by-user' ||
      popupError.code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
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

/**
 * Save / sync real user profile to Cloud Firestore `users` collection
 */
export const saveUserProfileToFirestore = async (userData: any) => {
  if (typeof window === 'undefined' || !userData || !userData.email) return;
  try {
    const db = getFirebaseFirestore();
    if (!db) return;
    const cleanEmail = userData.email.toLowerCase().trim();
    const userDocRef = doc(db, 'users', cleanEmail);
    const nowIso = new Date().toISOString();
    await setDoc(userDocRef, {
      ...userData,
      email: cleanEmail,
      updatedAt: nowIso,
      lastActive: nowIso
    }, { merge: true });
  } catch (e) {
    console.warn("Firestore user save error:", e);
  }
};

/**
 * Fetch a single user profile doc directly from Cloud Firestore by email
 */
export const getUserProfileFromFirestore = async (userEmail: string): Promise<any | null> => {
  if (typeof window === 'undefined' || !userEmail) return null;
  try {
    const db = getFirebaseFirestore();
    if (!db) return null;
    const cleanEmail = userEmail.toLowerCase().trim();
    const userDocRef = doc(db, 'users', cleanEmail);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (e) {
    console.warn("Firestore user fetch error:", e);
    return null;
  }
};

/**
 * Real-time subscription to ONLY REAL registered users from Cloud Firestore
 */
export const subscribeToAllUsersFromFirestore = (callback: (users: any[]) => void) => {
  if (typeof window === 'undefined') return () => {};
  try {
    const db = getFirebaseFirestore();
    if (!db) return () => {};
    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersList: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.email) {
          usersList.push(data);
        }
      });
      callback(usersList);
    }, (err) => {
      console.warn("Firestore snapshot listener error:", err);
    });
    return unsubscribe;
  } catch (e) {
    console.warn("Firestore subscription error:", e);
    return () => {};
  }
};

/**
 * Save real submitted test result to Cloud Firestore
 */
export const saveTestResultToFirestore = async (userEmail: string, testResult: any) => {
  if (typeof window === 'undefined' || !userEmail || !testResult || !testResult.id) return;
  try {
    const db = getFirebaseFirestore();
    if (!db) return;
    const cleanEmail = userEmail.toLowerCase().trim();
    const testDocRef = doc(db, 'users', cleanEmail, 'tests', testResult.id);
    await setDoc(testDocRef, {
      ...testResult,
      savedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn("Firestore test result save error:", e);
  }
};

/**
 * Real-time subscription to user's test history from Cloud Firestore
 */
export const subscribeToUserTestHistoryFromFirestore = (userEmail: string, callback: (tests: any[]) => void) => {
  if (typeof window === 'undefined' || !userEmail) return () => {};
  try {
    const db = getFirebaseFirestore();
    if (!db) return () => {};
    const cleanEmail = userEmail.toLowerCase().trim();
    const testsQuery = query(collection(db, 'users', cleanEmail, 'tests'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(testsQuery, (snapshot) => {
      const testsList: any[] = [];
      snapshot.forEach(docSnap => {
        testsList.push(docSnap.data());
      });
      callback(testsList);
    }, (err) => {
      console.warn("Firestore test history listener error:", err);
    });
    return unsubscribe;
  } catch (e) {
    console.warn("Firestore test history subscription error:", e);
    return () => {};
  }
};
