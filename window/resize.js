import { Dimensions, PixelRatio } from 'react-native';
import EventEmitter from 'EventEmitter';
/*
 Window Resize Stub
*/
window.emitter = window.emitter || new EventEmitter();
window.addEventListener = window.addEventListener || ((eventName, listener) => window.emitter.addListener(eventName, listener));
window.removeEventListener = window.removeEventListener || ((eventName, listener) => window.emitter.removeListener(eventName, listener));

let { width, height } = Dimensions.get('window');
window.devicePixelRatio = PixelRatio.get();
window.innerWidth = window.clientWidth = width;
window.innerHeight = window.clientHeight = height;
Dimensions.addEventListener('change', ({ screen: { width, height, scale } }) => {
    window.devicePixelRatio = scale;
    // Not sure if the scale should be applied :/
    window.innerWidth = window.clientWidth = width;
    window.innerHeight = window.clientHeight = height;
    window.emitter.emit('resize');
})
