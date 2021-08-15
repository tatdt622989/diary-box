import * as THREE from 'three';

export default async function textureLoader(URL: string, model: THREE.Mesh, name: string) {
  console.log('texture load start', URL, model);
  // 將圖片裁切後再縮放到1024*1024
  const img = new Image();
  const frame = document.createElement('canvas');
  const ctx: CanvasRenderingContext2D = frame.getContext('2d')!;
  img.src = URL;
  img.crossOrigin = 'anonymous';
  const res: Event = await new Promise((resolve, reject) => {
    img.addEventListener('load', resolve, false);
    img.addEventListener('error', resolve, false);
  });
  console.log(res);
  if (res.type === 'error') {
    return null;
  }
  let baseSize = 0;
  if (img.width > img.height) {
    baseSize = img.width;
  } else if (img.height > img.width) {
    baseSize = img.height;
  }
  frame.width = baseSize;
  frame.height = baseSize;
  ctx.drawImage(img, frame.width / 2 - img.width / 2, frame.height / 2 - img.height / 2);
  const resFrame = document.createElement('canvas');
  const resCtx: CanvasRenderingContext2D = resFrame.getContext('2d')!;
  resFrame.width = 1024;
  resFrame.height = 1024;
  resCtx.fillStyle = '#fff';
  resCtx.fillRect(0, 0, 1024, 1024);
  resCtx.drawImage(frame, 0, 0, 1024, 1024);
  // 圖片載入材質
  const texture: any = await new Promise<any>((resolve, reject) => {
    new THREE.TextureLoader().load(resFrame.toDataURL(), (t) => {
      resolve(t);
    }, (err) => {
      reject(err);
    });
  });
    // 材質貼入模型
  texture.flipY = false;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  console.log(name);
  switch (name) {
    case 'album':
      texture.repeat.set(0.75, 1);
      break;
    case 'screen':
      texture.repeat.set(1, 0.8);
      break;
    default:
      break;
  }
  const m = model;
  (m.material as THREE.MeshStandardMaterial).color = new THREE.Color('#cacaca');
  (m.material as THREE.MeshStandardMaterial).map = texture;
  return true;
}
