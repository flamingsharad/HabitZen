

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-8569249950-7e375",
  "appId": "1:524844859144:web:21a6d38e47f7d1340c76bd",
  "apiKey": "AIzaSyC5zDxYpABX5kLvbAN-EVGeWz9Y7YR5GUY",
  "authDomain": "studio-8569249950-7e375.firebaseapp.com",
  "messagingSenderId": "524844859144"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

if (typeof window !== 'undefined') {
  // Initialize App Check
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!),
    // Optional argument. Set to true to allow passing custom token to provider.
    isTokenAutoRefreshEnabled: true
  });
}

const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = (typeof window !== 'undefined' && firebaseConfig.messagingSenderId) ? getMessaging(app) : null;


try {
  enableIndexedDbPersistence(db)
} catch (error: any) {
  if (error.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled
    // in one tab at a time.
    // ...
  } else if (error.code == 'unimplemented') {
    // The current browser does not support all of the
    // features required to enable persistence
    // ...
  }
}


const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, messaging };

// As a next step, you'll need to go to the Firebase console to enable authentication providers and set up Firestore security rules.

    
