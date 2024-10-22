// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage for React Native

const firebaseConfig = {
    apiKey: "AIzaSyDUgY1jN4EMveQ7G8LTAIYbov0UVqzbMQk",
    authDomain: "spendly-3412a.firebaseapp.com",  
    databaseURL: "https://spendly-3412a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "spendly-3412a",
    storageBucket: "spendly-3412a.appspot.com",
    messagingSenderId: "593726725950",
    appId: "1:593726725950:web:53f93b4cfd5e1e5b8e566f",
    measurementId: "G-QD0DXT1JY8"
  };
  

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth };
