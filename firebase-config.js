// Import the functions you need from the SDKs you need
import { getDatabase, ref, get, set, child } from "firebase/database";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbOcnU3qBFWW3Wel_b3gWGJSlohGeOeUM",
  authDomain: "iot-data-e9f1c.firebaseapp.com",
  databaseURL: "https://iot-data-e9f1c-default-rtdb.firebaseio.com",
  projectId: "iot-data-e9f1c",
  storageBucket: "iot-data-e9f1c.firebasestorage.app",
  messagingSenderId: "837221265238",
  appId: "1:837221265238:web:f9685073239f582f60f0f7",
  measurementId: "G-6FKW503ZGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);