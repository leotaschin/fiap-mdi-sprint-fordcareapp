import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, Persistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// getReactNativePersistence existe no build RN resolvido pelo Metro, mas não nos tipos web
const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: typeof ReactNativeAsyncStorage) => Persistence;
};

const firebaseConfig = {
  apiKey: "AIzaSyA36sLpdcayuxL4oBv_xeibdWn5TGUP-CY",
  authDomain: "fordcareapp.firebaseapp.com",
  projectId: "fordcareapp",
  storageBucket: "fordcareapp.firebasestorage.app",
  messagingSenderId: "287646096893",
  appId: "1:287646096893:web:3cbb5cea88669dee4b8d94",
  measurementId: "G-D9G7DMN2DD"
};

const appAlreadyInitialized = getApps().length > 0;
const app = appAlreadyInitialized ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = appAlreadyInitialized
  ? getAuth(app)
  : initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) });

export const db = getFirestore(app);
export default app;
