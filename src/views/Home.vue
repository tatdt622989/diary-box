<template>
  <div class="main-wrap home-wrap">
    <div class="status">
      <div class="currency">
        <span>999</span>
        <img src="@/assets/images/currency.svg" />
      </div>
    </div>
    <ul class="tool-list">
      <li>
        <button @click="menuToggler">
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
    <FunctionBar :mode="'home'"></FunctionBar>
    <Menu></Menu>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
} from 'vue';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useStore } from 'vuex';
import FunctionBar from '@/components/FunctionBar.vue';
import Menu from '@/components/Menu.vue';

export default defineComponent({
  name: 'Home',
  components: {
    FunctionBar,
    Menu,
  },
  setup() {
    const store = useStore();

    const mainScene = ref<HTMLElement | null>(null);
    const publicPath = ref(process.env.BASE_URL);

    // interface sceneParameter {
    // }

    onMounted(() => {
      const datGui = new dat.GUI();
      const renderer = new THREE.WebGLRenderer();
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight - 66);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x449966);
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / (window.innerHeight - 66),
        0.1,
        10000,
      );
      camera.position.set(20, 15, -10);

      let controls: OrbitControls;

      if (mainScene.value) {
        // 到這裡mainScene.value就一定不是null就不會報錯
        mainScene.value.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, mainScene.value);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
      }

      function render() {
        requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, camera);
      }

      // 地板
      const planeGeometry = new THREE.PlaneGeometry(50, 50, 32);
      const planeMaterial = new THREE.MeshStandardMaterial(
        { color: 0x449966, side: THREE.DoubleSide },
      );
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotateX(Math.PI / 2);
      plane.receiveShadow = true;
      scene.add(plane);

      camera.position.z = 5;

      // 燈光
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(10, 10, 1);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      directionalLight.shadow.mapSize.width = 512;
      directionalLight.shadow.mapSize.height = 512;
      directionalLight.shadow.camera.near = 0.1;
      directionalLight.shadow.camera.far = 10000;
      const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
      scene.add(directionalLightHelper);

      const loader = new THREE.ObjectLoader();
      loader.load(
        `${publicPath.value}model/can.json`,
        (gltf) => {
          const can = gltf;
          console.log(can);
          scene.add(can);
          directionalLight.target = can;
          can.castShadow = true;
          can.receiveShadow = false;
          const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
          scene.add(helper);
          render();
        },
        (xhr) => {
          console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
          console.log('An error happened');
        },
      );

      function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight - 66);
        camera.aspect = window.innerWidth / (window.innerHeight - 66);
        camera.updateProjectionMatrix();
      }

      window.addEventListener('resize', resize, false);
    });
    return {
      mainScene,
      isMenuOpen: computed(() => store.state.isMenuOpen),
      menuToggler: () => store.commit('menuToggler', true),
    };
  },
});
</script>

<style lang="scss">
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
    &:hover, &:active {
      background-color: #F0E0B9;
    }
    span {
      color: $primary;
      font-size: 36px;
      line-height: 52px;
    }
    img, span {
      display: inline-block;
    }
    align-items: center;
    background-color: $secondary;
    border-radius: 999px;
    border: 0;
    display: flex;
    height: 52px;
    justify-content: center;
    margin-bottom: 12px;
    text-align: center;
    transition: $t-base;
    width: 52px;
  }
  position: absolute;
  top: 24px;
  right: 16px;
  display: block;
  flex-direction: column;
}
.info {
  .info-list {
    li {
      font-size: 16px;
      font-weight: bold;
    }
    margin: 0;
    padding: 0 16px;
  }
  .toggler-btn {
    span {
      color: $primary;
      font-size: 36px;
    }
    background-color: $secondary;
    border-radius: 0 20px 20px 0;
    height: inherit;
  }
  background-color: rgba(248, 235, 207, .75);
  border-radius: 0 20px 20px 0;
  display: flex;
  align-items: center;
  position: absolute;
  left: 0;
  bottom: 86px;
  min-height: 97px;
  height: 97px;
  justify-content: space-between;
}
</style>
