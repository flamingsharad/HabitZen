

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-8569249950-7e375",
  "appId": "1:524844859144:web:21a6d38e47f7d1340c76bd",
  "storageBucket": "studio-8569249950-7e375.firebasestorage.app",
  "apiKey": "AIzaSyC5zDxYpABX5kLvbAN-EVGeWz9Y7YR5GUY",
  "authDomain": "studio-8569249950-7e375.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "524844859144"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

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

export { app, auth, db, googleProvider };

// As a next step, you'll need to go to the Firebase console to enable authentication providers and set up Firestore security rules.

    