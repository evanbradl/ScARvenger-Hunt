import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

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
    console.log('[LOG] - REDIRECTING TO LANDING PAGE');
    var host = location.hostname;
    var url = 'http://' + host + '/landing_page.html';
    window.location.replace(url);
  }
});


// Since this script is declared a module, need to add event listener on this end instead of onclick
document.getElementById('create_account_button').addEventListener('click', function() {
  var email = document.getElementById('inputEmail').value;
  var password = document.getElementById('inputPasswordOrig').value;
  var password_confirm = document.getElementById('inputPasswordConfirm').value;

  if (password != password_confirm) {
      alert("Passwords must match");
      return;
  }
  
  createUserWithEmailAndPassword(firebase_auth, email, password).then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log('[ERROR] - ACCOUNT CREATION SUCCESS ');
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    if (errorCode == "auth/email-already-in-use"){
        alert("That email is already in use");
    }
    console.log('[ERROR] - ACCOUNT CREATION ERROR ' + errorMessage);
  });
});
