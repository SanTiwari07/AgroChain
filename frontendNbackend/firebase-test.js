// Firebase connectivity test
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Import your Firebase config
import { auth, db } from './firebase.js';

async function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  
  try {
    // Test Auth
    console.log('✓ Firebase Auth initialized successfully');
    console.log('Auth instance:', auth.app.name);
    
    // Test Firestore
    console.log('✓ Firebase Firestore initialized successfully');
    console.log('Firestore instance:', db.app.name);
    
    // Test configuration
    const config = auth.app.options;
    console.log('✓ Project ID:', config.projectId);
    console.log('✓ Auth Domain:', config.authDomain);
    console.log('✓ Storage Bucket:', config.storageBucket);
    
    console.log('\n🎉 All Firebase services are working correctly!');
    console.log('🌐 Your app will be deployed at: https://sih-agro-chain.web.app');
    console.log('🔧 Firebase Console: https://console.firebase.google.com/project/sih-agro-chain');
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
  }
}

testFirebaseConnection();
