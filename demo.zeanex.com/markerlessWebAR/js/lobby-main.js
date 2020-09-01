
import "../firebase/firebase-app.js";
import "../firebase/firebase-auth.js";
import "../firebase/firebase-storage.js";
import "../firebase/firebase-database.js";

import * as THREE from 'https://unpkg.com/three@0.120.0/build/three.module.js';

import Stats from 'https://unpkg.com/three@0.120.0/examples/jsm/libs/stats.module.js';

import { DragControls } from 'https://unpkg.com/three@0.120.0/examples/jsm/controls/DragControls.js';
import { CustomControls } from '/demo.zeanex.com/markerlessWebAR/js/CustomControls.js';
import { ImprovedNoise } from 'https://unpkg.com/three@0.120.0/examples/jsm/math/ImprovedNoise.js';
import { GLTFLoader  } from 'https://unpkg.com/three@0.120.0/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter  } from 'https://unpkg.com/three@0.120.0/examples/jsm/exporters/GLTFExporter.js';

var loader = new GLTFLoader();
var exporter = new GLTFExporter();

var container, stats;

var camera, controls, scene, renderer;
var controlsDrag;

var loaded = [];
var cube;
var raycaster;
var mouse;
var current;
var saved;
var remove;

var link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594


var worldWidth = 200, worldDepth = 200;
var worldHalfWidth = worldWidth / 2;
var worldHalfDepth = worldDepth / 2;
var data = generateHeight( worldWidth, worldDepth );

var clock = new THREE.Clock();


initFirebase();
console.log(window.location.search);
        
init();
animate();    




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
    // Initialize Firebase
    console.log(firebase);
    firebase.initializeApp(firebaseConfig);
    console.log("ready");
    var muebles = firebase.database().ref('muestras-db');
    muebles.on('value', function(snapshot) {
        var sv = snapshot.val();
        var k = Object.keys(snapshot.val());
        for (var s of k){
            var pi = document.createElement("p");
            var ai = document.createElement("a");
            let t = sv[s].file;
            ai.setAttribute("href", "sala-user.html?"+ s);
            ai.setAttribute("id", s);
            ai.textContent = sv[s].name;
            pi.appendChild(ai);
            document.getElementById("lists").appendChild(pi);
        }

    });
}

function init() {

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    function onMouseMove( event ) {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    window.addEventListener( 'mousemove', onMouseMove, false );

    container = document.getElementById( 'ThreeView' );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.y += 0;
    camera.position.z += 10;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.FogExp2( 0xffffff, 0.00015 );

    var ambientLight = new THREE.AmbientLight( 0xcccccc );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
    directionalLight.position.set( 1, 1, 0.5 ).normalize();
    scene.add( directionalLight );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    controls = new CustomControls( camera, renderer.domElement );
    controls.movementSpeed = 10;
    controls.lookSpeed = 0.125;
    controls.lookVertical = true;
    controls.constrainVertical = true;
    controls.verticalMin = 1.1;
    controls.verticalMax = 2.2;

    stats = new Stats();
    container.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize, false );
    firebase.storage().ref("muestras/" + window.location.search.substr(1)).child('scene.gltf').getDownloadURL().then(function(url) {
            load(url);
    });

    document.getElementById("ThreeView").addEventListener("click", (e) => {
        console.log(current);

        if(current != null)
        {
            document.getElementById("infoTitle").textContent = current.uuid;
            document.getElementById("infoName").textContent = current.userData.name;
            document.getElementById("infoCategory").textContent = current.userData.cat;
            document.getElementById("infoPrice").textContent = current.userData.price;
            document.getElementById("redirectAR").setAttribute("href","ar/f?" +  current.userData.uuid)
            saved = current;
        }
    });

    document.getElementById("carrito").addEventListener("click", (e) => {
        if(saved != null && saved.userData.uuid)
        {
            if(firebase.auth().currentUser === null)
            {
                window.location = "login.html?redirect=sala-user.html";
            }
            else{
                var dbr = firebase.database().ref();
                dbr.child("users-db/" + firebase.auth().currentUser.uid +"/carrito").push().then((k) =>{
                    var data ={
                        "uuid" : saved.userData.uuid,
                        "name" : saved.userData.name,
                        "price" : saved.userData.price,
                        "tuid" : k.getKey()
                    }
                    dbr.child("users-db/" + firebase.auth().currentUser.uid +"/carrito/" + k.getKey()).update(data);
                });
            }
        }
    });

    //document.getElementById("carrito").setAttribute("disabled","true");
    firebase.auth().onAuthStateChanged((e) => {
        console.log("autorizado")
        console.log(firebase.auth().currentUser);
        //document.getElementById("carrito").setAttribute("disabled","false");
        let r = firebase.database().ref("users-db/" + firebase.auth().currentUser.uid +"/carrito")
        
        r.on('value',function (snapshot){
            console.log(snapshot.val())
            if(snapshot.val() === null){
                document.getElementById("carritoTotal").textContent = "0";
            }else{
                let t = Object.keys(snapshot.val()).length;
                document.getElementById("carritoTotal").textContent = t.toString();
            }
            
        });
    });
    document.getElementById("buttonCarrito").addEventListener("click", (e)=>{
        window.location = "carrito.html";
    })
    
}

// window.location.search.substr(1)
function load( res ){
    loader.load( res, function ( gltf ) {
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
        console.error( error );
    
    } );
}

function loadInteractive( res ){
    loader.load( res, function ( gltf ) {
        var objs = objectSearch(gltf.scene.children);
        loaded.push(objs);
        controlsDrag = new DragControls(objs, camera, renderer.domElement);
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
        console.error( error );
    
    } );
}

function objectSearch(o){
    if (!Array.isArray(o)){
        o=[o];
    }
    var arr = [];
    for( var oi of o){
        if (oi.type === "Mesh" || oi.type === "Object3D"){
            oi.userData.isFurniture = true;
            arr.push(oi);
        }
        if(oi.children.length > 0){
            arr.join(objectSearch(oi.children));
        }
    }
    return arr;
}

function exportGLTF( input ) {

    var gltfExporter = new GLTFExporter();

    var options = {
        trs: true,
        onlyVisible: false,
        truncateDrawRange: false,
        binary: false,
        forcePowerOfTwoTextures: false,
        maxTextureSize: Infinity // To prevent NaN value
    };
    gltfExporter.parse( input, function ( result ) {
        var output = JSON.stringify( result, null, 2 );
        saveString( output, 'scene.gltf' );
    }, options );

}


function save( blob, filename ) {

    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();
}

function saveString( text, filename ) {

    save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}


function saveArrayBuffer( buffer, filename ) {

    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function generateHeight( width, height ) {
    var data = [], perlin = new ImprovedNoise(),
        size = width * height, quality = 2, z = Math.random() * 100;
    for ( var j = 0; j < 4; j ++ ) {
        if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;
        for ( var i = 0; i < size; i ++ ) {
            var x = i % width, y = ( i / width ) | 0;
            data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;
        }
        quality *= 4;
    }
    return data;
}

function getY( x, z ) {

    return ( data[ x + z * worldWidth ] * 0.2 ) | 0;

}

function animate() {

    requestAnimationFrame( animate );

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );
    
    var intersects;
    intersects = raycaster.intersectObjects( scene.children, true );
    if(intersects.length == 0)
    {
        current = null;
    }
    if(intersects != null && intersects.length != 0 &&  intersects[0].object != current && intersects[0].object.userData.isFurniture){
        try{
            
            document.getElementById("selected").innerText =  intersects[0].object.userData.name;         
            document.getElementById("form").setAttribute("action", "/demo.zeanex.com/markerlessWebAR/ar.html?"+  intersects[0].object.userData.uuid);
            document.getElementById("redirectAR").setAttribute("href","/demo.zeanex.com/markerlessWebAR/ar.html?"+  intersects[0].object.userData.uuid);
        }
        catch(err){}
        
        console.log(intersects);
        current = intersects[0].object;
    }

    if(remove != null){
        console.log("bye");
        let nm = remove.parent.getObjectByName(remove.name);
        remove.parent.remove(nm)
        scene.remove(remove);
        remove=null;
    }

    renderer.render( scene, camera );
    render();
    stats.update();

}

function render() {

    controls.update( clock.getDelta() );
    renderer.render( scene, camera );

}