/* 
THREE.js r117
*/

// UTILITY
import Stats from './../../node_modules/three/examples/jsm/libs/stats.module.js';
import { GUI } from './../../node_modules/three/examples/jsm/libs/dat.gui.module.js';
import { WEBGL } from './../../node_modules/three/examples/jsm/WebGL.js';

// THREE
import * as THREE from './../../node_modules/three/build/three.module.js';
import { OrbitControls } from './../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';

// POST PROCESSING
import { EffectComposer } from './../../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './../../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { FXAAShader } from './../../node_modules/three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from './../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from './../../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Global Variables
const canvas = document.getElementsByClassName("three-canvas")[0];
const parent = document.getElementsByClassName("canv-box")[0];

let camera, scene, renderer, composer, controls, clock, stats, gui;
let textureLoader;
const TEXTURES = {};
const Lights = [];
const ShadowSettings = {
	ON: true,
	shadowmapSize: 1024
};

init();

function init(){

	// Detect WebGL support
	if ( !WEBGL.isWebGLAvailable() ) {
		console.error("WebGL is not available!");
		let warning = WEBGL.getWebGLErrorMessage();
		document.body.appendChild( warning );
		return;
	}

	// Renderer
	renderer = new THREE.WebGLRenderer({ 
		canvas: canvas,
		antialias: true,
		powerPreference: "high-performance"
	});
	renderer.setSize( parent.offsetWidth , parent.offsetHeight );
	// renderer.setPixelRatio( 1.0 );
	if( ShadowSettings.ON ){ 
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.shadowMap.autoUpdate = false;
	}
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.physicallyCorrectLights = true;

	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xb0b0b0 );

	// Camera
	camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.set( 0 , 8 , 13 );

	// Clock
	clock = new THREE.Clock();
	
	//Stats
	stats = new Stats();
	document.body.appendChild( stats.dom );

	//GUI
	gui = new GUI();
	// gui.add(object, property, [min], [max], [step])

	// Loaders
	textureLoader = new THREE.TextureLoader();

	// Resize Event
	window.addEventListener("resize", onWindowResize, false);

	// Inits
	initControls();
	initTextures();
	initLights();
	createStartingMesh();
	// initPostProcessing();

	if( ShadowSettings.ON ) renderer.shadowMap.needsUpdate = true;

	setInterval( function(){
		console.log( renderer.info.render.calls );
	}, 1000/2 );

	animate();
}

function createStartingMesh(){

	const floor = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 30 , 30 ),
		new THREE.MeshPhongMaterial({
			color: 0x108020,
			shininess: 0,
		})
	);
	floor.rotation.x -= 90 * Math.PI/180;
	scene.add( floor );
	if( ShadowSettings.ON ) floor.receiveShadow = true;

	const cube = new THREE.Mesh( 
		new THREE.BoxGeometry( 2 , 2 , 2 ) , 
		new THREE.MeshLambertMaterial({color: 0x202020 })
	);
	if( ShadowSettings.ON ) {
		cube.castShadow = true;
		cube.receiveShadow = true;
	}
	cube.position.set( 0 , 1 , 0 );
	scene.add( cube );
}

function initControls(){
	controls = new OrbitControls( camera , canvas );
}

function initTextures(){
	
}

function initPostProcessing(){

	renderer.info.autoReset = false;
	composer = new EffectComposer( renderer );

	// Passes
	let renderPass = new RenderPass( scene, camera );
	let fxaaPass = new ShaderPass( FXAAShader );

	composer.addPass( renderPass );
	composer.addPass( fxaaPass );
}

function initLights(){

	Lights[0] = new THREE.AmbientLight( 0xffffff , 0.3 );
	Lights[1] = new THREE.DirectionalLight( 0xffffff , 0.8 );
	Lights[1].position.set( 8 , 30 , 10 );
	if( ShadowSettings.ON ){
		Lights[1].castShadow = true;
		Lights[1].shadow.mapSize.width = ShadowSettings.shadowmapSize;
		Lights[1].shadow.mapSize.height = ShadowSettings.shadowmapSize;
		Lights[1].shadow.camera.near = 0.1;
		Lights[1].shadow.camera.far = 50;
		if( Lights[1] instanceof THREE.DirectionalLight ){
			Lights[1].shadow.camera.left = -30;
			Lights[1].shadow.camera.bottom = -30;
			Lights[1].shadow.camera.top = 30;
			Lights[1].shadow.camera.right = 30;
		}
		Lights[1].shadow.bias = 0; // -0.0005;
	}

	const helper = new THREE.CameraHelper( Lights[1].shadow.camera );
	scene.add( helper );

	for( let i = 0; i < Lights.length; i++ ){
		scene.add( Lights[i] );
	}
}

function animate(){
	stats.begin();
	// renderer.info.reset();

	const delta = clock.getDelta();

	// composer.render();
	renderer.render( scene, camera );
	requestAnimationFrame( animate );

	stats.end();
}

function onWindowResize(){
	// composer.setSize( parent.offsetWidth , parent.offsetHeight );
	renderer.setSize( parent.offsetWidth , parent.offsetHeight );
	camera.aspect = parent.offsetWidth / parent.offsetHeight;
	camera.updateProjectionMatrix();
}