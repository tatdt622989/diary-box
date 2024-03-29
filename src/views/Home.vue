<template>
  <div
    class="main-wrap home-wrap"
    :style="{ height }"
    @click="functionMenuToggler($event, false)"
  >
    <!-- <p class="position-absoulte">{{ store.state.gpuTier }}</p> -->
    <div class="status">
      <div class="currency">
        <span>{{ store.state.userData.pointInfo.balance }}</span>
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
      <li @click="reset">
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
    <p v-if="$store.state.isDebug">{{ $store.state.gpuTier }}</p>
    <canvas id="mainScene" ref="mainScene"></canvas>
    <div class="note-wrap" :class="{ active: isNoteOpen }">
      <div class="content">
        <div class="d-flex justify-content-end w-100 mb-2">
          <button class="btn btn-circle close-btn" @click="isNoteOpen = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <p class="date" v-if="noteDate">{{ noteDate }}</p>
        <div
          class="text-container"
          v-html="lastestNoteData.length > 0 ? lastestNoteData[0].content : ''"
          v-if="lastestNoteData"
        ></div>
        <div class="default" v-if="!noteDate">
          <span class="material-icons">playlist_add</span>
          <p>還沒有日記喔！</p>
          <p>快來寫日記拿日記幣！</p>
          <button @click="createNote" class="btn btn-primary">寫日記</button>
        </div>
      </div>
      <button class="toggler" @click="isNoteOpen = !isNoteOpen">
        <span>近期日記</span>
      </button>
    </div>
    <FunctionBar :mode="'home'"></FunctionBar>
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
            <!-- <button type="button" class="btn btn-primary" @click="shareImg">
              分享
            </button> -->
            <button type="button" class="btn btn-primary" @click="downloadImg">
              下載
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal fade"
      id="welcomeModal"
      tabindex="-1"
      aria-labelledby="welcomeModalModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="welcomeModalModalLabel">
              歡迎來到日記盒DiaryBox
            </h5>
            <button
              type="button"
              class="btn btn-circle"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            日記盒提供<strong>記錄生活、繪畫、記帳、編輯模型、布置場景</strong>等多項服務，來看看如何開始吧！
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              略過教學
            </button>
            <button class="btn btn-primary" @click="guide">下一步</button>
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
  onBeforeUnmount,
  nextTick,
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
import {
  LoadedModel,
  Model,
  ModelColor,
  Note,
} from '@/types';
import { Geometry, Object3D } from 'three';
import screenfull from 'screenfull/dist/screenfull';
import rendererCreator from '@/utils/rendererCreator';
import textureLoader from '@/utils/textureLoader';
import Shepherd from 'shepherd.js';

export default defineComponent({
  name: 'Home',
  components: {
    FunctionBar,
    Menu,
  },
  setup() {
    const store = useStore();
    let canvas: HTMLCanvasElement;
    const screenShotModal = ref<HTMLElement | null>(null);
    const publicPath = ref(process.env.BASE_URL);
    // const datGui = ref(new dat.GUI());
    const models = ref<Array<Model>>(store.state.userData
      ? store.state.userData.modelData : [store.state.defaultModelData]);
    const isNoteOpen = ref<boolean>(false);
    const lastestNoteData = ref<Array<Note>>([]);
    const img = ref('');
    const noteData = computed(() => store.state.userData.noteData);
    const userData = computed(() => store.state.userData);
    const quality = computed(() => store.state.quality);
    let renderer: THREE.WebGLRenderer | null;
    const scene = new THREE.Scene();
    let controls: MapControls;
    let animation: number;
    let takeScreenShot = false;
    let base64: string | null;
    let camera: THREE.PerspectiveCamera | null;
    const height = computed(() => store.state.height);
    const functionMenuOpen = computed(() => store.state.functionMenuOpen);

    function getNote() {
      if (noteData.value.length > 0) {
        const lastestDateTs = noteData.value[noteData.value.length - 1].id;
        const lastestDayStartTs = lastestDateTs - (lastestDateTs % 100000);
        lastestNoteData.value = noteData.value.filter(
          (note: Note) => Number(note.id) > lastestDayStartTs,
        );
      }
    }

    watch(
      noteData,
      () => {
        getNote();
      },
    );

    function resize() {
      if (renderer && camera) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / (window.innerHeight);
        camera.updateProjectionMatrix();
      }
    }

    function functionMenuToggler(e: Event, type: string | boolean = false) {
      store.commit('functionMenuToggler', type);
    }

    onMounted(async () => {
      document.dispatchEvent(new Event('render-event'));
      getNote();
      canvas = document.getElementById('mainScene') as HTMLCanvasElement;
      let tier;
      if (store.state.gpuTier.type && store.state.gpuTier.type === 'FALLBACK') {
        tier = false;
      } else {
        tier = store.state.gpuTier ? store.state.gpuTier.tier : 0;
      }
      renderer = rendererCreator(tier, canvas, !!store.state.gpuTier.isMobile);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.BasicShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene.background = new THREE.Color(0x449966);

      // 相機
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / (window.innerHeight),
        0.1,
        10000,
      );
      camera.position.set(40, 25, 0);
      camera.zoom = 1;

      // 控制器
      controls = new MapControls(camera, canvas);
      controls.target = new THREE.Vector3(0, 6, 0);
      controls.dampingFactor = 0.1;
      controls.enableDamping = true;
      controls.screenSpacePanning = false;
      controls.minDistance = 10;
      controls.maxDistance = 500;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI / 2.5;
      controls.saveState();

      // 地板
      const planeGeometry = new THREE.PlaneGeometry(600, 650, 32);
      const planeMaterial = new THREE.MeshStandardMaterial(
        { color: '#336744', side: THREE.DoubleSide },
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
      pointLight.shadow.mapSize.width = 1024;
      pointLight.shadow.mapSize.height = 1024;
      pointLight.shadow.camera.near = 1;
      pointLight.shadow.camera.far = 10000;
      const directionalLight = new THREE.DirectionalLight(0xF8EBCF, 0.6);
      directionalLight.position.set(-10, 20, 0);
      scene.add(pointLight);
      scene.add(directionalLight);
      // const pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
      // scene.add(pointLightHelper);

      // 霧
      scene.fog = new THREE.Fog(0x449966, 1, 300);

      const clock = new THREE.Clock();
      const FPS = 30;
      const rt = 1 / FPS;
      let ts = 0;

      function render() {
        if (renderer && camera) {
          animation = requestAnimationFrame(render);
          const T = clock.getDelta();
          ts += T;

          if (ts > rt) {
            controls.update();
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
            if (takeScreenShot) {
              takeScreenShot = false;
              base64 = renderer.domElement.toDataURL('image/jpeg', 1.0);
            }
            ts = 0;
          }
        }
      }
      const loader = new GLTFLoader();

      const loadedModel: LoadedModel = {};
      const modelLen = models.value.length;
      /**
       * 模型樣式載入
       */
      async function modelStyling(data: Model, obj: THREE.Object3D,
        color: ModelColor | null, colorKeys: Array<string> | null,
        texture: ModelColor | null, textureKeys: Array<string> | null) {
        const threeObj = obj;
        const result: Array<any> = [];
        threeObj.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            const mesh = object;
            mesh.castShadow = true;
            if (color && colorKeys) {
              if (colorKeys.indexOf(object.name) >= 0 && color[object.name]) {
                mesh.material.color = new THREE.Color((color as ModelColor)[object.name]);
              }
            }
            if (texture && textureKeys && object.material && texture[object.material.name]) {
              result.push(textureLoader(texture[object.material.name], object, data.name));
            }
          }
        });
        await Promise.all(result);
        threeObj.castShadow = true;
        threeObj.position.set(data.position.x, data.position.y, data.position.z);
        threeObj.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
        threeObj.receiveShadow = false;
      }

      /**
       * 同步載入模型
       */
      async function ModelLoad(i: number) {
        const data = JSON.parse(JSON.stringify(models.value[i]));
        const { color } = models.value[i];
        let threeObj;
        const { texture } = models.value[i];
        const colorKeys: Array<string> | null = color ? Object.keys(color) : null;
        const textureKeys: Array<string> | null = texture ? Object.keys(texture) : null;
        if (!loadedModel[data.name]) {
          threeObj = await new Promise((resolve, reject) => {
            loader.load(
              `${publicPath.value}model/${data.name}.gltf?v=1.2`,
              async (gltf) => {
                threeObj = gltf.scene;
                await modelStyling(data, threeObj, (color as ModelColor | null), colorKeys,
                  (texture as ModelColor | null), textureKeys);
                resolve(threeObj);
              },
              (xhr) => {
                console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
              },
              (error) => {
                console.log('An error happened', error);
              },
            );
          });
        } else {
          threeObj = loadedModel[data.name].clone();
          await modelStyling(data, threeObj, (color as ModelColor | null), colorKeys,
            (texture as ModelColor | null), textureKeys);
        }
        scene.add(threeObj as Object3D);
      }

      const result = [];
      let i = 0;
      while (i < modelLen) {
        if (!models.value[i].passive) {
          result.push(ModelLoad(i));
        }
        i += 1;
      }

      Promise.all(result).then(() => {
        render();
        resize();
        store.commit('closeModal');
        if (!localStorage.getItem('isGuide')) {
          store.dispatch('openModal', {
            type: 'welcome',
            asynchronous: false,
          });
        }
      });
      window.addEventListener('resize', resize, false);
      (document.getElementById('mainScene') as HTMLCanvasElement).addEventListener('click', functionMenuToggler, false);
      (document.getElementById('mainScene') as HTMLCanvasElement).addEventListener('touchstart', functionMenuToggler, false);
    });

    onBeforeUnmount(() => {
      (document.getElementById('mainScene') as HTMLCanvasElement).removeEventListener('click', functionMenuToggler);
      (document.getElementById('mainScene') as HTMLCanvasElement).removeEventListener('touchstart', functionMenuToggler);

      window.removeEventListener('resize', resize);
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
      base64 = null;
      setTimeout(() => {
        if (base64) {
          img.value = base64;
        }
      }, 100);
    }

    function openModal() {
      if (screenShotModal.value) {
        screenShot();
        const modal = new Modal(screenShotModal.value);
        modal.show();
      }
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

    function reset() {
      if (controls) {
        controls.reset();
      }
    }

    function guide() {
      store.commit('closeModal');
      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'shadow-md bg-purple-dark',
        },
      });
      tour.on('active', () => {
        (document.querySelector('.shepherd-modal-overlay-container') as SVGElement).style.height = `${window.innerHeight}px`;
      });
      tour.addSteps([
        {
          id: 'custom-step',
          text: '這是你持有的日記幣，透過寫日記或記帳可以獲得日記幣喔！',
          canClickTarget: false,
          attachTo: {
            element: '.status',
            on: 'auto',
          },
          classes: 'custom-step',
          buttons: [
            {
              text: '下一步',
              action: tour.next,
            },
          ],
        },
        {
          id: 'custom-step',
          text: '日記幣可以到商店中購買模型並放置到場景中！',
          canClickTarget: false,
          attachTo: {
            element: '#storeBtn',
            on: 'top',
          },
          classes: 'custom-step',
          buttons: [
            {
              text: '下一步',
              action: tour.next,
            },
          ],
        },
        {
          id: 'custom-step',
          text: '寫過的日記可以到這裡查看！',
          canClickTarget: false,
          attachTo: {
            element: '#noteBtn',
            on: 'top',
          },
          classes: 'custom-step',
          buttons: [
            {
              text: '下一步',
              action: tour.next,
            },
          ],
        },
        {
          id: 'custom-step',
          text: '記帳的資料則可以到這裡查看！',
          canClickTarget: false,
          attachTo: {
            element: '#accountingBtn',
            on: 'top',
          },
          classes: 'custom-step',
          buttons: [
            {
              text: '下一步',
              action: tour.next,
            },
          ],
        },
        {
          id: 'custom-step',
          text: '這裡可以查看近期寫過的日記！',
          canClickTarget: false,
          attachTo: {
            element: '.toggler',
            on: 'auto',
          },
          classes: 'custom-step',
          buttons: [
            {
              text: '下一步',
              action: tour.next,
            },
          ],
        },
        {
          id: 'custom-step',
          text: '點擊+號開始寫日記或記帳吧！',
          canClickTarget: false,
          attachTo: {
            element: '#addBtn',
            on: 'top',
          },
          classes: 'custom-step',
          buttons: [
            {
              text: '完成',
              action: tour.complete,
            },
          ],
        },
      ]);
      tour.start();
      tour.on('complete', () => {
        localStorage.setItem('isGuide', '1');
        resize();
      });
    }

    return {
      downloadImg,
      enterFullScreen,
      height,
      img,
      isMenuOpen: computed(() => store.state.isMenuOpen),
      isNoteOpen,
      lastestNoteData,
      menuToggler: () => store.commit('menuToggler', true),
      noteDate: computed(() => {
        const len = noteData.value.length;
        const date = len > 0
          ? new Date(Number(noteData.value[len - 1].id)) : null;
        if (date) {
          return `${date.getFullYear()} - ${date.getMonth() + 1} - ${date.getDate()}`;
        }
        return '';
      }),
      openModal,
      reset,
      screenShotModal,
      shareImg,
      store,
      userData,
      functionMenuOpen,
      functionMenuToggler,
      guide,
    };
  },
});
</script>

<style lang="scss">
@import "~shepherd.js/dist/css/shepherd.css";

.home-wrap {
  display: flex;
  flex-direction: column;
  overflow-y: visible;
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
  .modal-footer {
    justify-content: center;
  }
}
.note-wrap {
  .toggler {
    span {
      font-size: 20px;
      font-weight: bold;
      writing-mode: vertical-lr;
      letter-spacing: 4px;
      user-select: none;
    }
    align-items: center;
    background-color: $secondary;
    border-radius: 0 20px 20px 0;
    color: $primary;
    display: flex;
    flex-shrink: 0;
    height: 125px;
    justify-content: center;
    width: 44px;
    margin-right: -44px;
    padding-left: 2px;
  }
  .content {
    .text-container {
      > p {
        text-align: left;
        word-break: break-word;
        width: 100%;
        margin: 0;
      }
      border: 2px solid $primary;
      border-radius: 10px;
      width: 100%;
      padding: 16px;
      display: block;
      flex-grow: 1;
    }
    .date {
      font-size: 28px;
      font-weight: bold;
      color: $primary;
      border: 2px solid $primary;
      padding: 0 20px;
      margin-bottom: 32px;
      width: 100%;
      border-radius: 8px;
    }
    .default {
      span {
        color: $primary;
        font-size: 120px;
        margin-bottom: 20px;
      }
      p {
        &:last-of-type {
          margin-bottom: 32px;
        }
        color: $primary;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 0;
      }
      button {
        border-radius: 999px;
        color: $secondary;
        font-size: 24px;
        font-weight: bold;
        height: 52px;
        width: 120px;
      }
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      margin: auto;
      flex-direction: column;
    }
    align-items: center;
    background-color: $secondary;
    border-left: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    flex-grow: 1;
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
  z-index: 10;
  // max-width: 500px;
}
.custom-step {
  max-width: 340px;
  background-color: $secondary;
  border-radius: 20px;
  padding: 20px;
  .shepherd-text {
    color: $primary;
    font-size: 20px;
    line-height: 1.5;
    letter-spacing: 1px;
    font-weight: 400;
    padding: 0;
  }
  .shepherd-button {
    margin-top: 20px;
    background-color: $primary;
    font-weight: 400;
    font-size: 20px;
    border-radius: 999px;
    color: $secondary;
    &:hover {
      background-color: #34764e;
    }
  }
  .shepherd-arrow {
    display: none;
  }
  .shepherd-footer {
    padding: 0;
  }
}
#welcomeModal {
  letter-spacing: 0.8px;
  .modal-body {
    color: $primary;
    font-size: 20px;
    font-weight: 400;
    display: inline;
    line-height: 1.5;
  }
  .modal-footer {
    .btn {
      letter-spacing: 0.8px;
    }
    .btn:first-child {
      opacity: 0.8;
    }
  }
}
</style>
