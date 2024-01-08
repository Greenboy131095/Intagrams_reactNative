import { initializeApp } from 'firebase/app';
import { getAuth} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyCSHSkzES1DTkDRSvSBLEyZy6O_yRhYgEI",
  authDomain: "instagram-7dc1d.firebaseapp.com",
  databaseURL: "https://instagram-7dc1d-default-rtdb.firebaseio.com",
  projectId: "instagram-7dc1d",
  storageBucket: "instagram-7dc1d.appspot.com",
  messagingSenderId: "65063750832",
  appId: "1:65063750832:web:38b908368b4321a1e97f75",
  measurementId: "G-Q1HY8L7GQG"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app); 