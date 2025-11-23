import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCwu0mIsgsI5BAbkz-xWCMbEgFzw1rAX74",
  authDomain: "calculadora-lucrativa-a72fc.firebaseapp.com",
  projectId: "calculadora-lucrativa-a72fc",
  storageBucket: "calculadora-lucrativa-a72fc.firebasestorage.app",
  messagingSenderId: "548375147356",
  appId: "1:548375147356:web:09b62d49b0efc023434799",
  measurementId: "G-M79C9BYJT8"
};

let app = null;
let db = null;
let auth = null;
let analytics = null;
let isFirebaseConfigured = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  analytics = getAnalytics(app);
  isFirebaseConfigured = true;
} catch (error) {
  console.error("Erro ao inicializar Firebase:", error);
  isFirebaseConfigured = false;
}

export { app, db, auth, analytics, isFirebaseConfigured };