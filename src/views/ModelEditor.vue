<template>
  <div class="model-editor-wrap">
    <div class="header">
      <button class="btn btn-circle" @click="$router.go(-1)">
        <span class="material-icons">arrow_back</span>
      </button>
      <span class="title">編輯模式</span>
    </div>
    <canvas id="editor" @click="getMousePos($event)" @touchstart="getMousePos($event)"></canvas>
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
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Object3D } from 'three';

export default defineComponent({
  name: 'ModelEditor',
  setup(props) {
    const store = useStore();
    const publicPath = ref(process.env.BASE_URL);
    const { modelData } = store.state;
    const canvas = ref<HTMLCanvasElement>();
    const camera = ref<THREE.PerspectiveCamera>();
    const mouse = ref<THREE.Vector2 | null>(null);
    let outlinePass: OutlinePass | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let composer: EffectComposer | null = null;
    let effectFXAA: ShaderPass | null = null;

    function resize() {
      if (renderer && camera.value && composer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        camera.value.aspect = window.innerWidth / (window.innerHeight);
        camera.value.updateProjectionMatrix();
        camera.value.updateProjectionMatrix();
      }
    }

    function getMousePos(e: MouseEvent) {
      mouse.value = new THREE.Vector2();
      mouse.value.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.value.y = -(e.clientY / window.innerHeight) * 2 + 1;
      console.log(mouse.value, e.clientX, e.clientY, '按下');
    }

    onMounted(() => {
      canvas.value = document.getElementById('editor') as HTMLCanvasElement;
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas.value,
      });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer = new EffectComposer(renderer);
      composer.setSize(window.innerWidth, window.innerHeight);

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

      // 取得滑鼠位置模型
      const raycaster = new THREE.Raycaster();
      const renderPass = new RenderPass(scene, camera.value);
      composer.addPass(renderPass);

      outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth,
        window.innerHeight), scene, camera.value);
      composer.addPass(outlinePass);

      effectFXAA = new ShaderPass(FXAAShader);
      effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
      composer.addPass(effectFXAA);

      function render() {
        if (renderer && camera.value) {
          requestAnimationFrame(render);
          if (mouse.value && outlinePass) {
            raycaster.setFromCamera(mouse.value, camera.value);
            const group = scene.children.filter((obj) => obj.type === 'Group');
            console.log(group);
            const intersects = raycaster.intersectObjects(group, true);
            console.log(intersects, mouse.value, scene);
            if (intersects.length > 0) {
              outlinePass.selectedObjects = [intersects[0].object.parent as Object3D];
            } else {
              outlinePass.selectedObjects = [];
            }
            mouse.value = null;
          }
          controls.update();
          if (composer) {
            composer.render();
          }
          // renderer.render(scene, camera.value);
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
      renderer = null;
    });

    return {
      getMousePos,
      mouse,
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
