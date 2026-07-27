import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDO6OY3fjDgVi2MPUtPEtMuz32sWBihnbE",
  authDomain: "safealert267.firebaseapp.com",
  projectId: "safealert267",
  storageBucket: "safealert267.firebasestorage.app",
  messagingSenderId: "52708124598",
  appId: "1:52708124598:web:4cef0b845b7f1ca8f94317",
  measurementId: "G-SBDQWMY16M"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
