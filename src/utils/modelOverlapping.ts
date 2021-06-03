import * as THREE from 'three';

export default function modelOverlapping(groups: Array<THREE.Object3D>) {
  const len = groups.length;
  const overlapping: Array<Array<THREE.Object3D>> = [];
  for (let i = 0; i < len; i += 1) {
    for (let n = 0; n < i + 1; n += 1) {
      const box1 = new THREE.Box3().setFromObject(groups[i]);
      const box2 = new THREE.Box3().setFromObject(groups[n]);
      if (box1.intersectsBox(box2) && groups[i] !== groups[n]) {
        overlapping.push([groups[i], groups[n]]);
      }
    }
  }
  return overlapping;
}
