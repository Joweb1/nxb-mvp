// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add your own Firebase configuration from your Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyCXgUPEYWFWSTEy6nVIqrzQn8Mbu2oOo9k",
  authDomain: "nxb-mvp.firebaseapp.com",
  projectId: "nxb-mvp",
  storageBucket: "nxb-mvp.firebasestorage.app",
  messagingSenderId: "172125106842",
  appId: "1:172125106842:web:5c7742e60ba5f65acca523",
  measurementId: "G-BLKWLF1LD4"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Cloud Firestore
const db = getFirestore(app);

export { auth, db };
