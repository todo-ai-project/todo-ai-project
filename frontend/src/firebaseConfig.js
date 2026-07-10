import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDzhoV5FPTwn0WcSY2-rP7QIMxvx92Betc",
  authDomain: "mandalart-schedular.firebaseapp.com",
  projectId: "mandalart-schedular",
  storageBucket: "mandalart-schedular.firebasestorage.app",
  messagingSenderId: "609312305487",
  appId: "1:609312305487:web:154bd387b8944103b8553a",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);