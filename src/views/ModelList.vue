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
              <div class="model-frame"></div>
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
import { Model, SceneData } from '@/types';

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
    const models = ref<Array<string | Model>>([]);
    const selectedMenu = ref<Array<string>>([]);
    const listMode = ref<string>('using');
    const status = ref<string>('');
    const title = ref<string>('所有模型');
    const publicPath = ref(process.env.BASE_URL);
    const modelsName = ref<Array<string>>([]);

    async function init() {
      await nextTick();
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight - 66);

      function createScene(el: HTMLElement) {
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
      let i = 0;
      let el = document.getElementById(`scene${i}`) as HTMLElement;
      while (i < modelLen) {
        el = document.getElementById(`scene${i}`) as HTMLElement;
        console.log(el);
        const sceneData: SceneData = createScene(el);
        sceneData.camera.aspect = window.innerWidth / (window.innerHeight - 66);
        sceneData.camera.updateProjectionMatrix();
        const {
          left, right, top, bottom, width, height,
        } = sceneData.el.getBoundingClientRect();
        loader.load(
          `${publicPath.value}model/${modelsName.value[i]}.json`,
          (gltf) => {
            const model = gltf;
            console.log(gltf);
            sceneData.scene.add(gltf);
            model.castShadow = true;
            gltf.position.set(gltf.position.x, gltf.position.y, gltf.position.z);
            model.receiveShadow = false;
            const render = function () {
              renderer.render(sceneData.scene, sceneData.camera);
              requestAnimationFrame(render);
            };
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
      const resize = function () {
        renderer.setSize(window.innerWidth, window.innerHeight - 66);
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
      background-color: $secondary;
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
    background-color: #d4dbba;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    height: 230px;
    justify-content: space-between;
    padding: 16px;
    position: relative;
    margin-bottom: 20px;
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
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
