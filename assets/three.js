import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const container = document.getElementById('auckland-scene');

// -----------------------------------------------------------------------------
// Scene
// -----------------------------------------------------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// -----------------------------------------------------------------------------
// Lighting
// -----------------------------------------------------------------------------

// A gentle directional "sun" for highlights and a sense of direction. Most of
// the fill/reflection now comes from the environment map set up below, so the
// ambient light is kept low to avoid washing the scene out.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
directionalLight.position.set(30, 40, 20);
scene.add(directionalLight);

// -----------------------------------------------------------------------------
// Camera
// -----------------------------------------------------------------------------

// The scene loads inside a collapsed accordion (zero height). Initialising the
// renderer or camera with a 0 dimension can leave a permanently black canvas on
// some mobile browsers (notably Firefox on Android), so fall back to a 16:9 box.
// The ResizeObserver swaps in the true size once the chapter is opened.
function sceneSize() {
    const w = container.clientWidth || 800;
    const h = container.clientHeight || Math.round(w * 9 / 16);
    return { w, h };
}
const _init = sceneSize();

const camera = new THREE.PerspectiveCamera(
    45,
    _init.w / _init.h,
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

renderer.setSize(_init.w, _init.h);

// Cap pixel ratio at 2 — beyond that costs performance for no visible gain.
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Filmic tone mapping + correct colour space so the PBR materials (and the
// transmissive water in particular) read the way they do in a Blender render.
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

// -----------------------------------------------------------------------------
// Environment (image-based lighting)
// -----------------------------------------------------------------------------

// glTF can't carry Blender's world/lighting, so light the scene with a neutral
// studio environment instead. This is also what makes the WATER material's
// reflections and transmission (its glass-like quality) actually show —
// transmissive materials render flat and dark without an environment to sample.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
// The buildings are fairly metallic, so a full-strength environment blows them
// out. Dial it back so they read as soft mid-grey (matching the Blender render)
// while the water keeps just enough reflection/transmission to look like water.
scene.environmentIntensity = 0.25;

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

// Gentle idle auto-orbit — enabled only once the scene scrolls into view.
controls.autoRotate = false;
controls.autoRotateSpeed = 0.6;

// On touch devices, don't let the model capture one-finger gestures — that
// traps page scrolling (OrbitControls sets touch-action:none and swallows the
// swipe). Disable interaction there so the page scrolls normally over it; the
// gentle auto-orbit still shows it's a 3D model.
const isTouch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
if (isTouch) {
    controls.enabled = false;
    renderer.domElement.style.touchAction = 'pan-y';
}

// Prevent the camera getting too close or too far away.
controls.minDistance = 35;
controls.maxDistance = 90;

// Restrict vertical movement.
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;

// Left/right rotation is unrestricted so readers can orbit right around the city.
controls.minAzimuthAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;

// -----------------------------------------------------------------------------
// Idle motion + "drag to explore" hint
// -----------------------------------------------------------------------------

// When the scene first scrolls into view, start a gentle auto-orbit and a subtle
// zoom (a slow FOV "breathe") — just enough to signal it's a 3D model. As soon
// as the reader takes over, drop the idle motion and the hint for good.
const hint = document.getElementById('scene-hint');
const baseFov = camera.fov;
let autoActive = false;

// No dragging on touch, so drop the "drag to explore" prompt there.
if (isTouch && hint) hint.classList.add('hide');

function stopAuto() {
    autoActive = false;
    controls.autoRotate = false;
    camera.fov = baseFov;
    camera.updateProjectionMatrix();
    if (hint) hint.classList.add('hide');
}

controls.addEventListener('start', stopAuto);
container.addEventListener('wheel', stopAuto, { passive: true });

// The scene sits in a collapsed accordion at load, so wait until it's actually
// on screen before starting the motion (and the hint's auto-dismiss timer).
if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
            io.disconnect();
            autoActive = true;
            controls.autoRotate = true;
            setTimeout(function () { if (hint) hint.classList.add('hide'); }, 8000);
        }
    }, { threshold: 0.4 });
    io.observe(container);
} else {
    autoActive = true;
    controls.autoRotate = true;
}

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

// Animated ripple for the water. Blender's procedural water can't export to
// glTF, so recreate it with a tiling normal map applied to the WATER material.
const waterNormals = new THREE.TextureLoader().load(
    'https://unpkg.com/three@0.179.1/examples/textures/waternormals.jpg'
);
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
waterNormals.repeat.set(6, 6);
waterNormals.colorSpace = THREE.NoColorSpace;

const loader = new GLTFLoader();

loader.load(

    'assets/images/auckland.glb',

    function (gltf) {

        scene.add(gltf.scene);

        // Restyle the WATER material. The exported material is fully transmissive
        // (glass-like), which against the dark backdrop turns it near-black. In the
        // Blender render the water reads as solid blue, so make it an opaque blue
        // dielectric with glossy reflections and an animated ripple.
        gltf.scene.traverse(function (obj) {
            if (obj.isMesh && obj.material && obj.material.name === 'WATER') {
                var m = obj.material;
                m.transmission = 0;
                m.metalness = 0;
                m.roughness = 0.35;
                m.normalMap = waterNormals;
                m.normalScale = new THREE.Vector2(0.3, 0.3);
                m.needsUpdate = true;
            }
        });

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

    // Drift the ripple to suggest gently moving water.
    if (waterNormals) {
        const t = performance.now() * 0.00002;
        waterNormals.offset.set(t, t * 0.5);
    }

    // Subtle idle "breathing" zoom while the auto-motion is running.
    if (autoActive) {
        camera.fov = baseFov + Math.sin(performance.now() * 0.0005) * 1.5;
        camera.updateProjectionMatrix();
    }

    controls.update();

    renderer.render(scene, camera);

}
window.camera = camera;
window.controls = controls;

animate();