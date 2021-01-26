<template>
  <div class="home">
    <div class="status">
      <div class="currency">
        <span>999</span>
        <img src="@/assets/images/currency.svg" />
      </div>
    </div>
    <ul class="tool-list">
      <li>
        <button>
          <span class="material-icons">menu</span>
        </button>
      </li>
      <li>
        <button>
          <span class="material-icons">fullscreen</span>
        </button>
      </li>
      <li>
        <button>
          <img src="@/assets/images/screen-shot.svg" alt="截圖圖示" />
        </button>
      </li>
      <li>
        <button>
          <img src="@/assets/images/single-model.svg" alt="單模型顯示圖示" />
        </button>
      </li>
      <li>
        <button>
          <img src="@/assets/images/all-model.svg" alt="全部模型顯示圖示" />
        </button>
      </li>
      <li>
        <button>
          <span class="material-icons">center_focus_strong</span>
        </button>
      </li>
    </ul>
    <div class="info">
      <ul class="info-list">
        <li>最近筆記：<span></span></li>
        <li>建立時間：<span></span></li>
        <li>修改時間：<span></span></li>
      </ul>
      <button class="toggler-btn">
        <span class="material-icons">chevron_left</span>
      </button>
    </div>
    <div id="mainScene" ref="mainScene"></div>
    <FunctionBar></FunctionBar>
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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import FunctionBar from '@/components/FunctionBar.vue';

export default defineComponent({
  name: 'Home',
  components: {
    FunctionBar,
  },
  setup() {
    const mainScene = ref<HTMLElement | null>(null);
    const publicPath = ref(process.env.BASE_URL);

    onMounted(() => {
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight - 66);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x449966);
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / (window.innerHeight - 66),
        0.1,
        1000,
      );
      let controls;
      if (mainScene.value) {
        // 到這裡mainScene.value就一定不是null就不會報錯
        mainScene.value.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, mainScene.value);
      }

      const loader = new GLTFLoader();

      loader.load(
        `${publicPath.value}model/can.gltf`,
        (gltf) => {
          console.log(gltf);
          scene.add(gltf.scene);
        },
        (xhr) => {
          console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
          console.log('An error happened');
        },
      );

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      // 地板
      const planeGeometry = new THREE.PlaneGeometry(50, 50, 32);
      const planeMaterial = new THREE.MeshBasicMaterial(
        { color: 0x449966, side: THREE.DoubleSide },
      );
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotateX(Math.PI / 2);
      scene.add(plane);

      camera.position.z = 5;

      function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight - 66);
        camera.aspect = window.innerWidth / (window.innerHeight - 66);
        camera.updateProjectionMatrix();
      }

      window.addEventListener('resize', resize, false);

      function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      }
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
    span {
      color: $primary;
      font-size: 24px;
      font-weight: bold;
      flex-grow: 1;
    }
    img {
      margin: 0 12px;
    }
    height: 52px;
    width: 152px;
    border-radius: 999px;
    background-color: $secondary;
    display: flex;
    align-items: center;
  }
  position: absolute;
  left: 16px;
  top: 24px;
}
.tool-list {
  li button {
    span {
      color: $primary;
      font-size: 36px;
      line-height: 52px;
    }
    border: 0;
    height: 52px;
    width: 52px;
    border-radius: 999px;
    background-color: $secondary;
    margin-bottom: 12px;
  }
  position: absolute;
  top: 24px;
  right: 16px;
  display: block;
  flex-direction: column;
  list-style: none;
}
.info {
  .info-list {
    list-style: none;
  }
  .toggler-btn {
    span {
      color: $primary;
      font-size: 36px;
    }
    background-color: $secondary;
    border-radius: 0 20px 20px 0;
  }
  background-color: rgba(248, 235, 207, .75);
  border-radius: 0 20px 20px 0;
  display: flex;
  position: absolute;
  left: 0;
  bottom: 86px;
  min-height: 97px;
}
</style>
