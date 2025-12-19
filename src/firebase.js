import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC3g4FTcTIj0m9W011JkSi7GEInQVjvYa8",
    authDomain: "ganesh-1dcce.firebaseapp.com",
    projectId: "ganesh-1dcce",
    storageBucket: "ganesh-1dcce.firebasestorage.app",
    messagingSenderId: "313532699246",
    appId: "1:313532699246:web:f436b732b4c68a3814cc7f",
    measurementId: "G-7Z9420C3MF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
export const db = getFirestore(app);

export default app;
