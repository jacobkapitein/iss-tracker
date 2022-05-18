import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { getIssLocation, mapCoordsToVec3 } from './location-utils';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { GUI } from 'dat.gui';

let camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    labelRenderer: CSS2DRenderer,
    gltfLoader: GLTFLoader,
    controls: OrbitControls,
    earth: THREE.Mesh,
    iss: THREE.Object3D,
    lightPivot: THREE.Object3D,
    issLabel: CSS2DObject,
    earthLabel: CSS2DObject,
    clock: THREE.Clock;


const init = async () => {
    // Set Scene
    scene = new THREE.Scene();
    // Add stars to the background
    scene.background = new THREE.CubeTextureLoader().load([
        './resources/images/sky_px.jpg',
        './resources/images/sky_nx.jpg',
        './resources/images/sky_py.jpg',
        './resources/images/sky_ny.jpg',
        './resources/images/sky_pz.jpg',
        './resources/images/sky_nz.jpg',
    ]);

    // Initialize renderers
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    document.body.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild(labelRenderer.domElement);

    // Init the clock so animation speed is not FPS bound
    clock = new THREE.Clock();

    // Init model loader
    gltfLoader = new GLTFLoader();

    // Create the sun
    // Create a light
    let light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 0, 3);
    light.castShadow = true;
    light.shadow.bias = -0.003;
    // Set light pivot point to the earth
    lightPivot = new THREE.Object3D();
    lightPivot.add(light);
    scene.add(lightPivot);
    // Initialize sun slider
    var slider = document.getElementById("slider");

    // Initialize the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;

    // Create the earth
    const earthGeometry = new THREE.SphereGeometry(1, 720, 360)
    const earthMaterial = new THREE.MeshStandardMaterial()
    // Set texture
    const earthTexture = new THREE.TextureLoader().load('./resources/images/texture.jpg')
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    earthMaterial.map = earthTexture
    // Set displacement map
    const displacementMap = new THREE.TextureLoader().load('./resources/images/displacement.jpg')
    earthMaterial.displacementMap = displacementMap
    earthMaterial.displacementScale = 0.07
    // Add the globe to the scene
    earth = new THREE.Mesh(earthGeometry, earthMaterial)
    earth.castShadow = true
    earth.receiveShadow = true
    scene.add(earth)

    const earthDiv = document.createElement('div');
    earthDiv.className = 'label';
    earthDiv.textContent = 'Earth';
    earthDiv.style.marginTop = '-1em';
    earthLabel = new CSS2DObject(earthDiv);
    earthLabel.position.set(earth.position.x, earth.position.y+1, earth.position.z);
    earth.add(earthLabel);
    earthLabel.layers.set(0);


    // Create the ISS
    iss = new THREE.Object3D();
    await gltfLoader.loadAsync('./resources/models/iss.glb')
        .then((model: GLTF) => {
            console.log("ISS Model loaded");
            iss = model.scene.children[0]
            iss.scale.set(0.1, 0.1, 0.1);
            scene.add(iss);
        });

    // Set ISS coords every second
    let coords: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    iss.position.set(coords.x, coords.y, coords.z);
    const setIssLocation = async () => {
        await getIssLocation()
            .then((location) => {
                coords = mapCoordsToVec3(location)
                iss.position.set(coords.x, coords.y, coords.z);
            })
            .catch((e) => {
                alert(e);
            })
    }
    setIssLocation();
    setInterval(setIssLocation, 5000);

    const issDiv = document.createElement('div');
    issDiv.className = 'label';
    issDiv.textContent = 'ISS';
    issDiv.style.marginTop = '-1em';
    issLabel = new CSS2DObject(issDiv);
    issLabel.position.set(iss.position.x, iss.position.y, iss.position.z);
    iss.add(issLabel);
    issLabel.layers.set(0);


    initGui();


    window.addEventListener('resize', onWindowResize, false)
    controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.minDistance = 1.3;
    controls.maxDistance = 5;
    controls.enablePan = false;
    animate();
}

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

const animate = () => {
    requestAnimationFrame(animate)


    if(lightPivot.rotation.y > Math.PI * 2) lightPivot.rotation.y = 0;
    else lightPivot.rotation.y += clock.getDelta() * 0.2
    iss.lookAt(earth.position)
    iss.rotateX(-1.5)

    render();
}

const initGui = () => {
    const gui: GUI = new GUI();

    const sunFolder = gui.addFolder("Sun");
    sunFolder.add(lightPivot.rotation, 'x', 0, Math.PI * 2, 0.1).name("X Rotation").listen();
    sunFolder.add(lightPivot.rotation, 'y', 0, Math.PI * 2, 0.1).name("Y Rotation").listen();
}

const render = () => {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

init();