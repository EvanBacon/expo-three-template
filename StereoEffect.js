export default function (renderer) {

    const _stereo = new THREE.StereoCamera();
    _stereo.aspect = 0.5;

    this.setEyeSeparation = function (eyeSep) {

        _stereo.eyeSep = eyeSep;

    };

    this.setSize = function (width, height) {

        renderer.setSize(width, height);

    };

    this.render = function (scene, camera, gl) {

        scene.updateMatrixWorld();

        if (camera.parent === null) { camera.updateMatrixWorld(); }

        _stereo.update(camera);
        renderer.render(scene, camera);

        const size = renderer.getSize();

        if (renderer.autoClear) { renderer.clear(); }
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