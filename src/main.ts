import * as THREE from "three";
import { scene } from "./init";
import * as dat from "dat.gui"; // Import dat.GUI

// plane wireframe using shader material
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 center;
  uniform float amplitude; // Add amplitude uniform
  varying vec3 vNormal;
  varying vec3 vAmplitude; // Add varying amplitude

  // Random function (pseudo-random based on input)
  float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Improved Noise function (slightly better distribution)
  float improvedNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix( mix( random( i + vec2(0.0,0.0) ), random( i + vec2(1.0,0.0) ), u.x),
               mix( random( i + vec2(0.0,1.0) ), random( i + vec2(1.0,1.0) ), u.x), u.y);
  }

  vec3 useWaterWave(vec3 position) {
    vec3 transformed = position;

    // --- Wave Components ---
    float wave1Amplitude = 0.15 + improvedNoise(position.xy * 2.0 + uTime * 0.3) * 0.03;
    float wave1Frequency = 1.8 + improvedNoise(position.xy * 3.0 - uTime * 0.2) * 0.15;
    float wave1 = sin((position.x * 1.5 + position.y * 1.5) * wave1Frequency + uTime * wave1Frequency) * wave1Amplitude;

    float wave2Amplitude = 0.25 + improvedNoise(position.xy * 4.0 - uTime * 0.5) * 0.05;
    float wave2Frequency = 1.3 + improvedNoise(position.xy * 2.0 + uTime * 0.1) * 0.1;
    float wave2 = sin((position.x * -1.0 + position.y * 2.0) * wave2Frequency + uTime * wave2Frequency) * wave2Amplitude;

    float wave3Amplitude = 0.1 + improvedNoise(position.xy * 1.5 + uTime * 0.7) * 0.02;
    float wave3Frequency = 0.8 + improvedNoise(position.xy * 4.0 - uTime * 0.4) * 0.08;
    float wave3 = sin((position.x * 2.0 + position.y * -1.0) * wave3Frequency + uTime * wave3Frequency) * wave3Amplitude;

    // Combine waves and apply a scaling factor
    float combinedWave = (wave1 + wave2 + wave3) * 0.7; // Reduce overall wave intensity

    // --- Noise Components ---
    float noiseScale1 = 0.08;
    float noiseFrequency1 = 3.0;
    float noiseOffset1 = improvedNoise(position.xy * noiseFrequency1 + uTime * 0.5) * noiseScale1;

    float noiseScale2 = 0.05;
    float noiseFrequency2 = 7.0;
    float noiseOffset2 = improvedNoise(position.xy * noiseFrequency2 - uTime * 0.8) * noiseScale2;

    // --- Dampening/Smoothing (simple approach) ---
    float totalDisplacement = combinedWave + noiseOffset1 + noiseOffset2;
    float dampenedDisplacement = totalDisplacement * smoothstep(0.0, 0.5, 1.0 - abs(totalDisplacement)); // Dampen larger displacements

    transformed.z += dampenedDisplacement * amplitude; // Apply amplitude
    return transformed;
  }

  void main() {
    vNormal = normal;
    vAmplitude = vec3(amplitude); // Pass amplitude to fragment shader
    gl_Position = projectionMatrix * modelViewMatrix * vec4(useWaterWave(position), 1.0);
  }
`;
const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vAmplitude; // Add varying amplitude
  void main() {
    vec3 color = normalize(vNormal) * 0.5 + 0.5;
    color *= vAmplitude; // Apply amplitude to color
    gl_FragColor = vec4(color, 1.0);
  }
`;

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100); // Increased segments for better detail
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  wireframe: true,
  uniforms: {
    uTime: { value: 0.0 },
    center: { value: new THREE.Vector3(0, 0, 0) },
    amplitude: { value: 0.2 },
    speed: { value: 1.0 }
  },
});

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;

const gui = new dat.GUI();
const options = {
  amplitude: 0.2,
  speed: 1.0
};
gui.add(options, 'amplitude', 0, 1).onChange(value => {
  material.uniforms.amplitude.value = value;
});
gui.add(options, 'speed', 0, 5).onChange(value => {
  material.uniforms.speed.value = value;
});

const clock = new THREE.Clock();
const animate = () => {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();
  material.uniforms.uTime.value = time * options.speed; // Use speed option
};
animate();
scene.add(plane);