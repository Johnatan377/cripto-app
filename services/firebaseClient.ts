import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDR3XbIZ9q9SDMoSChgf4kYXyjkMqOmMD0",
  authDomain: "criptoapp-cb39b.firebaseapp.com",
  projectId: "criptoapp-cb39b",
  storageBucket: "criptoapp-cb39b.firebasestorage.app",
  messagingSenderId: "267462077302",
  appId: "1:267462077302:web:2cb80cc14ff6f01329a857",
  measurementId: "G-2DX1SNXGM4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
