import Expo from 'expo';
import React from 'react';
import { View, StatusBar } from 'react-native';
import ExpoTHREE from 'expo-three';
const OrbitControls = require('three-orbit-controls')(THREE);
import { ImageLoader } from 'three/src/loaders/ImageLoader';

import ThreeView from './ThreeView';
window.DOMParser = require('xmldom').DOMParser;

const _assetStore = {
  "INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Body_D.png": require('./model/INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Body_D.png'),
  "INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Rim_D.png": require('./model/INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Rim_D.png'),
  "INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Tire_D.png": require('./model/INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Tire_D.png'),
};
const cachedAssetStore = {
  "INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Body_D.png": require('./model/INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Body_D.png'),
  "INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Rim_D.png": require('./model/INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Rim_D.png'),
  "INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Tire_D.png": require('./model/INJ_iOS_VEHICLE_Batmobile_Arkham_Knight_Tire_D.png'),
};

import arrayFromObject from './util/arrayFromObject';
import cacheAssetsAsync from './util/cacheAssetsAsync';
const loadAssets = async () => {
  const images = arrayFromObject(_assetStore);
  await cacheAssetsAsync({
    images,
  });

  Object.keys(_assetStore).map(key => {
    cachedAssetStore[key] = Expo.Asset.fromModule(_assetStore[key]);
  });
}

THREE.TextureLoader.prototype.load = function (url, onLoad, onProgress, onError) {
  const loader = new ImageLoader(this.manager);
  loader.setCrossOrigin(this.crossOrigin);
  loader.setPath(this.path);

  const texture = new THREE.Texture();
  texture.minFilter = THREE.LinearFilter; // Pass-through non-power-of-two

  if (cachedAssetStore.hasOwnProperty(url)) {
    // This should already be downloaded.
    const asset = cachedAssetStore[url];
    console.warn("DG_TEX: Load texture ", url);
    (async () => {
      // But try to download anyways...
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
  } else {
    console.warn("DG_TEX: Invalid Texture URL: Not in data store", url);
  }
  return texture
};


const AR = false;

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
  state = { assetsLoaded: false };

  render = () => {
    if (!this.state.assetsLoaded) {
      return (<Expo.AppLoading />);
    }

    return (
      <ThreeView
        style={{ flex: 1 }}
        onContextCreate={this._onContextCreate}
        render={this._animate}
        enableAR={AR}
      />
    );
  }
  async componentWillMount() {
    await loadAssets();

    StatusBar.setHidden(true);
    // Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.LANDSCAPE_LEFT);
    this.setState({ assetsLoaded: true });

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

    if (AR) {
      // AR Background Texture
      this.scene.background = ExpoTHREE.createARBackgroundTexture(arSession, this.renderer);
    } else {
      // Standard Background
      this.scene.background = new THREE.Color(0xcccccc);
      this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
    }




    // camera

    /// AR/VR Camera

    if (AR) {
      this.camera = ExpoTHREE.createARCamera(arSession, width, height, 0.01, 1000);
    } else {
      this.camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 100);
      this.camera.position.z = 5;
      this.camera.lookAt(new THREE.Vector3());
    }


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

    if (!AR) {
      this.controls = new THREE.DeviceOrientationControls(this.camera);

      this.controls = new OrbitControls(this.camera);
      this.controls.addEventListener('change', this._render); // remove when using animation loop

    }

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


    // const loadTexture = res => ExpoTHREE.createTextureAsync({
    //     asset: Expo.Asset.fromModule(res),
    //   });

    // const textureData = [
    //   loadTexture(require('./model/diffuse.png')),
    //   loadTexture(require('./model/normal.png')),
    //   loadTexture(require('./model/specular.png')),
    // ] 
    // const textures = await Promise.all(textureData);

    // const material = new THREE.MeshPhongMaterial({
    //   map: textures[0],
    //   normalMap: textures[1],
    //   specularMap: textures[2]
    // });


    const asset = Expo.Asset.fromModule(require('./model/model.dae'));
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
      // this.avatar.position.y = -1;
      
      // const _scale = 1;
      // this.avatar.scale.set(_scale, _scale, _scale);
      // this.avatar.material = material;

      this.scaleLongestSideToSize(this.avatar, 1);
      
      this.alignMesh(this.avatar, { x: 0.5, y: 1, z: 0.5 });
      
      

      var helper = new THREE.SkeletonHelper(this.avatar);
      helper.material.linewidth = 3;
      this.scene.add(helper);

      console.warn("Model Loaded")
    }, progress => {
      const { type, target, currentTarget, eventPhase, bubbles, cancelable, timeStamp, isTrusted } = progress;
      console.warn("Collada Progress", type, eventPhase, timeStamp, isTrusted);
    }, error => {
      console.error("Collada Error:", error);
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
    this.addGrid({
      meters: 10,
      divisions: 20
    });

    // this.scene.add(new THREE.GridHelper(10, 10 * 3.28084));
  }

  addGrid = ({ meters, divisions }) => {
    if (this.scene && meters && divisions) {
      this.scene.add(new THREE.GridHelper(meters, divisions));
    }
  }

  alignMesh = (mesh, axis = {x: 0.5, y: 0.5, z: 0.5} ) => {
    axis = axis || {};
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.size();
    let {min, max} = box;
    min = {x: -min.x, y: -min.y, z: -min.z};
    const half = {width: size.x / 2, height: size.y / 2, depth: size.z / 2 };

  
    Object.keys(axis).map(key => {
      const scale = axis[key];

      mesh.position[key] = (min[key] - size[key]) + (size[key] * scale);
    })
    
    // mesh.position.set(min.x - half.width, min.y - half.height, min.z - half.depth);

  }

  centerMesh = (mesh) => {
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.size();
    const { x, y, z } = box.min;
    const min = {x: -x, y: -y, z: -z};
    const half = {width: size.x / 2, height: size.y / 2, depth: size.z / 2 };
    mesh.position.set(min.x - half.width, min.y - half.height, min.z - half.depth);
  }

  scaleLongestSideToSize = (mesh, size) => {
    const { x: width, y: height, z: depth } = this.getSize(mesh);
    const longest = Math.max(width, Math.max(height, depth));
    const scale = size / longest;
    mesh.scale.set(scale, scale, scale);
  }

  getSize = (mesh) => {
    const box = new THREE.Box3().setFromObject(mesh);
    console.warn("size", box.min, box.max, box.size());
    return box.size();
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