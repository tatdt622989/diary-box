import * as THREE from 'three';

export default function getModelPostion(groups: Array<THREE.Object3D>) {
  function setPos(tgt: THREE.Object3D, current: THREE.Object3D) {
    const tgtBox = new THREE.Box3().setFromObject(tgt);
    const currentBox = new THREE.Box3().setFromObject(current);
    if (tgtBox.intersectsBox(currentBox)) {
      console.log('重疊', tgt, current);
      const offset = tgt.position.x + 3;
      tgt.position.setX(offset);
      setPos(tgt, current);
    }
  }
  const len = groups.length;
  let i = 0;
  while (i < len) {
    console.log(groups[i]);
    let n = 0;
    while (n < len) {
      console.log(i, n);
      if (i !== n) {
        setPos(groups[i], groups[n]);
      }
      n += 1;
    }
    i += 1;
  }
}
