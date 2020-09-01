
import "../firebase/firebase-app.js";
import "../firebase/firebase-auth.js";
import "../firebase/firebase-storage.js";
import "../firebase/firebase-database.js";


initFirebase();
window.onload = (e) =>{
    firebase.auth().onAuthStateChanged((e)=>{
        if(e){
            console.log("Autorizado.")
            console.log(firebase.auth().currentUser.uid);
            //document.getElementById("carrito").setAttribute("disabled","false");
            let r = firebase.database().ref("users-db/" + firebase.auth().currentUser.uid +"/carrito")
            
            r.on('value',function (snapshot){
                let v = snapshot.val();
                if(v === null){
                    document.getElementById("carritoInfo").textContent = "Usted aun no tiene articulos";
                }else{
                    document.getElementById("carritoInfo").textContent = "Su recibo";
                    let keys = Object.keys(v);
                    for(let ki of keys){
                        let c = document.createElement("p");
                        c.textContent = v[ki].name.toString() + " " + v[ki].price;
                        document.getElementById("itemList").appendChild(c);
                    }
                    let button = document.createElement("button");
                    button.textContent = "Vaciar carrito";
                    button.addEventListener('click',(e) => {
                        let r = firebase.database().ref("users-db/" + firebase.auth().currentUser.uid +"/carrito");
                        r.set(null);
                    });
                    document.getElementById("itemList").appendChild(button);
                }
            });     
        }
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