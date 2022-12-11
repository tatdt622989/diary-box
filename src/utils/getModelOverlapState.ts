import * as THREE from 'three';

export default function getModelOverlapState(
  groups: Array<THREE.Object3D>,
  target: THREE.Object3D,
  uuid: string,
) {
  const targetBox = new THREE.Box3().setFromObject(target as THREE.Object3D);
  let isOverlap = false;
  if (groups) {
    // console.log(groups, uuid);
    groups.forEach((g) => {
      if (uuid !== g.uuid) {
        // console.log(g, '其他模型');
        const currentBox = new THREE.Box3().setFromObject(g as THREE.Object3D);
        if (targetBox.intersectsBox(currentBox)) {
          // console.log('重疊');
          isOverlap = true;
        }
      }
    });
  }
  // console.log(isOverlap);
  return isOverlap;
}
