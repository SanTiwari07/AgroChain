// Firebase Debug Script
// Run this in browser console to test Firebase connectivity

console.log('🔍 Firebase Debug Script');
console.log('====================');

// Test Firebase configuration
try {
  const firebaseConfig = {
    apiKey: "AIzaSyCHaJxGSMZ5LYxg3bYpMn3_81c5EpTf1v8",
    authDomain: "sih-agro-chain.firebaseapp.com",
    projectId: "sih-agro-chain",
    storageBucket: "sih-agro-chain.firebasestorage.app",
    messagingSenderId: "473727370298",
    appId: "1:473727370298:web:dbdfbda0ded909f4bba103",
    measurementId: "G-EN8XZQGK23"
  };
  
  console.log('✅ Firebase Config:', firebaseConfig);
  
  // Test if Firebase is loaded
  if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase SDK loaded');
  } else {
    console.log('❌ Firebase SDK not loaded');
  }
  
  // Test authentication domain
  const testUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
  console.log('🔗 Test URL:', testUrl);
  
  // Test network connectivity
  fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + firebaseConfig.apiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123',
      returnSecureToken: true
    })
  })
  .then(response => {
    console.log('🌐 Network Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📊 Response Data:', data);
  })
  .catch(error => {
    console.log('❌ Network Error:', error);
  });
  
} catch (error) {
  console.log('❌ Script Error:', error);
}

console.log('====================');
console.log('💡 Instructions:');
console.log('1. Check if all ✅ items are present');
console.log('2. If ❌ items appear, there are configuration issues');
console.log('3. Network errors might indicate Firebase project issues');
console.log('4. Check Firebase Console: https://console.firebase.google.com/project/sih-agro-chain');








