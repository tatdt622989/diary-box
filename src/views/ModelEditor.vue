<template>
  <div class="model-preview-wrap">
    <ul class="tool-bar">
      <li>
        <button class="btn btn-circle">
          <span class="material-icons">palette</span>
        </button>
      </li>
      <li>
        <button class="btn btn-circle">
          <span class="material-icons">done</span>
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
  reactive,
  onMounted,
  computed,
  nextTick,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import store from '@/store';

export default defineComponent({
  name: 'ModelPreview',
  components: {
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const publicPath = ref(process.env.BASE_URL);
    console.log(route.params.ts);
    let renderer: THREE.WebGLRenderer | null = null;
    const scene: THREE.Scene = new THREE.Scene();
    let canvas: HTMLCanvasElement;
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / (window.innerHeight - 66),
      0.1,
      10000,
    );
    let controls: OrbitControls;

    console.log(route.params);
    if (!route.params.status) {
      router.push('/');
    }

    onMounted(() => {
      canvas = document.getElementById('modelPreviewer') as HTMLCanvasElement;
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene.background = new THREE.Color(0x449966);

      camera.position.set(30, 10, 0);
      camera.zoom = 1;

      controls = new OrbitControls(camera, canvas);
      controls.autoRotate = true;
      controls.autoRotateSpeed = 3;
      controls.enabled = false;
      controls.target = new THREE.Vector3(0, 1.8, 0);
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
      const pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
      scene.add(pointLightHelper);

      // 霧
      scene.fog = new THREE.Fog(0x449966, 1, 150);

      const loader = new GLTFLoader();
      if (store.state.userData) {
        const { modelData } = store.state.userData;
        const len = modelData.length;
        loader.load(
          `${publicPath.value}model/${modelData[len - 1].name}.gltf`,
          (gltf) => {
            const model = gltf.scene;
            console.log(model);
            model.traverse((object) => {
              if (object instanceof THREE.Mesh) {
                const mesh = object;
                mesh.castShadow = true;
              }
            });
            model.castShadow = true;
            model.position.set(modelData[len - 1].position.x,
              modelData[len - 1].position.y, modelData[len - 1].position.z);
            model.receiveShadow = false;
            console.log(model);
            scene.add(model);
            // render();
          },
          (xhr) => {
            console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
          },
          (error) => {
            console.log('An error happened');
          },
        );
      }
    });

    return {

    };
  },
});
</script>

<style lang="scss" scoped>
</style>
