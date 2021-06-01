import THREE from "three";

export default function getModelPostion(target: THREE.Object3D, data: Array<THREE.Object3D>) {
  const targetUuid = target.uuid;
  const targetBox = new THREE.Box3().setFromObject(target);
  let targetPosition = {
    x: 0,
    y: 0,
    z: 0,
  };
  getPosition();
  function getPosition() {
    data.forEach((group) => {
      if (targetUuid !== group.uuid) {
        const box = new THREE.Box3().setFromObject(target);
        if (targetBox.intersectsBox(box)) {
          targetPosition.x += 3;
          getPosition();
        }
      }
    })
  }
  return targetPosition;
}