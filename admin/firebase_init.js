import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

// Web app's Firebase configuration
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

// Add link to create account based off current URL
const host = location.hostname;
var createAccountUrl = 'http://' + host + '/create_account.html';
document.getElementById("create_account_div").innerHTML = "<a id=\"create_account_link\" href=\"" + createAccountUrl + "\">No account? Create one here!</a>";
var forgotPasswordUrl = 'http://' + host + '/forgot_password.html';
document.getElementById("forgot_password_div").innerHTML = "<a id=\"forgot_password_link\" href=\"" + forgotPasswordUrl + "\">Forgot password?</a>";

firebase_auth.onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in
    console.log('[LOG] - SIGNED IN AS ' + user.email);
    console.log('[LOG] - REDIRECTING TO LANDING PAGE');
    var url = 'http://' + host + '/landing_page.html';
    window.location.replace(url);
  }
});


// Since this script is declared a module, need to add event listener on this end instead of onclick
document.getElementById('sign_in_button').addEventListener('click', function() {
  var email = document.getElementById('inputEmail').value;
  var password = document.getElementById('inputPassword').value;
  
  signInWithEmailAndPassword(firebase_auth, email, password).then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    console.log('[LOG] - SIGN IN SUCCESSFUL');
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    if (errorCode == "auth/wrong-password"){
      alert("Incorrect email and/or password");
    }
    console.log('[ERROR] - SIGN IN ERROR ' + errorMessage);
  });
});