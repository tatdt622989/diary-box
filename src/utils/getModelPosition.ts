import * as THREE from 'three';

export default function getModelPosition(
  groups: Array<THREE.Object3D>,
  target: THREE.Object3D,
) {
  const tgtModel = target;
  function setPosition() {
    const targetBox = new THREE.Box3().setFromObject(tgtModel as THREE.Object3D);
    let isOverlap = false;
    groups.forEach((g) => {
      if (target.uuid !== g.uuid) {
        const currentBox = new THREE.Box3().setFromObject(g as THREE.Object3D);
        if (targetBox.intersectsBox(currentBox)) {
          console.log('重疊', g);
          tgtModel.position.setX(tgtModel.position.x + 5);
          isOverlap = true;
        }
      }
    });
    if (isOverlap) {
      setPosition();
    }
  }
  setPosition();
}
