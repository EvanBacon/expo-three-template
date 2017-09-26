import Expo from 'expo';
import React from 'react';
import { View, StatusBar } from 'react-native';
import ExpoTHREE from 'expo-three';
const OrbitControls = require('three-orbit-controls')(THREE);
import { ImageLoader } from 'three/src/loaders/ImageLoader';

import ThreeView from './ThreeView';

window.DOMParser = require('xmldom').DOMParser;


THREE.TextureLoader.prototype.load = function (url, onLoad, onProgress, onError) {

  var loader = new ImageLoader(this.manager);
  loader.setCrossOrigin(this.crossOrigin);
  loader.setPath(this.path);

  const texture = new THREE.Texture();


  texture.minFilter = THREE.LinearFilter; // Pass-through non-power-of-two

  (async () => {
    const asset = Expo.Asset.fromModule(require("./INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Body_D.png"));

    // const asset = Expo.Asset.fromModule(require("../assets/models/stormtrooper/Stormtrooper_D.jpg"));
    if (!asset.localUri) {
      await asset.downloadAsync();
    }
    texture.image = {
      data: asset,
      width: asset.width,
      height: asset.height,
    };
    texture.needsUpdate = true;
    texture.isDataTexture = true; // Forces passing to `gl.texImage2D(...)` verbatim

    if (onLoad !== undefined) {
      onLoad(texture);
    }
  })();

  return texture
};


import './Three';
import './window/domElement';
import './window/resize';
import Touches from './window/Touches';
import DeviceMotion from './window/Touches';


const StereoEffect = function (renderer) {

  var _stereo = new THREE.StereoCamera();
  _stereo.aspect = 0.5;

  this.setEyeSeparation = function (eyeSep) {

    _stereo.eyeSep = eyeSep;

  };

  this.setSize = function (width, height) {

    renderer.setSize(width, height);

  };

  this.render = function (scene, camera, gl) {

    scene.updateMatrixWorld();

    if (camera.parent === null) camera.updateMatrixWorld();

    _stereo.update(camera);
    renderer.render(scene, camera);

    var size = renderer.getSize();

    if (renderer.autoClear) renderer.clear();
    renderer.setScissorTest(true);

    renderer.setScissor(0, 0, size.width / 2, size.height);
    renderer.setViewport(0, 0, size.width / 2, size.height);
    renderer.render(scene, _stereo.cameraL);

    renderer.setScissor(size.width / 2, 0, size.width / 2, size.height);
    renderer.setViewport(size.width / 2, 0, size.width / 2, size.height);
    renderer.render(scene, _stereo.cameraR);

    renderer.setScissorTest(false);

  };

};

class App extends React.Component {
  render = () => (
    <ThreeView
      style={{ flex: 1 }}
      onContextCreate={this._onContextCreate}
      render={this._animate}
      enableAR={true}
    />
  );

  componentWillMount() {
    StatusBar.setHidden(true);
    // Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.LANDSCAPE_LEFT);
  }
  _onContextCreate = async (gl, arSession) => {

    const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

    // renderer

    this.renderer = ExpoTHREE.createRenderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 1.0);
    // this.renderer.gammaInput = true;
    // this.renderer.gammaOutput = true;
    // this.renderer.shadowMap.enabled = true;
    // this.effect = new StereoEffect(this.renderer);

    // scene

    this.scene = new THREE.Scene();

    // AR Background Texture
    this.scene.background = ExpoTHREE.createARBackgroundTexture(arSession, this.renderer);

    // Standard Background
    // this.scene.background = new THREE.Color(0xcccccc);
    // this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    // camera

    /// AR/VR Camera
    this.camera = ExpoTHREE.createARCamera(arSession, width, height, 0.01, 1000);

    // this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    // this.camera.position.z = 5;

    // this.camera.lookAt(new THREE.Vector3());

    // const crosshair = new THREE.Mesh(
    //   new THREE.RingGeometry( 0.02, 0.04, 32 ),
    //   new THREE.MeshBasicMaterial( {
    //     color: 0xffffff,
    //     opacity: 0.5,
    //     transparent: true
    //   } )
    // );
    // crosshair.position.z = - 2;
    // this.camera.add( crosshair );

    // controls

    // VR Controls
    // this.controls = new THREE.DeviceOrientationControls(this.camera);

    // this.controls = new OrbitControls(this.camera);
    // this.controls.addEventListener('change', this._render); // remove when using animation loop

    // lights



    this.scene.add(new THREE.AmbientLight(0x666666, .8));

    let light = new THREE.DirectionalLight(0xdfebff, 1.75);
    light.position.set(2, 3, 0.05);
    // light.castShadow = true;
    // light.shadow.mapSize.width = 1024 * 2;
    // light.shadow.mapSize.height = 1024 * 2;

    // var d = 15;
    // var v = 6;
    // light.shadow.camera.left = - d;
    // light.shadow.camera.right = 9;
    // light.shadow.camera.top = v;
    // light.shadow.camera.bottom = -v;
    // light.shadow.camera.far = 100;
    // light.shadow.bias = 0.0001;

    this.scene.add(light);


    // resize listener

    window.addEventListener('resize', this._onWindowResize, false);

    // setup custom world

    await this._setupWorld();
  }

  _setupWorld = async () => {

    // Rotating cube

    // this.cube = new THREE.Mesh(
    //   new THREE.BoxGeometry(0.07, 0.07, 0.07),
    //   new THREE.MeshBasicMaterial({
    //     map: await ExpoTHREE.createTextureAsync({
    //       asset: Expo.Asset.fromModule(require('./assets/icons/app-icon.png')),
    //     }),
    //   })
    // );
    // this.cube.position.z = -0.4;
    // // this.scene.add(this.cube);


    // // Random Items

    // const geometry = new THREE.CylinderGeometry(0, 0.07, 0.03, 4, 1);
    // const material = new THREE.MeshPhongMaterial({ color: 0xff00ff, flatShading: true });

    // for (var i = 0; i < 100; i++) {
    //   const scalar = 2;
    //   const mesh = new THREE.Mesh(geometry, material);
    //   mesh.position.x = ((Math.random() - 0.5) * scalar)
    //   mesh.position.y = ((Math.random() - 0.5) * scalar)
    //   mesh.position.z = ((Math.random() - 0.5) * scalar)

    //   // mesh.position.x = (Math.random() - 0.5) * scalar;
    //   // mesh.position.y = (Math.random() - 0.5) * scalar;
    //   // mesh.position.z = (Math.random() - 0.5) * scalar;
    //   mesh.updateMatrix();
    //   mesh.matrixAutoUpdate = false;
    //   this.scene.add(mesh);
    // }


    const asset = Expo.Asset.fromModule(require('./batmobile.dae'));
    if (!asset.localUri) {
      await asset.downloadAsync();
    }

    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    // loader.setCrossOrigin('assets/models/stormtrooper/');
    loader.load(asset.localUri, (collada) => {
      // const animations = collada.animations;
      this.avatar = collada.scene;
      // this.mixer = new THREE.AnimationMixer(avatar);
      // const action = this.mixer.clipAction(animations[0]).play();
      this.scene.add(this.avatar);
      this.avatar.position.y = -1;
      const _scale = 0.25;
      this.avatar.scale.set(_scale, _scale, _scale);
      // var helper = new THREE.SkeletonHelper( avatar );
      // helper.material.linewidth = 3;
      // this.scene.add( helper );

    });
    window.document.addEventListener('touchstart', (e) => {

      // if (e.touches.length > 1) {
      //   if (this.avatar) {
      //     // avatar.lookAt(this.camera);
      //     this.avatar.rotation.y += Math.PI / 8
      //   }
        
      // } else {
      //   this.moving = !this.moving;
      // }

    });

    // const scale = 0.008;
    // const loader = new THREE.OBJLoader();
    // let _model;
    // try {


    //   _model = await new Promise((resolve, reject) =>
    //     loader.load(
    //       Expo.Asset.fromModule(require('./Test.obj')).uri,
    //       resolve,
    //       () => { },
    //       reject)
    //   );
    //   _model.scale.set(scale,scale,scale)

    // } catch (error) {
    //   console.error(error);
    // }


    // const _texture = await ExpoTHREE.createTextureAsync({
    //   asset: Expo.Asset.fromModule(require('./1pm1.jpg')),
    // });
    // const castShadow = true;
    // const receiveShadow = false;

    //     _model.traverse(child => {
    //       if (child instanceof THREE.Mesh) {
    //         // console.warn("m", child);
    //         child.material.map = _texture;
    //         child.castShadow = castShadow;
    //         child.receiveShadow = receiveShadow;
    //       }
    //     });
    //     // _model.scale.set(10, 10, 10)

    //     _model.castShadow = castShadow;
    //     _model.receiveShadow = receiveShadow;

    // this.scene.add(_model);
    // _model.position.x = 1;

    // const material = new THREE.MeshLambertMaterial({ map: _texture });
    // material.opacity = 0;
    // const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 3500), material);
    // floor.rotation.x = Math.PI * 1.5;
    // floor.receiveShadow = true;
    // // this.scene.add(floor);
    // this.scene.add(_model);

    // this.scene.add(new THREE.GridHelper(10, 10 * 3.28084));
  }

  getWidth = (mesh) => {
    var box = new THREE.Box3().setFromObject(mesh);
    // console.log( box.min, box.max, box.size() );
    return box.size().width;
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
    // this.cube.rotation.x += 0.07;
    // this.cube.rotation.y += 0.04;
    // this.controls.update()
    // Render the scene

    if (this.moving) {
      this.avatar.position.y += Math.sin(delta * 0.5) - 2;
    }
    this._render();
  }

  _render = () => {
    const { scene, camera, renderer, effect } = this;
    renderer.render(scene, camera);
    // effect.render(scene, camera);
  }
}

// Wrap Touches Event Listener
const TouchesComponent = Touches(App);

// Wrap Device Motion for VR use
// const DeviceMotionComponent = DeviceMotion(TouchesComponent);
export default TouchesComponent;