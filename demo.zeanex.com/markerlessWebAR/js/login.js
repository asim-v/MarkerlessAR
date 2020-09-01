
import "../firebase/firebase-app.js";
import "../firebase/firebase-auth.js";
import "../firebase/firebase-storage.js";
import "../firebase/firebase-database.js";


initFirebase();
window.onload = (e) =>{
    console.log(firebase.auth().currentUser);

    firebase.auth().onAuthStateChanged((e)=>{
        if(e)
        {
            alert("redirecting...")
            if(window.location.search.length > 0 && window.location.search.substr(1).split("=")[0] === "redirect"){
                window.location = window.location.search.substr(1).split("=")[1];
            }else{
                window.location = "index.html";
            }   
        }        
    });
    document.getElementById("loginButton").addEventListener("click", (e)=>{
        firebase.auth().signInAnonymously().catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
        });
    });
}

function initFirebase() {
    var firebaseConfig = {
        apiKey: "AIzaSyBoSrTAuGjgxEhNiuYd_MRiXfObLx2ZXdI",
        authDomain: "hackify-69b56.firebaseapp.com",
        databaseURL: "https://hackify-69b56.firebaseio.com",
        projectId: "hackify-69b56",
        storageBucket: "hackify-69b56.appspot.com",
        messagingSenderId: "742410086079",
        appId: "1:742410086079:web:f2ab19fc5f996b1c38480a",
        measurementId: "G-S4XYSY8W9G"
      };
    firebase.initializeApp(firebaseConfig)
    firebase.auth();
}