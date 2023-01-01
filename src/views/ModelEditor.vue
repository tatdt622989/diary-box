<template>
  <div class="model-preview-wrap" :style="{ height }">
    <button
      class="return-btn btn btn-circle btn-primary"
      v-if="$route.params.status === 'preview'"
      @click="$router.go(-1)"
    >
      <span class="material-icons">arrow_back</span>
    </button>
    <ul class="tool-bar" v-if="$route.params.status !== 'preview'">
      <li v-for="(val, key, i) in modelColor" :key="i">
        <input
          type="color"
          :id="key"
          v-model="modelColor[key]"
          @input="changeModelColor"
        />
        <label class="btn btn-circle" :for="key">
          <span class="material-icons">palette</span>
        </label>
      </li>
      <li v-for="(val, key, i) in modelTexture" :key="i">
        <button
          class="btn btn-circle"
          @click="
            selectedTexture = key;
            openCanvasSelector();
          "
        >
          <span class="material-icons">image</span>
        </button>
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
    <CanvasSelector @apply-canvas="updateTextureData"></CanvasSelector>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  computed,
  onUnmounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import store from '@/store';
import { Model, ModelColor, Product } from '@/types';
import CanvasSelector from '@/components/CanvasSelector.vue';
import rendererCreator from '@/utils/rendererCreator';

export default defineComponent({
  name: 'ModelEditor',
  components: {
    CanvasSelector,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const publicPath = ref(process.env.BASE_URL);
    const selectedModel = ref<Model | null>(null);
    const modelColor = ref<ModelColor>({});
    const modelTexture = ref<ModelColor>({});
    const modelFormat = computed(() => store.state.modelFormat);
    const modelData = computed(() => store.state.userData.modelData);
    const selectedTexture = ref<string>();
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
    const { status } = route.params;
    let model: THREE.Group;
    let animation: number;

    function changeModelColor() {
      if (model) {
        model.traverse((object) => {
          const keys = Object.keys(modelColor.value);
          if (object instanceof THREE.Mesh
            && keys.indexOf(object.name) >= 0) {
            const mesh = object;
            const color = modelColor.value[mesh.name];
            if (color) {
              mesh.material.color = new THREE.Color(color);
            }
          }
        });
      }
    }

    async function changeTexture() {
      const keys = Object.keys(modelTexture.value);
      const len = keys.length;
      let i = 0;
      const result = [];

      async function loadTexture(URL: string, key: string) {
        if (model) {
          // 將圖片裁切後再縮放到1024*1024
          const img = new Image();
          const frame = document.createElement('canvas');
          const ctx: CanvasRenderingContext2D = frame.getContext('2d')!;
          img.src = URL;
          img.crossOrigin = 'anonymous';
          const res: Event = await new Promise((resolve, reject) => {
            img.addEventListener('load', resolve, false);
            img.addEventListener('error', resolve, false);
          });
          // console.log(res);
          if (res.type === 'error') {
            return null;
          }
          let baseSize = 0;
          if (img.width > img.height) {
            baseSize = img.width;
          } else if (img.height > img.width) {
            baseSize = img.height;
          }
          frame.width = baseSize;
          frame.height = baseSize;
          ctx.drawImage(img, frame.width / 2 - img.width / 2, frame.height / 2 - img.height / 2);
          const resFrame = document.createElement('canvas');
          const resCtx: CanvasRenderingContext2D = resFrame.getContext('2d')!;
          resFrame.width = 1024;
          resFrame.height = 1024;
          resCtx.fillStyle = '#fff';
          resCtx.fillRect(0, 0, 1024, 1024);
          resCtx.drawImage(frame, 0, 0, 1024, 1024);
          // console.log(resFrame.toDataURL());
          // 圖片載入材質
          const texture: any = await new Promise<any>((resolve, reject) => {
            new THREE.TextureLoader().load(resFrame.toDataURL(), (t) => {
              resolve(t);
            }, (err) => {
              reject(err);
            });
          });
            // 材質貼入模型
          model.traverse((object) => {
            if (object instanceof THREE.Mesh
                && key === object.material.name) {
              const mesh = object;
              texture.flipY = false;
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              switch (model.children[0].name) {
                case 'album':
                  texture.repeat.set(0.75, 1);
                  break;
                case 'screen':
                  texture.repeat.set(1, 0.8);
                  break;
                default:
                  break;
              }
              mesh.material.map = texture;
            }
          });
        }
        return true;
      }

      while (i < len) {
        if (modelTexture.value[keys[i]]) {
          const URL = modelTexture.value[keys[i]];
          result.push(loadTexture(URL, keys[i]));
        }
        i += 1;
      }

      await Promise.all(result).then();
    }

    async function updateTextureData(URL: string) {
      if (selectedTexture.value) {
        modelTexture.value[selectedTexture.value] = URL;
      }
      changeTexture();
    }

    onMounted(async () => {
      await nextTick();
      // 關閉已開啟視窗
      let times = 0;
      const closeModal = setInterval(() => {
        if (times > 50 || store.state.modalLoaded) {
          store.commit('closeModal');
          clearInterval(closeModal);
        }
        times += 1;
      }, 100);

      // 選取模型
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

      // 取得模型各部位樣式
      if (modelFormat.value) {
        modelColor.value = JSON.parse((JSON.stringify(
          modelFormat.value[selectedModel.value.name].color,
        )));
        const selectedColorKeys = selectedModel.value.color
          ? Object.keys(selectedModel.value.color) : [];
        selectedColorKeys.forEach((key) => {
          modelColor.value[key] = selectedModel.value!.color[key];
        });
        modelTexture.value = modelFormat.value[selectedModel.value.name].texture
          ? JSON.parse((JSON.stringify(
            modelFormat.value[selectedModel.value.name].texture,
          ))) : {};
        const selectedTextureKeys = selectedModel.value.texture
          ? Object.keys(selectedModel.value.texture) : [];
        selectedTextureKeys.forEach((key) => {
          if (selectedModel.value && selectedModel.value.texture) {
            modelTexture.value[key] = selectedModel.value.texture[key];
          }
        });
      }
      canvas = document.getElementById('modelPreviewer') as HTMLCanvasElement;
      renderer = rendererCreator(1, canvas, !!store.state.gpuTier?.isMobile);
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
      directionalLight.position.set(5, 10, 3);
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
        `${publicPath.value}model/${selectedModel.value.name}.gltf?v=1.2`,
        (gltf) => {
          model = gltf.scene;
          model.castShadow = true;
          model.position.set(0, 0, 0);
          model.receiveShadow = false;
          changeModelColor();
          changeTexture();
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

    function openCanvasSelector() {
      store.dispatch('openModal', {
        type: 'canvasSelector',
        asynchronous: false,
      });
    }

    function apply() {
      if (selectedModel.value) {
        let keys = Object.keys(modelColor.value);
        keys.forEach((area: string) => {
          if (selectedModel.value) {
            if ((selectedModel.value.color && modelColor.value[area as any])) {
              selectedModel.value.color[area] = modelColor.value[area as any];
            } else if (!selectedModel.value.color) {
              selectedModel.value.color = {};
              selectedModel.value.color[area] = modelColor.value[area as any];
            }
          }
        });
        keys = Object.keys(modelTexture.value);
        keys.forEach((area: string) => {
          if (selectedModel.value) {
            if ((selectedModel.value.texture && modelTexture.value[area as any])) {
              selectedModel.value.texture[area] = modelTexture.value[area as any];
            } else if (!selectedModel.value.texture) {
              selectedModel.value.texture = {};
              selectedModel.value.texture[area] = modelTexture.value[area as any];
            }
          }
        });
        store.dispatch('openModal', {
          type: 'loading',
          loadingStr: '模型存檔中',
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
              times += 1;
            }, 100);
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

    onBeforeUnmount(() => {
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
      selectedModel,
      userData: computed(() => store.state.userData),
      changeTexture,
      selectedTexture,
      openCanvasSelector,
      modelTexture,
      height: computed(() => store.state.height),
      updateTextureData,
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
