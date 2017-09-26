
import Expo from 'expo';
import React from 'react';
// import { ImageLoader } from 'three/src/loaders/ImageLoader';


THREE.TextureLoader.prototype.load = function (url, onLoad, onProgress, onError) {
    // const loader = new ImageLoader(this.manager);
    // loader.setCrossOrigin(this.crossOrigin);
    // loader.setPath(this.path);

    const texture = new THREE.Texture();
    texture.minFilter = THREE.LinearFilter; // Pass-through non-power-of-two

    if (globalCachedAssetStore.hasOwnProperty(url)) {
        // This should already be downloaded.
        const asset = globalCachedAssetStore[url];
        // console.warn("DG_TEX: Load texture ", url);
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
