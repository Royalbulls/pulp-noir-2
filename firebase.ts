import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeFirestore, getDocFromServer, doc, setLogLevel, enableIndexedDbPersistence } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Suppress benign Firestore logs
setLogLevel('error');

// Use initializeFirestore with long polling for better stability in sandboxed environments
// NOTE: "Disconnecting idle stream" logs in the console are normal and benign behavior of the Firebase SDK.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false, // Ensure it stays on long polling
  ignoreUndefinedProperties: true,
}, firebaseConfig.firestoreDatabaseId);

if (typeof window !== 'undefined') {
  // Use a more robust persistence initialization
  const enablePersistence = async () => {
    try {
      // In some sandboxed environments, IndexedDB can be flaky. 
      // We wrap it to ensure it doesn't crash initialization.
      await enableIndexedDbPersistence(db);
      console.log('Firestore persistence enabled.');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence failed: Browser not supported.');
      } else {
        // This handles "Internal error opening backing store" and other low-level errors
        console.warn('Firestore persistence failed with internal error (likely iframe sandbox restrictions). Continuing in memory-only mode.', err);
      }
    }
  };
  // Delay persistence slightly to allow primary initialization to proceed
  setTimeout(enablePersistence, 1000);
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auth helper
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Error handling helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isQuotaError = errorMessage.toLowerCase().includes("quota") || errorMessage.toLowerCase().includes("exhausted");
  
  const errInfo: FirestoreErrorInfo = {
    error: isQuotaError ? "Quota Limit Exceeded. Firestore daily free tier usage has been reached. Please try again tomorrow after the daily reset (00:00 Pacific Time)." : errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test - Only run on client if explicitly needed
// Removed from top-level to prevent 10s timeout errors on initial load
export async function testConnection() {
  if (typeof window === 'undefined') return;
  
  try {
    // getDocFromServer forces a network request to verify the backend is reachable
    // We add a silent check here.
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection verified.");
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.toLowerCase().includes('offline') || errorMessage.toLowerCase().includes('reach cloud firestore')) {
      console.warn("Firestore connection check failed: Backend might be unreachable via current network config.");
    }
    return false;
  }
}
// Do not call testConnection() automatically at top level
// testConnection();

export { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  deleteDoc, 
  addDoc, 
  updateDoc,
  collectionGroup,
  where
} from 'firebase/firestore';
