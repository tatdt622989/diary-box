<template>
  <div
    class="main-wrap model-list-wrap all"
    @click="selectedMenu = []"
    :style="{ height: height + 'px' }"
  >
    <Navbar></Navbar>
    <div class="header">
      <button
        class="btn-circle"
        @click="$router.go(-1)"
        v-if="listMode === 'using'"
      >
        <span class="material-icons">arrow_back</span>
      </button>
      <p>{{ title }}</p>
    </div>
    <div class="content container-fluid">
      <div class="row">
        <div
          class="item col-6 col-md-4 col-lg-3"
          v-for="(item, i) in models"
          :key="i"
        >
          <div class="item-wrap" :class="{ active: i === 0 }" :id="'scene' + i">
            <div>
              <span class="quantity">20 / 20</span>
              <button
                class="menu-btn btn-circle"
                @click.stop="selectedMenu = [i, n]"
                :class="{
                  active: selectedMenu[0] === i && selectedMenu[1] === n,
                }"
                v-if="status === 'all-models'"
              >
                <span class="material-icons">more_vert</span>
              </button>
            </div>
            <div class="model-frame"></div>
            <span class="item-status" v-if="status === 'all-models'">{{
              i === 0 ? "使用中" : "未使用"
            }}</span>
            <ul
              class="function-menu"
              @click.stop
              v-if="selectedMenu[0] === i && selectedMenu[1] === n"
            >
              <li>
                <button>預覽</button>
              </li>
              <li>
                <button>放置到場景</button>
              </li>
              <li>
                <button>刪除</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <Menu></Menu>
    <FunctionBar :mode="'model-list'"></FunctionBar>
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
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import * as THREE from 'three';
import Navbar from '@/components/Navbar.vue';
import Menu from '@/components/Menu.vue';
import FunctionBar from '@/components/FunctionBar.vue';
import { LoadProvider, Model, SceneData } from '@/types';

export default defineComponent({
  name: 'ModelList',
  components: {
    Navbar,
    Menu,
    FunctionBar,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const models = ref<Array<string | Model>>(['can', 'pan', 'umbrella']);
    const selectedMenu = ref<Array<string>>([]);
    const listMode = ref<string>('using');
    const status = ref<string>('');
    const title = ref<string>('所有模型');
    const publicPath = ref(process.env.BASE_URL);
    const modelsName = ref<Array<string>>(['can', 'pan', 'umbrella']);

    async function init() {
      await nextTick();
      console.log('init-start');
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.querySelector('.model-list-wrap')!.appendChild(renderer.domElement);

      function createScene(el: HTMLElement) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xF8EBCF);
        // 相機
        const camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          0.1,
          10000,
        );
        camera.position.set(0, 5, 30);
        camera.zoom = 1;

        // 燈光
        const ambientLight = new THREE.AmbientLight(0xF0C98E, 0.9);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 0.7, 10000);
        pointLight.position.set(7, 25, 7);
        pointLight.castShadow = true;
        pointLight.shadow.radius = 2;
        pointLight.shadow.mapSize.width = 2048;
        pointLight.shadow.mapSize.height = 2048;
        pointLight.shadow.camera.near = 1;
        pointLight.shadow.camera.far = 10000;
        scene.add(pointLight);
        const pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
        scene.add(pointLightHelper);

        // 霧
        scene.fog = new THREE.Fog(0x449966, 1, 150);
        return { scene, camera, el };
      }
      const loader = new THREE.ObjectLoader();
      const modelLen = modelsName.value.length;
      console.log(modelLen);
      let i = 0;
      const loadResult: Array<Promise<LoadProvider>> = [];
      while (i < modelLen) {
        const el = document.getElementById(`scene${i}`) as HTMLElement;
        console.log(el);
        const sceneData: SceneData = createScene(el);
        sceneData.camera.aspect = window.innerWidth / window.innerHeight;
        sceneData.camera.updateProjectionMatrix();
        const asyncLoad = (index: number) => new Promise<LoadProvider>((resolve) => {
          loader.load(
            `${publicPath.value}model/${modelsName.value[index]}.json`,
            (gltf) => {
              const model = gltf;
              console.log(model);
              model.castShadow = true;
              model.position.set(0, 0, 0);
              model.receiveShadow = false;
              sceneData.scene.add(model);
              const provider: LoadProvider = {
                scene: sceneData.scene,
                camera: sceneData.camera,
                el: sceneData.el,
              };
              resolve(provider);
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
      Promise.all(loadResult).then((data: Array<LoadProvider>) => {
        const render = function () {
          requestAnimationFrame(render);
          renderer.setClearColor(0x449966);
          renderer.setScissorTest(false);
          renderer.clear();
          renderer.setClearColor(0x449966);
          renderer.setScissorTest(true);
          i = 0;
          while (i < data.length) {
            const {
              left, right, bottom, top,
            } = data[i].el.getBoundingClientRect();

            if (bottom < 0 || top > renderer.domElement.clientHeight
            || right < 0 || left > renderer.domElement.clientWidth) {
              return; // it's off screen
            }
            // set the viewport
            const width = right - left;
            const height = bottom - top;
            const offsetLeft = left;
            const offsetBottom = renderer.domElement.clientHeight - bottom;
            renderer.setViewport(offsetLeft, offsetBottom, width, height);
            renderer.setScissor(offsetLeft, offsetBottom, width, height);
            renderer.autoClear = true;
            // eslint-disable-next-line no-param-reassign
            data[i].camera.aspect = width / height; // not changing in this example
            data[i].camera.updateProjectionMatrix();
            renderer.render(data[i].scene as THREE.Scene, data[i].camera);
            i += 1;
          }
        };
        render();
      });
      const resize = function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', resize, false);
    }

    onMounted(() => {
      status.value = route.params.status as string;
      switch (status.value) {
        case 'all-models':
          title.value = '所有模型';
          break;
        case 'add-model':
          title.value = '建立新模型';
          models.value = store.state.modalsName;
          modelsName.value = models.value as Array<string>;
          break;
        case 'select-model':
          title.value = '選擇模型';
          break;
        case 'model-library':
          title.value = '模型圖鑑';
          break;
        default:
          break;
      }
      init();
    });

    function selectModel() {
      if (status.value === 'select-model') {
        store.state.selectedModel = {

        };
      } else if (status.value === 'add-model') {
        store.state.selectedModel = {

        };
      }
    }

    return {
      selectedMenu,
      models,
      height: computed(() => store.state.height),
      listMode,
      status,
      title,
      selectModel,
    };
  },
});
</script>

<style lang="scss">
.model-list-wrap {
  .item-wrap {
    &.active {
      background-color: transparent;
    }
    .item-status {
      color: $primary;
      font-size: 20px;
      font-weight: bold;
    }
    > div {
      display: flex;
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
      right: -10px;
      top: -10px;
    }
    .model-frame {
      flex-grow: 1;
    }
    background-color: transparent;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    height: 230px;
    justify-content: space-between;
    overflow: hidden;
    padding: 16px;
    position: relative;
    margin-bottom: 20px;
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
  &.all .header {
    p {
      flex-grow: 1;
      padding-right: 52px;
      text-align: center;
    }
  }
  canvas {
    position: absolute;
    left: 0;
    z-index: -1;
  }
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
