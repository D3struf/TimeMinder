// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { collection, getDoc, addDoc, doc, setDoc, updateDoc, arrayUnion, Timestamp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2KH88LEwwBHmKa9-381byaJGBgt2gTFw",
  authDomain: "timeminder-ojt.firebaseapp.com",
  projectId: "timeminder-ojt",
  storageBucket: "timeminder-ojt.firebasestorage.app",
  messagingSenderId: "422737563071",
  appId: "1:422737563071:web:0d211a767efb7e714c250a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db, collection, getDoc, Timestamp, addDoc, doc, setDoc, updateDoc, arrayUnion };
export { query, orderBy, limit, where, onSnapshot };

