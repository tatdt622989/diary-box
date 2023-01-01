<template>
  <div
    class="main-wrap model-list-wrap all menu-layout"
    @click="selectedMenu = []"
    :style="{ height: height + 'px' }"
    :class="{ store: view === 'Store' }"
  >
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/home')">
        <span class="material-icons">arrow_back</span>
      </button>
      <p>{{ view === "ModelList" ? "所有模型" : "購買模型" }}</p>
      <button
        class="btn-circle"
        @click="$router.push('/store')"
        v-if="view === 'ModelList'"
      >
        <span class="material-icons">store</span>
      </button>
    </div>
    <div
      class="w-100 d-flex justify-content-center currency-wrap"
      v-if="view === 'Store'"
    >
      <div class="currency">
        <span>{{ userData? userData.pointInfo.balance : 0 }}</span>
        <span class="material-icons">monetization_on</span>
      </div>
    </div>
    <div class="content">
      <div class="models container-fluid scroll-bar over-scroll">
        <div class="row">
          <div
            class="item col-6 col-md-4 col-lg-3"
            v-for="(v, i) in models"
            :key="i"
            :class="{ passive: v.passive && view === 'ModelList' }"
          >
            <div class="item-bg">
              <div class="item-wrap" :style="{ zIndex: 1000 - i}">
                <div
                  v-if="view === 'ModelList'"
                  class="position-absolute start-0 top-0"
                >
                  <button
                    class="menu-btn btn-circle"
                    @click.stop="selectedMenu = [i]"
                    :class="{
                      active: selectedMenu[0] === i,
                    }"
                  >
                    <span class="material-icons">more_vert</span>
                  </button>
                </div>
                <div class="model-frame" :id="'scene' + i"></div>
                <span class="item-status" v-if="view === 'ModelList'">
                  {{ v.passive ? "未使用" : "使用中" }}
                </span>
                <div
                  class="w-100 d-flex justify-content-center align-items-center"
                  v-if="view === 'Store'"
                >
                  <button
                    class="price"
                    @click="openBuyModal(v.name, v.displayName, v.price)"
                  >
                    <span>{{ v.price }}</span>
                    <span class="material-icons">monetization_on</span>
                  </button>
                </div>
                <ul
                  class="function-menu"
                  @click.stop
                  v-if="
                    selectedMenu[0] === i &&
                    view === 'ModelList'
                  "
                >
                  <li>
                    <button @click="preview(i)">預覽</button>
                  </li>
                  <li>
                    <button @click="togglePassiveState(i)">
                      {{ v.passive ? '切換為使用中' : '切換為未使用' }}
                    </button>
                  </li>
                  <li>
                    <button @click="openDeleteModal(v.id)">刪除</button>
                  </li>
                  <li>
                    <button @click="editModel(i)">編輯</button>
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
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmPurchaseModalLabel">畫面截圖</h5>
          </div>
          <div class="modal-body">
            <p class="modal-info">
              確定要花&nbsp;{{ buyingModel ? buyingModel.price : "" }}
              <span class="material-icons">monetization_on</span>
              <br>購買&nbsp;"{{
                buyingModel ? buyingModel.name : ""
              }}"&nbsp;嗎?
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="closeBuyModal">
              取消
            </button>
            <button type="button" class="btn btn-primary" @click="buyModel">
              購買
            </button>
          </div>
        </div>
      </div>
    </div>
    <canvas id="modelList"></canvas>
    <Hint @delete-model="deleteModel"></Hint>
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
  onBeforeUnmount,
  watch,
  watchEffect,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Navbar from '@/components/Navbar.vue';
import Hint from '@/components/Hint.vue';
import {
  SceneData,
  Model,
  Product,
  ModelColor,
  LoadedModel,
} from '@/types';
import { Modal } from 'bootstrap';
import textureLoader from '@/utils/textureLoader';

export default defineComponent({
  name: 'ModelList',
  components: {
    Navbar,
    Hint,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const models = ref<Array<Product | Model>>([]);
    const selectedMenu = ref<Array<string>>([]);
    const publicPath = ref(process.env.BASE_URL);
    const view = ref<string>(route.name as string);
    const selectedId = ref<number | null>(null);
    let renderer: THREE.WebGLRenderer | null = null;
    let canvas: HTMLCanvasElement;
    let animation: number;
    let allSceneData: Array<SceneData> = [];
    interface BuyingModel {
      type: string;
      name: string;
      price: number;
    }
    const buyingModel = ref<BuyingModel>({
      name: '',
      type: '',
      price: 0,
    });
    let firstLoad = true;
    const modelFormat = computed(() => store.state.modelFormat);
    let modal: Modal;
    const modelData = computed(() => store.state.userData.modelData);

    function getModels() {
      if (view.value === 'Store' && store.state.modelFormat) {
        const result: Array<Product> = [];
        const keys = Object.keys(store.state.modelFormat);
        keys.forEach((key) => {
          const obj = JSON.parse(JSON.stringify(store.state.modelFormat[key]));
          obj.name = key;
          result.push(obj as Product);
        });
        models.value = result;
      } else if (view.value === 'ModelList') {
        if (store.state.userData) {
          models.value = JSON.parse(JSON.stringify(modelData.value));
        } else {
          models.value = [store.state.defaultModelData];
        }
      }
    }

    function resize() {
      if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    }

    async function init() {
      await nextTick();
      if (renderer) {
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
        camera.position.set(20, 8, 0);
        camera.zoom = 2;
        const controls = new OrbitControls(camera, el);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 3;
        controls.enabled = false;
        controls.target = new THREE.Vector3(0, 2.2, 0);
        controls.update();

        // 燈光
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 0.4, 10000);
        pointLight.position.set(-10, 7, 0);
        pointLight.castShadow = true;
        scene.add(pointLight);
        // const pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
        // scene.add(pointLightHelper);
        const directionalLight = new THREE.DirectionalLight(0xcff3f8, 0.7);
        directionalLight.position.set(5, 10, 3);
        scene.add(directionalLight);

        // 霧
        scene.fog = new THREE.Fog(0xffffff, 1, 150);
        return {
          scene, camera, el, controls,
        };
      }
      const loader = new GLTFLoader();
      const modelLen = models.value.length;
      let i = 0;
      const loadResult: Array<Promise<SceneData>> = [];
      const loadedModel: LoadedModel = {};
      /**
       * 模型樣式載入
       */
      async function modelStyling(obj: THREE.Object3D,
        color: ModelColor | null, colorKeys: Array<string> | null,
        texture: ModelColor | null, textureKeys: Array<string> | null) {
        const model = obj;
        const result: Array<any> = [];
        model.traverse((object) => {
          // console.log(texture, object);
          if (object instanceof THREE.Mesh) {
            const mesh = object;
            mesh.castShadow = true;
            if (color && colorKeys && view.value === 'ModelList' && color[object.name]) {
              if (colorKeys.indexOf(object.name) >= 0) {
                mesh.material.color = new THREE.Color((color as ModelColor)[object.name]);
              }
            }
            // console.log(object.material.name);
            if (texture && textureKeys && view.value === 'ModelList' && object.material && texture[object.material.name]) {
              result.push(textureLoader(texture[object.material.name], object, obj.name));
            }
          }
        });
        await Promise.all(result);
        model.castShadow = true;
        model.position.set(model.position.x, model.position.y, model.position.z);
        model.receiveShadow = false;
      }
      while (i < modelLen) {
        const el = document.getElementById(`scene${i}`) as HTMLElement;
        const sceneData: SceneData = createScene(el);
        const { name } = models.value[i];
        const { color } = models.value[i];
        const { texture } = models.value[i];
        const colorKeys: Array<string> | null = color ? Object.keys(color) : null;
        const textureKeys: Array<string> | null = texture ? Object.keys(texture) : null;

        const asyncLoad: any = async () => {
          if (!loadedModel[name]) {
            await new Promise((res) => {
              loader.load(
                `${publicPath.value}model/${name}.gltf?v=1.2`, async (gltf) => {
                  const model = gltf.scene.children[0];
                  await modelStyling(model, (color as ModelColor | null), colorKeys,
                    (texture as ModelColor | null), textureKeys);
                  sceneData.scene.add(model);
                  res(sceneData);
                },
                (xhr) => {
                  console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
                },
                (error) => {
                  console.log('An error happened');
                },
              );
            });
          } else {
            const model = loadedModel[name].clone();
            await modelStyling(model, (color as ModelColor | null), colorKeys,
              (texture as ModelColor | null), textureKeys);
            sceneData.scene.add(model);
          }
          return sceneData;
        };
        loadResult.push(asyncLoad());
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
        let times = 0;
        const closeModal = setInterval(() => {
          if (times > 50 || store.state.modalLoaded) {
            store.commit('closeModal');
            clearInterval(closeModal);
          }
          times += 1;
        }, 100);
      });
      window.addEventListener('resize', resize, false);
    }

    function clearCanvas() {
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
      if (newVal === 'Store' || newVal === 'ModelList') {
        getModels();
        if (models.value.length > 0) {
          init();
          firstLoad = false;
        }
      }
    });

    watch(modelFormat, (newVal) => {
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

    onMounted(() => {
      modal = new Modal(document.getElementById('confirmPurchaseModal') as HTMLElement);
      canvas = document.querySelector('#modelList') as HTMLCanvasElement;
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        precision: 'lowp',
        powerPreference: 'low-power',
      });
      getModels();
      if (models.value.length > 0) {
        init();
        firstLoad = false;
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resize);
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

    function openBuyModal(type: string, name: string, price: number) {
      buyingModel.value.name = name;
      buyingModel.value.type = type;
      buyingModel.value.price = price;
      modal.show();
    }

    function closeBuyModal() {
      modal.hide();
    }

    function buyModel() {
      let times = 0;
      const closeModal = setInterval(() => {
        closeBuyModal();
        if (times > 50 || store.state.modalLoaded) {
          modal.hide();
          clearInterval(closeModal);
          if (store.state.userInfo) {
            store.dispatch('buyModel', buyingModel.value).then((res) => {
              if (res) {
                router.push({
                  name: 'ModelEditor',
                  params: {
                    status: 'new',
                  },
                });
              }
            });
          } else {
            store.dispatch('updateToast', {
              type: 'hint',
              content: '請先登入',
            });
            router.push('/');
          }
        }
        times += 1;
      }, 100);
    }

    function editModel(index: number) {
      router.push({
        name: 'ModelEditor',
        params: {
          index,
          status: 'old',
        },
      });
    }

    function preview(index: number) {
      router.push({
        name: 'ModelEditor',
        params: {
          index,
          status: 'preview',
        },
      });
    }

    function openDeleteModal(id: number) {
      selectedId.value = id;
      store.dispatch('openModal', {
        type: 'hint',
        asynchronous: true,
      });
    }

    async function deleteModel() {
      store.dispatch('closeModal');
      let times = 0;
      await new Promise((resolve) => {
        const timer = setInterval(() => {
          if (times > 50 || store.state.modalClosed || !store.state.modal) {
            resolve(null);
            clearInterval(timer);
          }
          times += 1;
        }, 100);
      });
      store.dispatch('openModal', {
        type: 'loading',
        loadingStr: '模型刪除中',
      });
      await store.dispatch('updateModelData', {
        method: 'delete',
        id: selectedId.value,
      }).then((res) => {
        if (res) {
          times = 0;
          const closeModal = setInterval(() => {
            if (times > 50 || store.state.modalLoaded) {
              store.commit('closeModal');
              clearInterval(closeModal);
              getModels();
              selectedMenu.value = [];
              selectedId.value = null;
              clearCanvas();
              firstLoad = true;
              getModels();
              if (models.value.length > 0) {
                init();
                firstLoad = false;
              }
            }
            times += 1;
          }, 100);
        }
      });
    }

    async function togglePassiveState(i: number) {
      const model = JSON.parse(JSON.stringify(models.value.filter((obj, index) => index === i)))[0];
      store.dispatch('openModal', {
        type: 'loading',
        loadingStr: '狀態切換中',
      });
      model.passive = !model.passive;
      await store.dispatch('updateModelData', {
        method: 'edit',
        id: model.id,
        data: model,
      }).then((res) => {
        if (res) {
          let times = 0;
          const closeModal = setInterval(() => {
            if (times > 50 || store.state.modalLoaded) {
              store.commit('closeModal');
              clearInterval(closeModal);
              getModels();
              selectedMenu.value = [];
            }
            times += 1;
          }, 100);
        }
      });
    }

    return {
      buyingModel,
      buyModel,
      closeBuyModal,
      editModel,
      height: computed(() => store.state.height),
      modelFormat: computed(() => store.state.modelFormat),
      models,
      openBuyModal,
      selectedMenu,
      userData: computed(() => store.state.userData),
      view,
      preview,
      togglePassiveState,
      deleteModel,
      openDeleteModal,
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
      p {
        padding-right: 52px;
      }
      padding-bottom: 0;
    }
    .content {
      padding-top: 172px;
    }
  }
  .models {
    overflow: auto;
  }
  .item {
    &.passive {
      .item-bg {
        background-color: #c2d2af;
      }
    }
  }
  .item-bg {
    background-color: $secondary;
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
  top: 134px;
  z-index: 1000;
}
.content {
  .models {
    .row {
      padding-bottom: 100px;
    }
    padding: 0 16px;
    flex-grow: 1;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  flex-grow: 1;
  overflow-y: auto;
  padding: 0;
  padding-top: 96px;
}
.header {
  p {
    flex-grow: 1;
    text-align: center;
  }
  background: $primary;
  padding-bottom: 28px;
  margin-top: 0;
  padding-top: 16px;
  position: fixed;
  left: 0;
  top: 66px;
  z-index: 1000;
}
canvas {
  position: fixed;
  left: 0;
  z-index: 99;
  top: 0;
  pointer-events: none;
}
#confirmPurchaseModal {
  .modal-body {
    .modal-info {
      span {
        font-size: 24px;
        line-height: 32px;
        vertical-align: top;
      }
      display: inline-block;
      line-height: 32px;
      font-size: 24px;
      width: 100%;
      word-wrap: break-word;
      text-align: center;
    }
    font-size: 20px;
    font-weight: bold;
    color: $primary;
  }
}
</style>
