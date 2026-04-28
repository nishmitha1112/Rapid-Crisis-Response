import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Direct Firebase configuration for development
const firebaseConfig = {
  apiKey: "AIzaSyD_c04JgllG2aAOp6z6ofinG0ZayoMVc5M",
  authDomain: "rapid-dashboard-7a089.firebaseapp.com",
  databaseURL: "https://rapid-dashboard-7a089-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "rapid-dashboard-7a089",
  storageBucket: "rapid-dashboard-7a089.firebasestorage.app",
  messagingSenderId: "69221544258",
  appId: "1:69221544258:web:14a49ca73205336b3ad8db",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
