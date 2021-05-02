<template>
  <div class="main-wrap store-wrap">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/model-list')">
        <span class="material-icons">arrow_back</span>
      </button>
      <p>解鎖模型</p>
    </div>
    <div class="content">
      <div class="currency">
        <span>999</span>
        <span class="material-icons">monetization_on</span>
      </div>
      <div class="products container-fluid">
        <div class="row">
          <div
            class="item col-6 col-md-4 col-lg-3"
            v-for="(item, i) in modalsName"
            :key="i"
          >
            <div class="item-wrap">
              <div class="product" :id="'scene' + i"></div>
              <div class="w-100">
                <button class="price">
                  <span>999</span>
                  <span class="material-icons">monetization_on</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Menu></Menu>
    <canvas id="products"></canvas>
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
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Navbar from '@/components/Navbar.vue';
import Menu from '@/components/Menu.vue';
import FunctionBar from '@/components/FunctionBar.vue';
import { SceneData, Model } from '@/types';

export default defineComponent({
  name: 'Store',
  components: {
    Navbar,
    Menu,
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

    async function init() {
      await nextTick();
      console.log('init-start');
      const canvas = document.querySelector('#products') as HTMLCanvasElement;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
      });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight);

      function createScene(el: HTMLElement) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xF8EBCF);
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
        camera.zoom = 1.8;
        const controls = new OrbitControls(camera, el);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 3;
        controls.enabled = false;
        controls.update();

        // 燈光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xF8EBCF, 0.8, 10000);
        pointLight.position.set(0, 7, 5);
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
        return {
          scene, camera, el, controls,
        };
      }
      const loader = new GLTFLoader();
      const modelLen = store.state.modalsName.length;
      console.log(modelLen);
      let i = 0;
      const loadResult: Array<Promise<SceneData>> = [];
      while (i < modelLen) {
        const el = document.getElementById(`scene${i}`) as HTMLElement;
        console.log(el);
        const sceneData: SceneData = createScene(el);
        const asyncLoad = (index: number) => new Promise<SceneData>((resolve) => {
          loader.load(
            `${publicPath.value}model/${store.state.modalsName[index]}.gltf`,
            (gltf) => {
              const model = gltf.scene.children[0];
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
        const render = function () {
          requestAnimationFrame(render);
          canvas.style.transform = `translateY(${window.scrollY}px)`;
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
        };
        render();
      });
      const resize = function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', resize, false);
    }

    onMounted(() => {
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
      modalsName: computed(() => store.state.modalsName),
      listMode,
      status,
      title,
      selectModel,
    };
  },
});
</script>

<style lang="scss">
.store-wrap {
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
  .header {
    p {
      flex-grow: 1;
      padding-right: 52px;
      text-align: center;
    }
  }
  .content {
    align-items: center;
    padding: 0;
    flex-grow: 1;
  }
  .products {
    padding: 16px;
    padding-top: 0;
  }
  .item {
    margin-bottom: 32px;
  }
  .item-wrap {
    .price {
      .material-icons {
        color: $secondary;
        font-size: 32px;
        margin-right: 10px;
      }
      span:not(.material-icons) {
        color: $secondary;
        flex-grow: 1;
        font-size: 24px;
        font-weight: bold;
      }
      align-items: center;
      border: 2px solid $secondary;
      border-radius: 999px;
      background-color: transparent;
      display: flex;
      height: 52px;
      justify-content: center;
      width: 100%;
      padding: 0;
      margin-top: 16px;
    }
    .product {
      flex-grow: 1;
      width: 100%;
    }
    align-items: center;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    height: 280px;
    padding: 0px;
    position: relative;
  }
  canvas {
    position: absolute;
    left: 0;
    z-index: -1;
    top: 0;
  }
  display: flex;
  flex-direction: column;
}
</style>
