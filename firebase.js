// firebaseConfig.js - Konfigurer Firebase for din app

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Erstatt denne konfigurasjon med din egen Firebase-konfigurasjon
// Du får disse verdiene når du oppretter et prosjekt på firebase.google.com
const firebaseConfig = {
  apiKey: "DIN_API_KEY",
  authDomain: "nyskolen-posten.firebaseapp.com",
  projectId: "nyskolen-posten",
  storageBucket: "nyskolen-posten.appspot.com",
  messagingSenderId: "DIN_MESSAGING_SENDER_ID",
  appId: "DIN_APP_ID"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };