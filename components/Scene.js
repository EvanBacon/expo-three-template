import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';
import Touches from '../window/Touches';
import Files from '../Files';
import {ThreeView} from './index';

class Scene extends React.Component {
    static defaultProps = {
        onLoadingUpdated: (({ loaded, total }) => { }),
        onFinishedLoading: (() => { }),
    }

    AR = true;

    shouldComponentUpdate(nextProps, nextState) {
        const { props, state } = this;
        return false;
    }

    render() {
        return (
            <ThreeView
                style={{ flex: 1 }}
                onContextCreate={this.onContextCreateAsync}
                render={this.animate}
                enableAR={this.AR}
            />
        );
    }

    onContextCreateAsync = async (gl, arSession) => {

        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // renderer
        this.renderer = ExpoTHREE.createRenderer({ gl });
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000, 1.0);

        this.setupScene(arSession);

        // resize listener
        window.addEventListener('resize', this.onWindowResize, false);

        // setup custom world
        await this.setupWorldAsync();

        this.props.onFinishedLoading();
    }

    setupScene = (arSession) => {
        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // scene
        this.scene = new THREE.Scene();

        if (this.AR) {
            // AR Background Texture
            this.scene.background = ExpoTHREE.createARBackgroundTexture(arSession, this.renderer);

            /// AR Camera
            this.camera = ExpoTHREE.createARCamera(arSession, width, height, 0.01, 1000);
        } else {
            // Standard Background
            this.scene.background = new THREE.Color(0xcccccc);
            this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

            /// Standard Camera
            this.camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 1000);
            this.camera.position.z = 5;
            this.camera.lookAt(new THREE.Vector3());

            // controls    
            this.controls = new THREE.OrbitControls(this.camera);
            // this.controls.addEventListener('change', this._render); // remove when using animation loop
        }
    }

    setupLights = () => {
        // lights
        let light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0x002288);
        light.position.set(-1, -1, -1);
        this.scene.add(light);

        light = new THREE.AmbientLight(0x222222);
        this.scene.add(light);
    }

    setupWorldAsync = async () => {

        this.setupLights();

        // Rotating cube

        this.cube = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 0.07, 0.07),
            new THREE.MeshBasicMaterial({
                map: await ExpoTHREE.createTextureAsync({
                    asset: Expo.Asset.fromModule(Files.icons["app-icon"]),
                }),
            })
        );
        this.cube.position.z = -0.4;
        this.scene.add(this.cube);

        this.scene.add(new THREE.GridHelper(4, 10));
    }

    onWindowResize = () => {
        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
    }

    animate = (delta) => {
        // Rotate cube
        this.cube.rotation.x += 0.07;
        this.cube.rotation.y += 0.04;

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}
export default Touches(Scene);