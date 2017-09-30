import * as THREE from 'three';
global.THREE = THREE;
export default THREE;

require('three/examples/js/controls/OrbitControls');

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