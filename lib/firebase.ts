import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAiOYULHgil5ZHuczFYFxRIdYrIu5cbQCU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "svt-cashew.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "svt-cashew",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "svt-cashew.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "249310296378",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:249310296378:web:84e4bdd6df6d63cc353803",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XY8ZSZ8RHC",
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };

export const getFirebaseMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
    return null;
  } catch (error) {
    console.warn("FCM is not supported in this environment", error);
    return null;
  }
};
