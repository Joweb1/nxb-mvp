// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { Platform } from 'react-native';
import { getAuth, initializeAuth, getReactNativePersistence, indexedDBLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// WARNING: It is not recommended to store API keys in your client-side code.
// This is done here for simplicity, but in a production environment,
// you should use a secure method like environment variables or a backend service to store your API key.
export const API_FOOTBALL_KEY = "c99171a5658ec12d1ff0e76b772e7275";

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
  persistence: Platform.OS === 'web' ? indexedDBLocalPersistence : getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Cloud Firestore
const db = getFirestore(app);

export { auth, db };
