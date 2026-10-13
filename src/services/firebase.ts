import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type Auth, 
  type User as FirebaseUser 
} from 'firebase/auth';
import type { CustomerUser } from '../types';

// Safely access environment variables across both Vite browser runtime and Node.js test runners
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
  if (proc?.env?.[key]) {
    return proc.env[key] as string;
  }
  return '';
};

// Six VITE_FIREBASE_* environment variables with fallback defaults for positive-aurora-k4mm2
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || 'positive-aurora-k4mm2.firebaseapp.com',
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || 'positive-aurora-k4mm2',
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || 'positive-aurora-k4mm2.firebasestorage.app',
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(firebaseConfig);
    }
  }
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    const app = getFirebaseApp();
    authInstance = getAuth(app);
  }
  return authInstance;
}

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

export function mapFirebaseUserToCustomer(user: FirebaseUser | null): CustomerUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export function resolveFirebaseAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before completion. Please try again.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for lifeibeauty.com to continue.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in the Firebase Console. Please add lifeibeauty.com to Authorized Domains.';
    case 'auth/cancelled-popup-request':
      return 'Only one sign-in window can be opened at a time.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your connection and try again.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.':
      return 'Firebase configuration is pending VITE_FIREBASE_API_KEY environment variable.';
    default:
      return error?.message || 'Unable to sign in with Google. Please try again later.';
  }
}

export async function signInWithGooglePopup(): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
  try {
    const auth = getFirebaseAuth();
    const result = await signInWithPopup(auth, googleAuthProvider);
    const customer = mapFirebaseUserToCustomer(result.user);
    return {
      success: true,
      user: customer || undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      error: resolveFirebaseAuthErrorMessage(err),
    };
  }
}

export async function signOutCustomer(): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: resolveFirebaseAuthErrorMessage(err),
    };
  }
}

export function subscribeToCustomerAuth(
  callback: (customer: CustomerUser | null) => void
): () => void {
  try {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(mapFirebaseUserToCustomer(firebaseUser));
    });
  } catch (err) {
    console.warn('Firebase Auth listener initialization deferred:', err);
    return () => {};
  }
}
