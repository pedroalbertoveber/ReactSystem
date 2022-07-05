import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCRPuH-flN0qoEM495cnEYi7g-zPdZdMM4",
    authDomain: "sistema-f29fa.firebaseapp.com",
    projectId: "sistema-f29fa",
    storageBucket: "sistema-f29fa.appspot.com",
    messagingSenderId: "733712305301",
    appId: "1:733712305301:web:1b1dbb443c4a48c77f9f9c",
    measurementId: "G-19H5785S8V"
  };
  
  if(!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  export default firebase;