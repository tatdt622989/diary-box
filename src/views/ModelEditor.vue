<template>
  <div class="model-editor-wrap">
    <div class="header">
      <button class="btn btn-circle" @click="$router.go(-1)">
        <span class="material-icons">arrow_back</span>
      </button>
      <span class="title">編輯模式</span>
    </div>
    <canvas id="editor"></canvas>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  onUnmounted,
  computed,
} from 'vue';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'ModelEditor',
  setup(props) {
    const store = useStore();
    const publicPath = ref(process.env.BASE_URL);
    const { modelData } = store.state;
    const canvas = ref<HTMLCanvasElement>();
    const renderer = ref<THREE.WebGLRenderer | null>();
    const camera = ref<THREE.PerspectiveCamera>();

    function resize() {
      if (renderer.value && camera.value) {
        renderer.value.setSize(window.innerWidth, window.innerHeight);
        camera.value.aspect = window.innerWidth / (window.innerHeight);
        camera.value.updateProjectionMatrix();
      }
    }

    onMounted(() => {
      canvas.value = document.getElementById('editor') as HTMLCanvasElement;
      renderer.value = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas.value,
      });
      renderer.value.shadowMap.enabled = true;
      renderer.value.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.value.setSize(window.innerWidth, window.innerHeight);
      // const composer = new EffectComposer(renderer);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x449966);

      // 相機
      camera.value = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / (window.innerHeight - 66),
        0.1,
        10000,
      );
      camera.value.position.set(30, 10, 0);
      camera.value.zoom = 1;

      // 控制器
      const controls: MapControls = new MapControls(camera.value, canvas.value);
      controls.target = new THREE.Vector3(0, 5, 0);
      controls.dampingFactor = 0.05;
      controls.enableDamping = true;
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
        if (renderer.value && camera.value) {
          controls.update();
          requestAnimationFrame(render);
          renderer.value.render(scene, camera.value);
        }
      }

      const loader = new GLTFLoader();

      const modelLen = modelData.length;
      let i = 0;
      while (i < modelLen) {
        const data = modelData[i];
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
      window.addEventListener('resize', resize, false);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', resize);
      renderer.value = null;
    });

    return {

    };
  },
});
</script>

<style lang="scss">
  .model-editor-wrap {
    .header {
      .title {
        border-radius: 999px;
        border: 2px solid $secondary;
        color: $secondary;
        font-size: 20px;
        font-weight: bold;
        height: 52px;
        line-height: 52px;
        margin-left: 16px;
        width: 120px;
      }
      display: flex;
      justify-content: flex-start;
      margin-top: 24px;
      position: absolute;
    }
    display: flex;
    flex-direction: column;
    position: relative;
  }
</style>
