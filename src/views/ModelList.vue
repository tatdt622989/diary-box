<template>
  <div
    class="main-wrap model-list-wrap all menu-layout"
    @click="selectedMenu = []"
    :style="{ height: height + 'px' }"
    :class="{store : view === 'Store'}"
  >
    <Navbar></Navbar>
    <div class="header">
      <button
        class="btn-circle"
        @click="$router.go(-1)"
      >
        <span class="material-icons">arrow_back</span>
      </button>
      <p>{{ view === 'ModelList' ? '所有模型' : '購買模型' }}</p>
    </div>
    <div class="w-100 d-flex justify-content-center currency-wrap" v-if="view === 'Store'">
      <div class="currency">
        <span>999</span>
        <span class="material-icons">monetization_on</span>
      </div>
    </div>
    <div class="content">
      <div class="models container-fluid">
        <div class="row">
          <div
            class="item col-6 col-md-4 col-lg-3"
            v-for="(v, i) in models"
            :key="i"
            :class="{ active: i === 0 }"
          >
            <div class="item-bg">
              <div class="item-wrap">
              <div v-if="view === 'ModelList'" class="position-absolute start-0 top-0">
                <button
                  class="menu-btn btn-circle"
                  @click.stop="selectedMenu = [i, n]"
                  :class="{
                    active: selectedMenu[0] === i && selectedMenu[1] === n,
                  }"
                >
                  <span class="material-icons">more_vert</span>
                </button>
              </div>
              <div class="model-frame" :id="'scene' + i"></div>
              <span class="item-status" v-if="view === 'ModelList'">
                {{ i === 0 ? "使用中" : "未使用" }}
              </span>
              <div
                class="w-100 d-flex justify-content-center align-items-center"
                v-if="view === 'Store'"
              >
                <button class="price" @click="openModal(key, v.displayName)">
                  <span>{{ v.price }}</span>
                  <span class="material-icons">monetization_on</span>
                </button>
              </div>
              <ul
                class="function-menu"
                @click.stop
                v-if="selectedMenu[0] === i && selectedMenu[1] === n && view === 'ModelList'"
              >
                <li>
                  <button>預覽</button>
                </li>
                <li>
                  <button>切換為未使用</button>
                </li>
                <li>
                  <button>刪除</button>
                </li>
              </ul>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal fade"
      id="confirmPurchaseModal"
      tabindex="-1"
      aria-labelledby="confirmPurchaseModalLabel"
      aria-hidden="true"
      ref="confirmPurchaseModal"
    >
      <div
        class="modal-dialog modal-dialog-centered"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmPurchaseModalLabel">畫面截圖</h5>
          </div>
          <div class="modal-body">
            <p>確認購買"{{ buyingModel? buyingModel.name : '' }}"</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="closeModal">取消</button>
            <button type="button" class="btn btn-primary" @click="linkTo">購買</button>
          </div>
        </div>
      </div>
    </div>
    <FunctionBar :mode="'model-list'" v-if="view === 'ModelList'"></FunctionBar>
    <canvas id="modelList"></canvas>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
  nextTick,
  onUnmounted,
  watch,
  watchEffect,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Navbar from '@/components/Navbar.vue';
import FunctionBar from '@/components/FunctionBar.vue';
import { SceneData, Model, Product } from '@/types';
import { Modal } from 'bootstrap';

export default defineComponent({
  name: 'ModelList',
  components: {
    Navbar,
    FunctionBar,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const models = ref<Array<Product | Model>>([]);
    const selectedMenu = ref<Array<string>>([]);
    const publicPath = ref(process.env.BASE_URL);
    const view = ref<string>(route.name as string);
    let renderer: THREE.WebGLRenderer | null = null;
    let canvas: HTMLCanvasElement;
    let animation: number;
    let allSceneData: Array<SceneData> = [];
    interface BuyingModel {
      type: string;
      name: string;
    }
    const buyingModel = ref<BuyingModel>({
      name: '',
      type: '',
    });
    let firstLoad = true;
    const loadedModel = [];
    const modelsFormat = computed(() => store.state.modelsFormat);
    const modelsData = computed(() => store.state.modelsData);

    function getModels() {
      if (view.value === 'Store' && store.state.modelsFormat) {
        const result: Array<Product> = [];
        const keys = Object.keys(store.state.modelsFormat);
        keys.forEach((key) => {
          const obj = JSON.parse(JSON.stringify(store.state.modelsFormat[key]));
          obj.name = key;
          result.push(obj as Product);
        });
        models.value = result;
      } else if (view.value === 'ModelList' && store.state.modelsData) {
        models.value = store.state.modelsData;
      }
      console.log(models.value);
    }

    async function init() {
      await nextTick();
      console.log('init-start');
      if (renderer) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
      }

      function createScene(el: HTMLElement) {
        const scene = new THREE.Scene();
        scene.background = null;
        // 相機
        const {
          left, right, bottom, top,
        } = el.getBoundingClientRect();
        const width = right - left;
        const height = bottom - top;
        const camera = new THREE.PerspectiveCamera(
          45,
          width / height,
          0.1,
          1000,
        );
        camera.position.set(0, 8, 20);
        camera.zoom = 2;
        const controls = new OrbitControls(camera, el);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 3;
        controls.enabled = false;
        controls.target = new THREE.Vector3(0, 1.3, 0);
        controls.update();

        // 燈光
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xF8EBCF, 0.6, 10000);
        pointLight.position.set(0, 7, 5);
        pointLight.castShadow = true;
        pointLight.shadow.radius = 2;
        pointLight.shadow.mapSize.width = 2048;
        pointLight.shadow.mapSize.height = 2048;
        pointLight.shadow.camera.near = 1;
        pointLight.shadow.camera.far = 10000;
        scene.add(pointLight);
        // const pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
        // scene.add(pointLightHelper);
        const directionalLight = new THREE.DirectionalLight(0xF8EBCF, 0.6);
        directionalLight.position.set(-10, 20, 0);
        scene.add(directionalLight);

        // 霧
        scene.fog = new THREE.Fog(0x449966, 1, 150);
        return {
          scene, camera, el, controls,
        };
      }
      const loader = new GLTFLoader();
      const modelLen = models.value.length;
      console.log(modelLen);
      let i = 0;
      const loadResult: Array<Promise<SceneData>> = [];
      while (i < modelLen) {
        const el = document.getElementById(`scene${i}`) as HTMLElement;
        console.log(el);
        const sceneData: SceneData = createScene(el);
        loadedModel.push();
        const { name } = models.value[i];
        const asyncLoad = (index: number) => new Promise<SceneData>((resolve) => {
          loader.load(
            `${publicPath.value}model/${name}.gltf`,
            (gltf) => {
              const model = gltf.scene.children[0];
              console.log(model);
              model.castShadow = true;
              model.position.set(0, 0, 0);
              model.receiveShadow = false;
              sceneData.scene.add(model);
              resolve(sceneData);
            },
            (xhr) => {
              console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            (error) => {
              console.log('An error happened');
            },
          );
        });
        loadResult.push(asyncLoad(i));
        i += 1;
      }
      Promise.all(loadResult).then((data: Array<SceneData>) => {
        allSceneData = data;
        const render = function () {
          if (renderer) {
            animation = requestAnimationFrame(render);
            renderer.setClearColor(0x000000, 0);
            renderer.setScissorTest(false);
            renderer.clear();
            renderer.setClearColor(0x000000, 0);
            renderer.setScissorTest(true);
            i = 0;
            while (i < data.length) {
              const {
                left, right, bottom, top,
              } = data[i].el.getBoundingClientRect();

              if (bottom < 0 || top > canvas.clientHeight
            || right < 0 || left > canvas.clientWidth) {
                return; // it's off screen
              }
              // set the viewport
              const width = right - left;
              const height = bottom - top;
              const offsetLeft = left;
              const offsetBottom = canvas.clientHeight - bottom;
              renderer.setViewport(offsetLeft, offsetBottom, width, height);
              renderer.setScissor(offsetLeft, offsetBottom, width, height);
              renderer.autoClear = true;
              // eslint-disable-next-line no-param-reassign
              data[i].camera.aspect = width / height; // not changing in this example
              data[i].camera.updateProjectionMatrix();
              data[i].controls.update();
              renderer.render(data[i].scene as THREE.Scene, data[i].camera);
              i += 1;
            }
          }
        };
        render();
      });
      const resize = function () {
        if (renderer) {
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      };
      window.addEventListener('resize', resize, false);
    }

    function clearCanvas() {
      console.log('清空畫布');
      allSceneData.forEach((el) => {
        el.controls.dispose();
        el.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            obj.material.dispose();
          }
        });
        while (el.scene.children.length > 0) {
          el.scene.remove(el.scene.children[0]);
        }
      });
    }

    watch(() => route.name, (newVal) => {
      clearCanvas();
      firstLoad = true;
      view.value = newVal as string;
      getModels();
      if (models.value.length > 0) {
        init();
        firstLoad = false;
      }
    });

    watch(modelsFormat, (newVal) => {
      console.log('模型監聽器', newVal, allSceneData.length);
      if (newVal && view.value === 'Store' && firstLoad) {
        if (allSceneData.length > 0) {
          clearCanvas();
        }
        getModels();
        if (models.value.length > 0) {
          init();
          firstLoad = false;
        }
      }
    });

    watch(modelsData, (newVal) => {
      console.log('模型監聽器', newVal);
      if (newVal && view.value === 'ModelList' && firstLoad) {
        if (allSceneData.length > 0) {
          clearCanvas();
        }
        getModels();
        if (models.value.length > 0) {
          init();
          firstLoad = false;
        }
      }
    });

    onMounted(() => {
      canvas = document.querySelector('#modelList') as HTMLCanvasElement;
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      getModels();
      if (models.value.length > 0) {
        init();
        firstLoad = false;
      }
    });

    onUnmounted(() => {
      allSceneData.forEach((el) => {
        el.controls.dispose();
        el.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            obj.material.dispose();
          }
        });
        while (el.scene.children.length > 0) {
          el.scene.remove(el.scene.children[0]);
        }
      });
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer = null;
      }
      if (animation) {
        cancelAnimationFrame(animation);
      }
    });

    function openModal(type: string, name: string) {
      buyingModel.value.name = name;
      buyingModel.value.type = type;
      const modal = new Modal(document.getElementById('confirmPurchaseModal') as HTMLElement);
      modal.show();
    }

    function closeModal() {
      const modal = new Modal(document.getElementById('confirmPurchaseModal') as HTMLElement);
      modal.hide();
    }

    return {
      selectedMenu,
      models,
      height: computed(() => store.state.height),
      view,
      modelsFormat: computed(() => store.state.modelsFormat),
      openModal,
      closeModal,
      buyingModel,
    };
  },
});
</script>

<style lang="scss" scoped>
.model-list-wrap {
  &.store {
    .item-wrap {
      height: 280px;
    }
    .header {
      padding-bottom: 0;
    }
    .content {
      padding-top: 168px;
    }
  }
  .models {
    overflow: auto;
  }
  .item {
    &.active {
      .item-bg {
        background-color: $secondary;
      }
    }
  }
  .item-bg {
    background-color: #c2d2af;
    border-radius: 20px;
    background-clip: content-box;
  }
  .item-wrap {
    .item-status {
      color: $primary;
      font-size: 20px;
      font-weight: bold;
    }
    > div {
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }
    .quantity {
      color: $primary;
      flex-grow: 1;
      flex-wrap: wrap;
      font-size: 20px;
      font-weight: bold;
      height: 52px;
      margin: 0;
      text-align: left;
    }
    .menu-btn {
      &.active {
        span {
          color: $secondary;
        }
        background-color: $primary;
      }
      position: relative;
      right: 10px;
      top: 10px;
    }
    .model-frame {
      flex-grow: 1;
    }
    .corner {
      &:nth-of-type(1) {
        left: 0;
        top: 0;
      }
      &:nth-of-type(2) {
        right: 0;
        top: 0;
        transform: rotate(90deg);
      }
      &:nth-of-type(3) {
        right: 0;
        bottom: 0;
        transform: rotate(180deg);
      }
      &:nth-of-type(4) {
        left: 0;
        bottom: 0;
        transform: rotate(270deg);
      }
      height: 20px;
      position: absolute;
      width: 20px;
      z-index: 5;
    }
    .price {
      &:active,
      &:focus {
        span,
        span:not(.material-icons) {
          color: $secondary;
        }
        background-color: $primary;
      }
      .material-icons {
        color: $primary;
        font-size: 32px;
        margin-right: 10px;
      }
      span:not(.material-icons) {
        color: $primary;
        flex-grow: 1;
        font-size: 24px;
        font-weight: bold;
      }
      align-items: center;
      background-color: transparent;
      border-radius: 999px;
      border: 2px solid $primary;
      display: flex;
      height: 52px;
      justify-content: center;
      transition: $t-base;
      padding: 0;
      width: 150px;
    }
    display: flex;
    flex-direction: column;
    height: 230px;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 16px;
    position: relative;
    user-select: none;
    z-index: 999;
  }
  .function-menu {
    button {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }
    box-shadow: 4px 0px 16px rgba(68, 153, 102, 0.5);
    opacity: 1;
  }
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.currency-wrap {
  .currency {
    span:not(.material-icons) {
      color: $secondary;
      flex-grow: 1;
      font-size: 28px;
      font-weight: bold;
      padding: 0 16px;
      text-align: left;
    }
    .material-icons {
      color: $secondary;
      font-size: 32px;
      margin-right: 10px;
    }
    align-items: center;
    border-radius: 999px;
    border: 2px solid $secondary;
    display: flex;
    height: 52px;
    justify-content: flex-end;
    margin-bottom: 32px;
    margin-top: 20px;
    width: 190px;
  }
  background-color: $primary;
  position: fixed;
  top: 130px;
  z-index: 1000;
}
.content {
  align-items: center;
  padding: 0;
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 10px;
  padding-top: 92px;
}
.header {
  p {
    flex-grow: 1;
    padding-right: 52px;
    text-align: center;
  }
  background: $primary;
  padding-bottom: 28px;
  margin-top: 0;
  padding-top: 12px;
  position: fixed;
  left: 0;
  top: 66px;
  z-index: 1000;
}
canvas {
  position: fixed;
  left: 0;
  z-index: 998;
  top: 0;
  pointer-events: none;
}
#confirmPurchaseModal {
  .modal-body {
    font-size: 20px;
    font-weight: bold;
    color: $primary;
  }
}
</style>
