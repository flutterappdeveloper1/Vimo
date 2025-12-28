
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

// IMPORTANT: Replace with your Firebase project's configuration
// You can get this from the Firebase console. It's recommended to use environment variables.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "YOUR_DATABASE_URL",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID",
};

export const isConfigPlaceholder = firebaseConfig.apiKey === "YOUR_API_KEY" || !firebaseConfig.apiKey;

// FIX: Use v8 syntax for Firebase initialization.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export { auth, db, googleProvider };
