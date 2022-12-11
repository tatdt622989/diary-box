import * as THREE from 'three';

export default function rendererCreator(
  quality: number,
  canvas: HTMLCanvasElement,
  isMobile: boolean,
) {
  // console.log(canvas);
  let renderer;
  if (isMobile) {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      precision: 'lowp',
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    return renderer;
  }
  switch (quality) {
    case 1:
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        precision: 'lowp',
        powerPreference: 'low-power',
      });
      break;
    case 2:
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        precision: 'mediump',
        powerPreference: 'default',
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
        antialias: false,
        precision: 'lowp',
        powerPreference: 'low-power',
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      break;
  }
  return renderer as THREE.WebGLRenderer;
}
