// firebase-config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbOcnU3qBFWW3Wel_b3gWGJSlohGeOeUM",
  authDomain: "iot-data-e9f1c.firebaseapp.com",
  databaseURL: "https://iot-data-e9f1c-default-rtdb.firebaseio.com",
  projectId: "iot-data-e9f1c",
  storageBucket: "iot-data-e9f1c.appspot.com", // CORREGIDO el storageBucket
  messagingSenderId: "837221265238",
  appId: "1:837221265238:web:f9685073239f582f60f0f7",
  measurementId: "G-6FKW503ZGF"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { app, db, auth };
