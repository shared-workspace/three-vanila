import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
export const renderer = new THREE.WebGLRenderer();
export const controls = new OrbitControls(camera, renderer.domElement);

const axisHelper = new THREE.AxesHelper(5);
scene.add(axisHelper);

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("resize", handleResize);

// controls.enableDamping = true;
// controls.dampingFactor = 0.25;
// controls.enableZoom = true;
// controls.minZoom = 1;
// controls.maxZoom = 10;
controls.update();

camera.position.set(5, 5, 5);

document.body.appendChild(renderer.domElement);

animate();
handleResize();
