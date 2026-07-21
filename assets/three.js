import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('auckland-scene');

// -----------------------------------------------------------------------------
// Scene
// -----------------------------------------------------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// -----------------------------------------------------------------------------
// Lighting
// -----------------------------------------------------------------------------

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(30, 40, 20);
scene.add(directionalLight);

// -----------------------------------------------------------------------------
// Camera
// -----------------------------------------------------------------------------

const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);

camera.position.set(-15, 45, -55);
camera.lookAt(-15, -10, 0);

// -----------------------------------------------------------------------------
// Renderer
// -----------------------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

renderer.setPixelRatio(window.devicePixelRatio);

container.appendChild(renderer.domElement);

// -----------------------------------------------------------------------------
// Controls
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Controls
// -----------------------------------------------------------------------------

const controls = new OrbitControls(camera, renderer.domElement);

// Match the composition you've already chosen.
controls.target.set(-15, -10, 0);
controls.update();

// Nice smooth movement.
controls.enableDamping = true;
controls.dampingFactor = 0.08;

// Editorial-style interaction.
controls.enablePan = false;
controls.enableZoom = true;

controls.rotateSpeed = 0.30;
controls.zoomSpeed = 0.6;

// Prevent the camera getting too close or too far away.
controls.minDistance = 35;
controls.maxDistance = 90;

// Restrict vertical movement.
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;

// Restrict left/right rotation to roughly ±45°.
controls.minAzimuthAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

const loader = new GLTFLoader();

loader.load(

    'assets/images/auckland.glb',

    function (gltf) {

        scene.add(gltf.scene);

        const box = new THREE.Box3().setFromObject(gltf.scene);

        console.log("MIN", box.min.toArray());
        console.log("MAX", box.max.toArray());
        console.log("CENTER", box.getCenter(new THREE.Vector3()).toArray());
        console.log("SIZE", box.getSize(new THREE.Vector3()).toArray());

        console.log("Model loaded!");

    },

    undefined,

    function (error) {

        console.error(error);

    }

);

// -----------------------------------------------------------------------------
// Resize
// -----------------------------------------------------------------------------

function resizeToContainer() {

    const w = container.clientWidth;
    const h = container.clientHeight;

    if (!w || !h) return;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);

}

window.addEventListener('resize', resizeToContainer);

// Re-fit whenever the container itself changes size — e.g. when the
// accordion panel opens and the scene is revealed at full width.
if (typeof ResizeObserver !== 'undefined') {

    const ro = new ResizeObserver(resizeToContainer);
    ro.observe(container);

}

// -----------------------------------------------------------------------------
// Animation Loop
// -----------------------------------------------------------------------------

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);

}
window.camera = camera;
window.controls = controls;

animate();