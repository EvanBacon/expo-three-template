import * as THREE from 'three';
global.THREE = THREE;
export default THREE;

// Controls used for VR 
require('three/examples/js/controls/DeviceOrientationControls');
require('three/examples/js/loaders/OBJLoader');
require('three/examples/js/loaders/ColladaLoader2');

if (!console.time) {
    console.time = () => { };
}
if (!console.timeEnd) {
    console.timeEnd = () => { };
}

console.ignoredYellowBox = [
    'THREE.WebGLRenderer',
    'THREE.WebGLProgram',
];