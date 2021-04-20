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
        <button @click="openModal">
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
    <FunctionBar :mode="'home'" @create-note="createNote"></FunctionBar>
    <Menu></Menu>
    <div
      class="modal fade"
      id="screenShotModal"
      tabindex="-1"
      aria-labelledby="screenShotModalLabel"
      aria-hidden="true"
      ref="screenShotModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="screenShotModalLabel">畫面截圖</h5>
            <button
              type="button"
              class="btn btn-circle close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="img-frame"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary">分享</button>
            <button type="button" class="btn btn-primary">下載</button>
          </div>
        </div>
      </div>
    </div>
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
import { Modal } from 'bootstrap';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import FunctionBar from '@/components/FunctionBar.vue';
import Menu from '@/components/Menu.vue';
import { Model, Note } from '@/types';

export default defineComponent({
  name: 'Home',
  components: {
    FunctionBar,
    Menu,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const mainScene = ref<HTMLElement | null>(null);
    const screenShotModal = ref<HTMLElement | null>(null);
    const publicPath = ref(process.env.BASE_URL);
    const datGui = ref(new dat.GUI());
    const noteData = ref(null);
    const useModels = ref<Array<Model> | null>(null);
    const targetNote = ref<Note | null>(null);

    const gui = {
      camera: {
        pos: {
          x: 20,
          y: 15,
          z: -10,
        },
      },
      dLight: {
        pos: {
          x: 10,
          y: 15,
          z: 1,
        },
      },
    };

    function datGuiInit() {
      const dLightFolder = datGui.value.addFolder('dLight');
      dLightFolder.add(gui.dLight.pos, 'x', 0, 50);
      dLightFolder.add(gui.dLight.pos, 'y', 0, 50);
      dLightFolder.add(gui.dLight.pos, 'z', 0, 50);
      const camera = datGui.value.addFolder('camera');
      camera.add(gui.camera.pos, 'x', -20, 50);
      camera.add(gui.camera.pos, 'y', -20, 50);
      camera.add(gui.camera.pos, 'z', -20, 50);
    }

    onMounted(() => {
      const ts = Date.now();
      useModels.value = [
        {
          name: 'can',
          id: String(ts),
          position: {
            x: 0,
            y: 5.6,
            z: 0,
          },
        },
      ];
      // datGuiInit();
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight - 66);
      // const composer = new EffectComposer(renderer);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x449966);

      // 相機
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / (window.innerHeight - 66),
        0.1,
        10000,
      );
      camera.position.set(30, 10, 0);
      camera.zoom = 1;

      // 控制器
      let controls: OrbitControls;
      if (mainScene.value) {
        // 到這裡mainScene.value就一定不是null就不會報錯
        mainScene.value.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, mainScene.value);
        controls.target = new THREE.Vector3(0, 5, 0);
        controls.dampingFactor = 0.05;
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI / 2.5;
      }

      // 地板
      const planeGeometry = new THREE.PlaneGeometry(250, 250, 32);
      const planeMaterial = new THREE.MeshStandardMaterial(
        { color: 0x449966, side: THREE.DoubleSide },
      );
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotateX(Math.PI / 2);
      plane.receiveShadow = true;
      scene.add(plane);

      // 燈光
      const ambientLight = new THREE.AmbientLight(0xF0C98E, 0.9);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(100, 250, 0);
      directionalLight.castShadow = true;
      directionalLight.shadow.radius = 20;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.camera.near = 1.75;
      directionalLight.shadow.camera.far = 1000;
      scene.add(directionalLight);
      const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
      scene.add(directionalLightHelper);

      // 霧
      scene.fog = new THREE.Fog(0x449966, 1, 150);

      function render() {
        controls.update();
        // camera.position.set(gui.camera.pos.x, gui.camera.pos.y, gui.camera.pos.z);
        // directionalLight.position.set(gui.dLight.pos.x, gui.dLight.pos.y, gui.dLight.pos.z);
        requestAnimationFrame(render);
        renderer.render(scene, camera);
      }

      const loader = new THREE.ObjectLoader();

      const modelLen = useModels.value.length;
      let i = 0;
      while (i < modelLen) {
        const model = useModels.value[i];
        loader.load(
          `${publicPath.value}model/${model.name}.json`,
          (gltf) => {
            const can = gltf;
            console.log(can);
            scene.add(can);
            directionalLight.target = can;
            can.castShadow = true;
            can.position.set(model.position.x, model.position.y, model.position.z);
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
        i += 1;
      }

      function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight - 66);
        camera.aspect = window.innerWidth / (window.innerHeight - 66);
        camera.updateProjectionMatrix();
      }

      window.addEventListener('resize', resize, false);
    });

    function loadNote() {
      if (localStorage.getItem('note-data')) {
        noteData.value = JSON.parse(localStorage.getItem('note-data') || '[]');
      }
    }

    function openModal() {
      console.log(screenShotModal.value);
      if (screenShotModal.value) {
        const modal = new Modal(screenShotModal.value);
        modal.show();
      }
    }

    function createNote() {
      const ts = Date.now();
      router.push({
        name: 'TextEditor',
        params: { status: 'note-add', id: ts },
      });
    }

    return {
      mainScene,
      screenShotModal,
      useModels,
      isMenuOpen: computed(() => store.state.isMenuOpen),
      openModal,
      createNote,
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
    &:hover,
    &:active {
      background-color: #f0e0b9;
    }
    span {
      color: $primary;
      font-size: 36px;
      line-height: 52px;
    }
    img,
    span {
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
      &:last-child {
        padding: 0;
      }
      line-height: 19px;
      padding-bottom: 8px;
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
  background-color: rgba(248, 235, 207, 0.75);
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
#screenShotModal {
  .modal-content {
    background: $secondary;
    border-radius: 20px;
  }
  .modal-header {
    h5 {
      color: $primary;
      font-weight: bold;
      font-size: 20px;
    }
    .close {
      span {
        color: $primary;
        font-size: 36px;
        padding: 0;
        line-height: 36px;
      }
      background: $secondary;
      border: 0;
      height: 52px;
      padding: 8px;
      position: relative;
      right: -8px;
      width: 52px;
    }
    border: 0;
    height: 69px;
    position: relative;
  }
  .modal-body {
    .img-frame {
      background-color: #c4c4c4;
      height: 338px;
      width: 100%;
    }
    padding-top: 0;
    padding-bottom: 0;
  }
  .modal-footer {
    button {
      border-radius: 999px;
      color: $secondary;
      font-size: 20px;
      font-weight: bold;
      height: 52px;
      width: 150px;
    }
    border: 0;
    justify-content: space-between;
  }
}
</style>
