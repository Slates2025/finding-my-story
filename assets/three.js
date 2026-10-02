import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
// Decoder for meshopt-compressed models (Wellington is compressed this way to
// keep it small). Uncompressed models like Auckland load exactly as before.
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// =============================================================================
// City scenes
// -----------------------------------------------------------------------------
// One function builds a full explorable 3D city (lighting, orbit controls,
// idle auto-orbit + "breathing" zoom, "drag to explore" hint, animated water,
// resize handling). Each city on the page is a single createCityScene() call at
// the bottom of this file.
// =============================================================================

// Shared animated ripple for any material named WATER. Blender's procedural
// water can't export to glTF, so recreate it with a tiling normal map.
const waterNormals = new THREE.TextureLoader().load(
    'https://unpkg.com/three@0.179.1/examples/textures/waternormals.jpg'
);
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
waterNormals.repeat.set(6, 6);
waterNormals.colorSpace = THREE.NoColorSpace;

// On touch devices, don't let the model capture one-finger gestures — that
// traps page scrolling (OrbitControls sets touch-action:none and swallows the
// swipe). Interaction is disabled there; the gentle auto-orbit still shows it's
// a 3D model.
const isTouch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

function createCityScene(opts) {

    const container = document.getElementById(opts.containerId);
    if (!container) return;

    // Don't build (or download the model for) a city in a draft chapter that's
    // hidden on the live site.
    if (container.closest('.draft-chapter') &&
        !document.documentElement.classList.contains('show-drafts')) return;

    // -------------------------------------------------------------------------
    // Scene + lighting
    // -------------------------------------------------------------------------

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // A gentle directional "sun" for highlights and a sense of direction. Most
    // of the fill/reflection comes from the environment map below, so the
    // ambient light is kept low to avoid washing the scene out.
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
    directionalLight.position.set(30, 40, 20);
    scene.add(directionalLight);

    // -------------------------------------------------------------------------
    // Camera
    // -------------------------------------------------------------------------

    // The scene loads inside a collapsed accordion (zero height). Initialising
    // with a 0 dimension can leave a permanently black canvas on some mobile
    // browsers (notably Firefox on Android), so fall back to a 16:9 box. The
    // ResizeObserver swaps in the true size once the chapter is opened.
    function sceneSize() {
        const w = container.clientWidth || 800;
        const h = container.clientHeight || Math.round(w * 9 / 16);
        return { w, h };
    }
    const _init = sceneSize();

    // A narrower field of view gives a flatter, more "telephoto" look (like a
    // 50mm lens in Blender).
    const camera = new THREE.PerspectiveCamera(opts.fov || 45, _init.w / _init.h, 0.1, 1000);

    // -------------------------------------------------------------------------
    // Renderer
    // -------------------------------------------------------------------------

    // Very large models (Wellington, ~4km across) need a logarithmic depth
    // buffer, or surfaces that sit almost on top of each other (the harbour
    // floor just under the water) flicker through one another.
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: !!opts.logDepth });
    renderer.setSize(_init.w, _init.h);

    // Cap pixel ratio at 2 — beyond that costs performance for no visible gain.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Filmic tone mapping + correct colour space so the PBR materials read the
    // way they do in a Blender render.
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------------------
    // Environment (image-based lighting)
    // -------------------------------------------------------------------------

    // glTF can't carry Blender's world/lighting, so light the scene with a
    // neutral studio environment. Dialled back so metallic buildings read as
    // soft mid-grey while water keeps a little reflection.
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.25;

    // -------------------------------------------------------------------------
    // Controls
    // -------------------------------------------------------------------------

    const controls = new OrbitControls(camera, renderer.domElement);

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

    if (isTouch) {
        controls.enabled = false;
        renderer.domElement.style.touchAction = 'pan-y';
    }

    // Vertical movement and unrestricted left/right orbit, as before.
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;

    // Framing. A city can either give an exact camera (Auckland's hand-tuned
    // composition) or let us frame it automatically from the model's size.
    let baseFov = camera.fov;

    function applyFraming(f) {
        // Large models (Wellington is ~4km across) need a deeper view range.
        if (f.near || f.far) {
            camera.near = f.near || camera.near;
            camera.far = f.far || camera.far;
            camera.updateProjectionMatrix();
        }
        camera.position.set(f.position[0], f.position[1], f.position[2]);
        controls.target.set(f.target[0], f.target[1], f.target[2]);
        camera.lookAt(controls.target);
        controls.minDistance = f.minDistance;
        controls.maxDistance = f.maxDistance;
        controls.update();
    }

    if (opts.camera) applyFraming(opts.camera);

    // Auto-framing: same viewing angle as Auckland (above and to one side),
    // at a distance that fits the whole model.
    function autoFrame(object) {
        const box = new THREE.Box3().setFromObject(object);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const c = sphere.center;
        const r = sphere.radius || 1;
        const dist = r * (opts.fitDistance || 1.9);
        const dir = new THREE.Vector3(0, 0.75, -1).normalize();
        camera.near = Math.max(0.01, r / 200);
        camera.far = r * 20;
        camera.updateProjectionMatrix();
        applyFraming({
            position: [c.x + dir.x * dist, c.y + dir.y * dist, c.z + dir.z * dist],
            target: [c.x, c.y, c.z],
            minDistance: r * 1.1,
            maxDistance: r * 3
        });
    }

    // -------------------------------------------------------------------------
    // Idle motion + "drag to explore" hint
    // -------------------------------------------------------------------------

    const hint = opts.hintId ? document.getElementById(opts.hintId) : null;
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

    // Only draw while the scene is on screen — saves battery and keeps two
    // cities on one page from competing for the GPU.
    let onScreen = false;

    if (typeof IntersectionObserver !== 'undefined') {
        let started = false;
        const io = new IntersectionObserver(function (entries) {
            onScreen = entries.some(function (e) { return e.isIntersecting; });
            // Start the idle motion (and the hint's auto-dismiss timer) the
            // first time the scene is properly in view.
            if (!started && entries.some(function (e) { return e.intersectionRatio >= 0.4; })) {
                started = true;
                autoActive = true;
                controls.autoRotate = true;
                setTimeout(function () { if (hint) hint.classList.add('hide'); }, 8000);
            }
        }, { threshold: [0, 0.4] });
        io.observe(container);
    } else {
        onScreen = true;
        autoActive = true;
        controls.autoRotate = true;
    }

    // -------------------------------------------------------------------------
    // Model
    // -------------------------------------------------------------------------

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(

        opts.model,

        function (gltf) {

            scene.add(gltf.scene);

            // Restyle the WATER material: an opaque blue dielectric with glossy
            // reflections and an animated ripple (the exported transmissive
            // material renders near-black against the dark backdrop).
            gltf.scene.traverse(function (obj) {
                // Auckland's water is called WATER; Wellington's is Herald_Water.
                if (obj.isMesh && obj.material && /(^|_)water$/i.test(obj.material.name)) {
                    const m = obj.material;
                    m.transmission = 0;
                    m.metalness = 0;
                    m.roughness = 0.35;
                    m.normalMap = waterNormals;
                    m.normalScale = new THREE.Vector2(0.3, 0.3);
                    // Draw the water just in front of anything at the same
                    // height (e.g. harbour-floor terrain) so it never speckles.
                    m.polygonOffset = true;
                    m.polygonOffsetFactor = -1;
                    m.polygonOffsetUnits = -4;
                    m.needsUpdate = true;
                }
            });

            if (!opts.camera) autoFrame(gltf.scene);

        },

        undefined,

        function (error) { console.error(error); }

    );

    // -------------------------------------------------------------------------
    // Resize
    // -------------------------------------------------------------------------

    function resizeToContainer() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    window.addEventListener('resize', resizeToContainer);

    // Re-fit whenever the container changes size — e.g. when the accordion
    // panel opens and the scene is revealed at full width.
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(resizeToContainer).observe(container);
    }

    // -------------------------------------------------------------------------
    // Animation loop
    // -------------------------------------------------------------------------

    function animate() {

        requestAnimationFrame(animate);
        if (!onScreen) return;

        // Subtle idle "breathing" zoom while the auto-motion is running.
        if (autoActive) {
            camera.fov = baseFov + Math.sin(performance.now() * 0.0005) * 1.5;
            camera.updateProjectionMatrix();
        }

        controls.update();
        renderer.render(scene, camera);

    }

    animate();

    return { camera, controls };
}

// Drift the shared water ripple (runs once for every city on the page).
(function drift() {
    requestAnimationFrame(drift);
    const t = performance.now() * 0.00002;
    waterNormals.offset.set(t, t * 0.5);
})();

// =============================================================================
// The cities
// =============================================================================

// Auckland — "I think by making". Hand-tuned composition.
const auckland = createCityScene({
    containerId: 'auckland-scene',
    hintId: 'scene-hint',
    model: 'assets/images/auckland.glb',
    camera: {
        position: [-15, 45, -55],
        target: [-15, -10, 0],
        minDistance: 35,
        maxDistance: 90
    }
});

// Wellington — "Show, don't tell". Matches the Blender view: from out over the
// harbour, looking straight back across the water to the CBD with the hills
// behind, the near edge of the tile running across the bottom of the frame.
// A narrower lens (30°) gives Blender's flatter 50mm look. The tile runs 0–4000
// on x and 0 to -4000 on z; the harbour sits on the high-x side.
const wellington = createCityScene({
    containerId: 'wellington-scene',
    hintId: 'wellington-hint',
    model: 'assets/images/wellington.glb',
    fov: 30,
    logDepth: true,
    camera: {
        // Tilted down slightly so the city sits higher in the frame, with the
        // near edge of the harbour just above the bottom.
        position: [6600, 2550, -2050],
        target: [2290, 1, -2050],
        minDistance: 800,
        maxDistance: 7500,
        near: 5,
        far: 30000
    }
});

// Handy for tuning camera positions from the browser console.
if (auckland) { window.camera = auckland.camera; window.controls = auckland.controls; }
if (wellington) { window.wellingtonCamera = wellington.camera; window.wellingtonControls = wellington.controls; }
