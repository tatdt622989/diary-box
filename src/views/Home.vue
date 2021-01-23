<template>
  <div class="home">
    <div class="status">
      <div class="currency">
        <span></span>
        <img src="@/assets/images/currency.svg">
      </div>
    </div>
    <ul class="tool-list"></ul>
    <div id="mainScene" ref="mainScene"></div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
} from 'vue';
import * as THREE from 'three';

export default defineComponent({
  name: 'Home',
  components: {
  },
  setup() {
    const mainScene = ref<HTMLElement | null>(null);

    onMounted(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth
      / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      console.log(mainScene);
      if (mainScene.value) {
        // 到這裡mainScene.value就一定不是null就不會報錯
        mainScene.value.appendChild(renderer.domElement);
      }
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      camera.position.z = 5;
      const animate = function () {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    });
    return {
      mainScene,
    };
  },
});
</script>

<style lang="scss">
.home {
  position: relative;
}
.status {
  .currency {
  }
  position: absolute;
}
.tool-list {
  position: absolute;
}
</style>
