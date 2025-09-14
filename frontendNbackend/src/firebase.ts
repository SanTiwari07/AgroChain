import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration (from project sih-agro-chain)
const firebaseConfig = {
  apiKey: "AIzaSyCHaJxGSMZ5LYxg3bYpMn3_81c5EpTf1v8",
  authDomain: "sih-agro-chain.firebaseapp.com",
  projectId: "sih-agro-chain",
  storageBucket: "sih-agro-chain.firebasestorage.app",
  messagingSenderId: "473727370298",
  appId: "1:473727370298:web:dbdfbda0ded909f4bba103",
  measurementId: "G-EN8XZQGK23"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);



