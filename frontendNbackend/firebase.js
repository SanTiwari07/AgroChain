// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHaJxGSMZ5LYxg3bYpMn3_81c5EpTf1v8",
  authDomain: "sih-agro-chain.firebaseapp.com",
  projectId: "sih-agro-chain",
  storageBucket: "sih-agro-chain.firebasestorage.app",
  messagingSenderId: "473727370298",
  appId: "1:473727370298:web:dbdfbda0ded909f4bba103",
  measurementId: "G-EN8XZQGK23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
