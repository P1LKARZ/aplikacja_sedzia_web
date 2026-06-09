// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5KQjKE6hC_7Z01Zy3CYXGfOeShMHf7-k",
  authDomain: "sedzia-20493.firebaseapp.com",
  databaseURL: "https://sedzia-20493-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sedzia-20493",
  storageBucket: "sedzia-20493.firebasestorage.app",
  messagingSenderId: "735900870330",
  appId: "1:735900870330:web:d558d7aa03b59e03b6c483",
  measurementId: "G-WNMFDMFXEP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);


export const auth=getAuth(app);