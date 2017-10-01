import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';

import ThreeView from './ThreeView';

import './Three';
import './window/domElement';
import './window/resize';
import Touches from './window/Touches';

const AR = true;

class App extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const {props, state} = this;
    return false;
  }
  
  render = () => (
    <ThreeView
      style={{ flex: 1 }}
      onContextCreate={this._onContextCreate}
      render={this._animate}
      enableAR={AR}
    />
  );

  _onContextCreate = async (gl, arSession) => {

    const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

    // renderer
    this.renderer = ExpoTHREE.createRenderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 1.0);

    // scene
    this.scene = new THREE.Scene();

    if (AR) {
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

    // resize listener
    window.addEventListener('resize', this._onWindowResize, false);

    // setup custom world
    await this._setupWorld();
  }

  _setupLights = () => {
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

  _setupWorld = async () => {

    this._setupLights();

    // Rotating cube

    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.07, 0.07),
      new THREE.MeshBasicMaterial({
        map: await ExpoTHREE.createTextureAsync({
          asset: Expo.Asset.fromModule(require('./assets/icons/app-icon.png')),
        }),
      })
    );
    this.cube.position.z = -0.4;
    this.scene.add(this.cube);

    this.scene.add(new THREE.GridHelper(4, 10));
  }

  _onWindowResize = () => {
    const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  }

  _animate = (delta) => {
    // Rotate cube
    this.cube.rotation.x += 0.07;
    this.cube.rotation.y += 0.04;

    // Render the scene
    this._render();
  }

  _render = () => {
    this.renderer.render(this.scene, this.camera);
  }
}

// Wrap Touches Event Listener
const TouchesComponent = Touches(App);

export default TouchesComponent;