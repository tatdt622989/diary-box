import * as THREE from 'three';

export default function rendererCreator(quality: number, canvas: HTMLCanvasElement) {
  console.log(canvas);
  let renderer;
  switch (quality) {
    case 1:
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        precision: 'mediump',
      });
      break;
    case 2:
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
      });
      break;
    case 3:
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      break;
    default:
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      break;
  }
  return renderer as THREE.WebGLRenderer;
}
