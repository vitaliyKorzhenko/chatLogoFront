// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import 'firebase/auth';
import { GoogleAuthProvider, getAuth, sendPasswordResetEmail as sendResetEmail,signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDOA2idtuSac42WkaqYGfDzIkVLB9vftOQ",
  authDomain: "logochat-e524b.firebaseapp.com",
  projectId: "logochat-e524b",
  storageBucket: "logochat-e524b.firebasestorage.app",
  messagingSenderId: "747664411844",
  appId: "1:747664411844:web:252067d4330a003a3d0d91",
  measurementId: "G-G796PS73ZE"
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export async function sendPasswordResetEmail(email: string) {
    try {
        await sendResetEmail(auth, email);
        // Optionally, you can show a success message to the user
    } catch (error: any) {
        // Handle the error appropriately, e.g., show an error message to the user
        if (error && error.code === 'auth/user-not-found') {
            // Show an error message to the user indicating that the email address is not registered
        } else {
            // Show a generic error message to the user
        }
    }
}

export async function googleLogin() {
    try {
      const res = await signInWithPopup(auth, new GoogleAuthProvider());
      return res.user;
    } catch (error) {
      throw error;
    }
}

export async function logout() {
    try {
        await auth.signOut();
    } catch (error) {
        throw error;
    }
}

