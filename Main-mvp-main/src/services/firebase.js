// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ✅ Import the necessary functions for auth persistence
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
apiKey: "AIzaSyBoIrmmj4-52MDBRIIHkyR4ohIAVLGVHrg",
authDomain: "bridge-it-app-f0f70.firebaseapp.com",
projectId: "bridge-it-app-f0f70",
storageBucket: "bridge-it-app-f0f70.firebasestorage.app",
messagingSenderId: "759342814511",
appId: "1:759342814511:web:9fed88c081203420487dda",
measurementId: "G-44DKJ9WR0P"

};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };