<template>
  <div class="model-preview-wrap">
    <button
      class="return-btn btn btn-circle btn-primary"
      v-if="$route.params.status === 'preview'"
      @click="$router.go(-1)"
    >
      <span class="material-icons">arrow_back</span>
    </button>
    <ul class="tool-bar" v-if="$route.params.status !== 'preview'">
      <li v-for="(area, i) in selectedModelArea" :key="i">
        <input
          type="color"
          :id="area"
          v-model="modelColor[area]"
          @input="changeModelColor"
        />
        <label class="btn btn-circle" :for="area">
          <span class="material-icons">palette</span>
        </label>
      </li>
      <li>
        <button class="btn btn-circle" @click="apply">
          <span class="material-icons">done</span>
        </button>
      </li>
      <li>
        <button class="btn btn-circle" @click="$router.push('/model-list')">
          <span class="material-icons">close</span>
        </button>
      </li>
    </ul>
    <canvas id="modelPreviewer"></canvas>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  computed,
  onUnmounted,
  nextTick,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import store from '@/store';
import { Model, ModelColor, Product } from '@/types';
import { Mesh, Object3D } from 'three';

export default defineComponent({
  name: 'ModelEditor',
  components: {
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const publicPath = ref(process.env.BASE_URL);
    const selectedModel = ref<Model | null>(null);
    const modelColor = ref<ModelColor>({});
    const modelFormat = computed(() => store.state.modelFormat);
    const modelData = computed(() => store.state.userData.modelData);
    const selectedModelArea = ref<Array<string>>([]);
    console.log(route.params.ts);
    let renderer: THREE.WebGLRenderer | null = null;
    const scene: THREE.Scene = new THREE.Scene();
    let canvas: HTMLCanvasElement;
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / (window.innerHeight),
      0.1,
      10000,
    );
    let controls: OrbitControls;
    console.log(route.params);
    const { status } = route.params;
    let model: THREE.Group;
    let animation: number;

    onMounted(async () => {
      await nextTick();
      let times = 0;
      const closeModal = setInterval(() => {
        if (times > 50 || store.state.modalLoaded) {
          store.commit('closeModal');
          clearInterval(closeModal);
        }
        times += 1;
      }, 100);
      let index: number;
      const len = modelData.value.length;
      if (status === 'new') {
        index = len - 1;
      } else if (status === 'old' || status === 'preview') {
        index = Number(route.params.index);
      } else {
        return router.push('/model-list');
      }
      selectedModel.value = modelData.value[index];
      if (modelFormat.value) {
        modelColor.value = JSON.parse((JSON.stringify(
          modelFormat.value[selectedModel.value.name],
        )));
      }
      if (modelFormat.value !== null) {
        console.log(selectedModel.value);
        const productKeys = Object.keys(modelFormat.value);
        productKeys.forEach((key) => {
          console.log(key);
          if (modelFormat.value !== null && selectedModel.value
            && key === selectedModel.value.name) {
            const areas = Object.keys(modelFormat.value[key].color);
            selectedModelArea.value = areas;
          }
        });
      }
      canvas = document.getElementById('modelPreviewer') as HTMLCanvasElement;
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene.background = new THREE.Color(0x449966);

      camera.position.set(30, 10, 0);
      camera.zoom = 2;

      controls = new OrbitControls(camera, canvas);
      controls.target = new THREE.Vector3(0, 1.8, 0);
      controls.enablePan = false;
      controls.update();

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

      // 霧
      scene.fog = new THREE.Fog(0x449966, 1, 150);

      function render() {
        if (renderer) {
          animation = requestAnimationFrame(render);
          controls.update();
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        }
      }
      const loader = new GLTFLoader();
      loader.load(
        `${publicPath.value}model/${selectedModel.value.name}.gltf`,
        (gltf) => {
          model = gltf.scene;
          const { color } = selectedModel.value!;
          let colorKeys: Array<string> | null = null;
          if (color) {
            colorKeys = Object.keys(color);
          }
          console.log(model);
          model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              const mesh = object;
              if (color && colorKeys) {
                console.log(color);
                if (colorKeys.indexOf(object.name) >= 0) {
                  mesh.material.color = new THREE.Color((color as ModelColor)[object.name]);
                }
              }
              mesh.castShadow = true;
            }
          });
          model.castShadow = true;
          model.position.set(0, 0, 0);
          model.receiveShadow = false;
          console.log(model);
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
      return false;
    });

    function changeModelColor() {
      console.log('顏色更換');
      if (model) {
        model.traverse((object) => {
          if (object instanceof THREE.Mesh
            && selectedModelArea.value.indexOf(object.name) >= 0) {
            const mesh = object;
            const color = modelColor.value[mesh.name];
            console.log(color);
            if (color) {
              mesh.material.color = new THREE.Color(color);
            }
          }
        });
      }
    }

    function apply() {
      if (selectedModel.value) {
        selectedModel.value.color = modelColor.value;
        console.log(JSON.parse(JSON.stringify(selectedModel.value)));
        store.commit('updateLoadingStr', '模型存檔中');
        store.commit('updateModalLoaded', false);
        store.dispatch('openModal', {
          type: 'loading',
          asynchronous: true,
        });
        store.dispatch('updateModelData', {
          method: 'edit',
          id: selectedModel.value.id,
          data: JSON.parse(JSON.stringify(selectedModel.value)),
        }).then((res) => {
          if (res) {
            store.dispatch('updateToast', {
              type: 'success',
              content: '編輯成功',
            });
            let times = 0;
            const closeModal = setInterval(() => {
              if (times > 50 || store.state.modalLoaded) {
                store.commit('closeModal');
                clearInterval(closeModal);
              }
              times += 1;
            }, 100);
            if (status === 'new' && selectedModel.value) {
              router.push({
                name: 'SceneEditor',
                params: {
                  target: selectedModel.value.id,
                },
              });
            } else if (status === 'old') {
              router.push('/model-list');
            }
          }
        });
      }
    }

    function resize() {
      if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / (window.innerHeight);
        camera.updateProjectionMatrix();
      }
    }

    window.addEventListener('resize', resize, false);

    onUnmounted(() => {
      window.removeEventListener('resize', resize);
      if (scene && controls && renderer && animation) {
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
        cancelAnimationFrame(animation);
        renderer.dispose();
        renderer.forceContextLoss();
        renderer = null;
      }
    });

    return {
      apply,
      changeModelColor,
      modelColor,
      modelData,
      selectedModelArea,
      selectedModel,
      userData: computed(() => store.state.userData),
    };
  },
});
</script>

<style lang="scss" scoped>
.tool-bar {
  li {
    margin-bottom: 12px;
  }
  input[type="color"] {
    height: 0;
    width: 0;
    opacity: 0;
    position: absolute;
    z-index: 1;
  }
  label {
    z-index: 2;
  }
  position: absolute;
  right: 16px;
  top: 24px;
}
.model-preview-wrap {
  canvas {
    cursor: grab;
    display: block;
  }
  position: relative;
  overflow: hidden;
}
.return-btn {
  position: absolute;
  left: 16px;
  top: 24px;
}
</style>
