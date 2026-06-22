import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUxmQRz5kyj0Dsplg0IR2vRuMrmjsWfd0",
  authDomain: "explorepurwakarta-d9f5f.firebaseapp.com",
  projectId: "explorepurwakarta-d9f5f",
  storageBucket: "explorepurwakarta-d9f5f.firebasestorage.app",
  messagingSenderId: "53540527605",
  appId: "1:53540527605:web:2828e637364bf7dddbd4bc",
  measurementId: "G-RQP2JMYMNB"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
