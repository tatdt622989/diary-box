<template>
  <div class="model-editor-wrap">
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
} from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'ModelEditor',
  setup(props) {
    const mainScene = ref<HTMLElement | null>(null);
    const publicPath = ref(process.env.BASE_URL);

    onMounted(() => {
      const store = useStore();
      const router = useRouter();
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight - 66);
      // const composer = new EffectComposer(renderer);
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

      // 控制器
      let controls: OrbitControls;
      if (mainScene.value) {
        // 到這裡mainScene.value就一定不是null就不會報錯
        mainScene.value.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, mainScene.value);
        controls.target = new THREE.Vector3(0, 5, 0);
        controls.dampingFactor = 0.05;
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI / 2.5;
      }

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
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(100, 250, 0);
      directionalLight.castShadow = true;
      directionalLight.shadow.radius = 20;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.camera.near = 1.75;
      directionalLight.shadow.camera.far = 1000;
      scene.add(directionalLight);
      const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
      scene.add(directionalLightHelper);

      // 霧
      scene.fog = new THREE.Fog(0x449966, 1, 150);

      function render() {
        controls.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
      }

      const loader = new THREE.ObjectLoader();

      const model = store.state.selectedModel;
      loader.load(
        `${publicPath.value}model/${model.name}.json`,
        (gltf) => {
          const object = gltf;
          console.log(object);
          scene.add(object);
          directionalLight.target = object;
          object.castShadow = true;
          object.position.set(model.position.x, model.position.y, model.position.z);
          object.receiveShadow = false;
          const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
          scene.add(helper);
          render();
        },
        (xhr) => {
          console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
          console.log('An error happened');
        },
      );
    });
    return {

    };
  },
});
</script>
