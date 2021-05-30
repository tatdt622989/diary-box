<template>
  <div class="main-wrap home-wrap">
    <div class="status">
      <div class="currency">
        <span>{{
          store.state.userData.pointInfo.balance
        }}</span>
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
        <button @click="enterFullScreen">
          <span class="material-icons">fullscreen</span>
        </button>
      </li>
      <li>
        <button @click="openModal">
          <span class="material-icons">photo_camera</span>
        </button>
      </li>
      <li>
        <button>
          <span class="material-icons">center_focus_strong</span>
        </button>
      </li>
      <li>
        <button @click="$router.push('/scene-editor')">
          <span class="material-icons">edit</span>
        </button>
      </li>
    </ul>
    <canvas id="mainScene" ref="mainScene"></canvas>
    <div class="note-wrap" :class="{ active: isNoteOpen }">
      <div class="content">
        <div class="d-flex justify-content-end">
          <button class="btn btn-circle close-btn" @click="isNoteOpen = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <p class="date">{{ lastestNoteDate }}</p>
        <div
          v-html="selectLastestNodeData.content"
          v-if="selectLastestNodeData"
        ></div>
      </div>
      <button class="toggler" @click="isNoteOpen = !isNoteOpen">
        近期日記
      </button>
    </div>
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
            <div class="img-frame" id="screenShotFrame">
              <img :src="img" alt="截圖" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="shareImg">
              分享
            </button>
            <button type="button" class="btn btn-primary" @click="downloadImg">
              下載
            </button>
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
  watch,
  onUnmounted,
} from 'vue';
import { Modal } from 'bootstrap';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import FunctionBar from '@/components/FunctionBar.vue';
import Menu from '@/components/Menu.vue';
import { Model, Note } from '@/types';
import { Geometry, Object3D } from 'three';
import screenfull from 'screenfull/dist/screenfull';

export default defineComponent({
  name: 'Home',
  components: {
    FunctionBar,
    Menu,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    let canvas: HTMLCanvasElement;
    const screenShotModal = ref<HTMLElement | null>(null);
    const publicPath = ref(process.env.BASE_URL);
    // const datGui = ref(new dat.GUI());
    const modelData = ref<Array<Model>>(store.state.userData
      ? store.state.userData.modelData : [store.state.defaultModelData]);
    const isNoteOpen = ref<boolean>(false);
    const lastestNoteData = ref<Array<Note>>([]);
    const selectLastestNodeData = ref<Note | null>(null);
    const img = ref('');
    const noteData = computed(() => store.state.userData.noteData);
    const userData = computed(() => store.state.userData);
    let renderer: THREE.WebGLRenderer | null;
    const scene = new THREE.Scene();
    let controls: MapControls;
    let animation: number;
    let takeScreenShot = false;
    let base64: string | null;

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
      // const dLightFolder = datGui.value.addFolder('dLight');
      // dLightFolder.add(gui.dLight.pos, 'x', 0, 50);
      // dLightFolder.add(gui.dLight.pos, 'y', 0, 50);
      // dLightFolder.add(gui.dLight.pos, 'z', 0, 50);
      // const camera = datGui.value.addFolder('camera');
      // camera.add(gui.camera.pos, 'x', -20, 50);
      // camera.add(gui.camera.pos, 'y', -20, 50);
      // camera.add(gui.camera.pos, 'z', -20, 50);
    }

    function getNote() {
      console.log(noteData.value, 'get note');
      if (noteData.value.length > 0) {
        const lastestDayTime = noteData.value[noteData.value.length - 1].id
          - (noteData.value[noteData.value.length - 1].id % 100000);
        console.log(lastestDayTime);
        let i = 0;
        while (i < noteData.value.length) {
          if (noteData.value[i].id > lastestDayTime) {
            lastestNoteData.value.splice(0, 0, noteData.value[i]);
          }
          i += 1;
        }
        [selectLastestNodeData.value] = lastestNoteData.value;
      }
    }

    watch(
      noteData,
      (newVal, oldVal) => {
        getNote();
      },
    );

    onMounted(() => {
      canvas = document.getElementById('mainScene') as HTMLCanvasElement;
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        canvas,
      });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.BasicShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight - 66);

      // const composer = new EffectComposer(renderer);
      scene.background = new THREE.Color(0x449966);

      // 相機
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / (window.innerHeight - 66),
        0.1,
        10000,
      );
      camera.position.set(20, 10, 0);
      camera.zoom = 1;

      // 控制器
      controls = new MapControls(camera, canvas);
      controls.target = new THREE.Vector3(0, 5, 0);
      controls.dampingFactor = 0.1;
      controls.enableDamping = true;
      controls.screenSpacePanning = false;
      controls.minDistance = 10;
      controls.maxDistance = 500;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI / 2.5;

      // 地板
      const planeGeometry = new THREE.PlaneGeometry(250, 250, 32);
      const planeMaterial = new THREE.MeshStandardMaterial(
        { color: 0x2F6F48, side: THREE.DoubleSide },
      );
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotateX(Math.PI / 2);
      plane.receiveShadow = true;
      scene.add(plane);

      // 燈光
      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xF8EBCF, 0.6, 10000);
      pointLight.position.set(15, 27, 7);
      pointLight.castShadow = true;
      pointLight.shadow.radius = 2;
      pointLight.shadow.mapSize.width = 2048;
      pointLight.shadow.mapSize.height = 2048;
      pointLight.shadow.camera.near = 1;
      pointLight.shadow.camera.far = 10000;
      const directionalLight = new THREE.DirectionalLight(0xF8EBCF, 0.6);
      directionalLight.position.set(-10, 20, 0);
      scene.add(pointLight);
      scene.add(directionalLight);
      const pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
      scene.add(pointLightHelper);

      // 霧
      scene.fog = new THREE.Fog(0x449966, 1, 150);

      function render() {
        controls.update();
        camera.updateProjectionMatrix();
        // camera.position.set(gui.camera.pos.x, gui.camera.pos.y, gui.camera.pos.z);
        // pointLight.position.set(gui.dLight.pos.x, gui.dLight.pos.y, gui.dLight.pos.z);
        animation = requestAnimationFrame(render);
        if (renderer) {
          renderer.render(scene, camera);
          if (takeScreenShot) {
            takeScreenShot = false;
            base64 = renderer.domElement.toDataURL('image/jpeg', 1.0);
          }
        }
      }

      const loader = new GLTFLoader();

      const modelLen = modelData.value.length;
      let i = 0;
      while (i < modelLen) {
        const data = modelData.value[i];
        loader.load(
          `${publicPath.value}model/${data.name}.gltf`,
          (gltf) => {
            const model = gltf.scene;
            model.traverse((object) => {
              if (object instanceof THREE.Mesh) {
                const mesh = object;
                mesh.castShadow = true;
              }
            });
            console.log(model);
            model.castShadow = true;
            model.position.set(model.position.x, model.position.y, model.position.z);
            model.receiveShadow = false;
            scene.add(model);
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
        if (renderer) {
          renderer.setSize(window.innerWidth, window.innerHeight - 66);
          camera.aspect = window.innerWidth / (window.innerHeight - 66);
          camera.updateProjectionMatrix();
        }
      }

      window.addEventListener('resize', resize, false);
    });

    onUnmounted(() => {
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          obj.material.dispose();
        }
      });
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      if (animation) {
        cancelAnimationFrame(animation);
      }
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer = null;
      }
    });

    function screenShot() {
      takeScreenShot = true;
      console.log(base64);
      base64 = null;
      setTimeout(() => {
        if (base64) {
          img.value = base64;
        }
      }, 100);
    }

    function openModal() {
      console.log(screenShotModal.value);
      if (screenShotModal.value) {
        screenShot();
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

    function downloadImg() {
      const link = document.createElement('a');
      const ts = Date.now();
      if (base64) {
        link.download = `screenshot-${ts}`;
        link.href = base64;
        link.click();
      }
    }

    function shareImg() {
      // if (base64) {
      //   window.navigator.share(base64);
      // }
    }

    function enterFullScreen() {
      if (screenfull.isEnabled) {
        screenfull.request(canvas);
      }
    }

    return {
      store,
      screenShotModal,
      isMenuOpen: computed(() => store.state.isMenuOpen),
      lastestNoteDate: computed(() => {
        const len = noteData.value.length;
        const date = len > 0
          ? new Date(Number(noteData.value[len - 1].id)) : null;
        if (date) {
          return `${date.getFullYear()} - ${date.getMonth() + 1} - ${date.getDate()}`;
        }
        return '';
      }),
      selectLastestNodeData,
      openModal,
      createNote,
      isNoteOpen,
      downloadImg,
      shareImg,
      userData,
      menuToggler: () => store.commit('menuToggler', true),
      img,
      enterFullScreen,
    };
  },
});
</script>

<style lang="scss" socped>
.home-wrap {
  display: flex;
  flex-direction: column;
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
  .modal-body {
    .img-frame {
      img {
        object-fit: cover;
        height: 100%;
        width: 100%;
      }
      background-color: #c4c4c4;
      height: 338px;
      width: 100%;
      overflow: hidden;
    }
    padding-top: 0;
    padding-bottom: 0;
  }
}
.note-wrap {
  .toggler {
    align-items: center;
    background-color: $secondary;
    border-radius: 0 20px 20px 0;
    color: $primary;
    display: flex;
    flex-shrink: 0;
    font-size: 20px;
    font-weight: bold;
    height: 135px;
    justify-content: center;
    line-height: 24px;
    user-select: none;
    width: 44px;
    writing-mode: vertical-lr;
    margin-right: -44px;
  }
  .content {
    > div {
      width: 100%;
    }
    .date {
      font-size: 28px;
      font-weight: bold;
      color: $primary;
      border: 2px solid $primary;
      padding: 0 20px;
    }
    align-items: center;
    background-color: $secondary;
    border-left: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  &.active {
    left: 0;
  }
  align-items: center;
  display: flex;
  height: 100%;
  left: -100%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: $t-base;
  width: 100%;
}
</style>
