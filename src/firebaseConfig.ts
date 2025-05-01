// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Consider moving sensitive keys like apiKey to environment variables
// instead of hardcoding them directly in the source code.
const firebaseConfig = {
  apiKey: "AIzaSyCuS_fOe_Al_v8F3a70M6f3avBnU207rQA", // Consider using environment variables
  authDomain: "moodie-6a750.firebaseapp.com",
  projectId: "moodie-6a750",
  storageBucket: "moodie-6a750.appspot.com", // Corrected storage bucket domain
  messagingSenderId: "71169757823",
  appId: "1:71169757823:web:378bc1d55795717c64e54a",
  measurementId: "G-83QF542KN9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the initialized app and other services as needed
export { app, analytics };

// Import Firestore
import { getFirestore } from "firebase/firestore";

// Initialize Firestore
export const db = getFirestore(app);

// Import and initialize Auth
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);
