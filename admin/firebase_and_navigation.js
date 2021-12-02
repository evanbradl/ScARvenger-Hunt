import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBw8dLZFtKzvab_UtVS2NAxnosk1hIBlS4",
  authDomain: "senior-design-radsadundergrads.firebaseapp.com",
  projectId: "senior-design-radsadundergrads",
  storageBucket: "senior-design-radsadundergrads.appspot.com",
  messagingSenderId: "762499108677",
  appId: "1:762499108677:web:40be8cafaea4620995f82c",
  measurementId: "G-XEYZ3MV8DN"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const firebase_auth = getAuth();


firebase_auth.onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in
    console.log('[LOG] - SIGNED IN AS ' + user.email);
  } else {
    // User is not signed in
    var host = location.hostname;
    var url = 'http://' + host + '/login.html';
    window.location.replace(url);
  }
});

// Since this script is declared a module, need to add event listener on this end instead of onclick
document.getElementById('sign_out_button').addEventListener('click', function() {
  signOut(firebase_auth).then(() => {
    // Sign-out successful.
    console.log('[LOG] - SIGNED OUT');
    window.location.replace("/login.html");
  }).catch((error) => {
    // An error happened.
    console.log('[LOG] - ERROR SIGNING OUT ' + error.message);
  });
});
// Since this script is declared a module, need to add event listener on this end instead of onclick
document.getElementById('home_button').addEventListener('click', function() {
  window.location.href = "/landing_page.html";
});