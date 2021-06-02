<template>
  <div class="model-editor-wrap">
    <div class="header">
      <div>
        <button class="btn btn-circle" @click="$router.go(-1)">
          <span class="material-icons">arrow_back</span>
        </button>
        <span class="title">編輯模式</span>
      </div>
      <button class="btn btn-circle" @click="apply">
        <span class="material-icons">check</span>
      </button>
    </div>
    <div id="directionController">
      <div>
        <button class="btn btn-circle" @click="controller('direction', 'behind')">
          <span class="material-icons">arrow_left</span>
        </button>
        <button class="btn btn-circle" @click="controller('direction', 'right')">
          <span class="material-icons">arrow_left</span>
        </button>
      </div>
      <div>
        <button class="btn btn-circle" @click="controller('direction', 'left')">
          <span class="material-icons">arrow_left</span>
        </button>
        <button class="btn btn-circle" @click="controller('direction', 'front')">
          <span class="material-icons">arrow_left</span>
        </button>
      </div>
    </div>
    <div id="rotateController">
      <button class="btn btn-circle" @click="controller('rotate', 'left')">
        <span class="material-icons">rotate_left</span>
      </button>
      <button class="btn btn-circle" @click="controller('rotate', 'right')">
        <span class="material-icons">rotate_right</span>
      </button>
    </div>
    <canvas
      id="editor"
      @click="getMousePos($event)"
      @touchstart="getMousePos($event)"
    ></canvas>
  </div>
</template>

<script lang="ts">
import {
  ref,
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
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { Object3D } from 'three';
import getModelPostion from '@/utils/getModelPosition';
import rendererCreator from '@/utils/rendererCreator';
import { LoadedModel, Model, ModelColor } from '@/types';

export default defineComponent({
  name: 'ModelEditor',
  setup(props) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const targetId = route.params.target;
    const publicPath = ref(process.env.BASE_URL);
    const modelData = ref<Array<Model>>(store.state.userData
      ? store.state.userData.modelData : [store.state.defaultModelData]);
    const canvas = ref<HTMLCanvasElement>();
    const camera = ref<THREE.PerspectiveCamera>();
    const mouse = ref<THREE.Vector2 | null>(null);
    let selectedModel: Object3D | null = null;
    let outlinePass: OutlinePass | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let composer: EffectComposer | null = null;
    let effectFXAA: ShaderPass | null = null;
    let groups: Array<THREE.Object3D> | null = null;
    const scene: THREE.Scene = new THREE.Scene();

    function resize() {
      if (renderer && camera.value && composer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        camera.value.aspect = window.innerWidth / (window.innerHeight);
        camera.value.updateProjectionMatrix();
      }
    }

    function getMousePos(e: MouseEvent | TouchEvent) {
      mouse.value = new THREE.Vector2();
      if (e instanceof TouchEvent) {
        mouse.value.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.value.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        console.log(e.touches[0].clientX, e.touches[0].clientY, '按下');
      } else {
        mouse.value.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.value.y = -(e.clientY / window.innerHeight) * 2 + 1;
        console.log(e, e.clientX, e.clientY, '按下');
      }
    }

    function getModelOverlapState(target: Object3D, uuid: string) {
      console.log(target);
      const targetBox = new THREE.Box3().setFromObject(target as Object3D);
      // const helper = new THREE.Box3Helper(targetBox);
      // scene.add(helper);
      let isOverlap = false;
      if (groups) {
        console.log(groups, uuid);
        groups.forEach((g) => {
          if (uuid !== g.uuid) {
            console.log(g, '其他模型');
            const currentBox = new THREE.Box3().setFromObject(g as Object3D);
            if (targetBox.intersectsBox(currentBox)) {
              console.log('重疊');
              isOverlap = true;
            }
          }
        });
      }
      console.log(isOverlap);
      return isOverlap;
    }

    onMounted(() => {
      canvas.value = document.getElementById('editor') as HTMLCanvasElement;
      renderer = rendererCreator(store.state.gpuTier ? store.state.gpuTier.tier : 0, canvas.value);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer = new EffectComposer(renderer);
      composer.setSize(window.innerWidth, window.innerHeight);

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
          if (mouse.value && outlinePass && groups) {
            raycaster.setFromCamera(mouse.value, camera.value);
            const intersects = raycaster.intersectObjects(groups, true);
            console.log(intersects, mouse.value, scene);
            if (intersects.length > 0) {
              outlinePass.selectedObjects = [intersects[0].object.parent as Object3D];
              selectedModel = intersects[0].object.parent?.parent!;
            } else {
              outlinePass.selectedObjects = [];
              selectedModel = null;
            }
            // const box = new THREE.Box3().setFromObject(selectedModel as Object3D);
            // const helper = new THREE.Box3Helper(box);
            // scene.add(helper);
            console.log(selectedModel);
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
      const loadedModel: LoadedModel = {};
      const modelLen = modelData.value.length;

      /**
       * 模型樣式載入
       */
      function modelStyling(data: Model, obj: THREE.Object3D,
        color: ModelColor | null, colorKeys: Array<string> | null) {
        const threeObj = obj;
        threeObj.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            const mesh = object;
            mesh.castShadow = true;
            if (color && colorKeys) {
              if (colorKeys.indexOf(object.name) >= 0) {
                mesh.material.color = new THREE.Color((color as ModelColor)[object.name]);
              }
            }
          }
        });
        console.log(threeObj);
        threeObj.castShadow = true;
        threeObj.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
        if (modelLen > 1 && groups) {
          const pos = getModelPostion(threeObj, groups);
          threeObj.position.set(pos.x, pos.y, pos.z);
        } else {
          threeObj.position.set(data.position.x, data.position.y, data.position.z);
        }
        threeObj.receiveShadow = false;
      }

      /**
       * 同步載入模型
       */
      async function ModelLoad(i: number) {
        const data = modelData.value[i];
        console.log(data);
        const { color } = modelData.value[i];
        let colorKeys: Array<string> | null = null;
        let threeObj;
        if (color) {
          colorKeys = Object.keys(color);
        }
        if (!loadedModel[data.name]) {
          threeObj = await new Promise((resolve, reject) => {
            loader.load(
              `${publicPath.value}model/${data.name}.gltf`,
              (gltf) => {
                threeObj = gltf.scene;
                threeObj.userData.id = data.id;
                modelStyling(data, threeObj, (color as ModelColor | null), colorKeys);
                console.log(threeObj.userData, '模型資訊');
                resolve(threeObj);
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
          threeObj = loadedModel[data.name].clone();
          threeObj.userData.id = data.id;
          modelStyling(data, threeObj, (color as ModelColor | null), colorKeys);
        }
        scene.add(threeObj as Object3D);
      }

      const result = [];
      let i = 0;
      while (i < modelLen) {
        result.push(ModelLoad(i));
        i += 1;
      }

      Promise.all(result).then(() => {
        groups = scene.children.filter((el) => el.type === 'Group');
        const model = groups.find((obj) => obj.userData.id === targetId);
        console.log(groups);
        render();
        if (outlinePass && model) {
          outlinePass.selectedObjects = [model];
        }
      });
    });

    onUnmounted(() => {
      window.removeEventListener('resize', resize);
      renderer = null;
    });

    function controller(type: string, direction: string) {
      console.log(selectedModel, direction);
      const posUnit = 1.5;
      const rotateUnit = Math.PI / 8;
      if (!selectedModel) {
        return;
      }
      selectedModel.rotation.order = 'YXZ';
      let targetModel = selectedModel.clone(true);
      function setModelTransform() {
        console.log(targetModel, 'tranform');
        const axis = new THREE.Vector3(0, 1, 0);
        if (type === 'rotate') {
          switch (direction) {
            case 'left':
              targetModel.rotateOnWorldAxis(axis, -rotateUnit);
              break;
            case 'right':
              targetModel.rotateOnWorldAxis(axis, rotateUnit);
              break;
            default:
              break;
          }
        } else if (type === 'direction') {
          switch (direction) {
            case 'front':
              axis.set(posUnit, 0, 0);
              break;
            case 'behind':
              axis.set(-posUnit, 0, 0);
              break;
            case 'left':
              axis.set(0, 0, posUnit);
              break;
            case 'right':
              axis.set(0, 0, -posUnit);
              break;
            default:
              break;
          }
          targetModel.position.set(targetModel.position.x += axis.x,
            targetModel.position.y += axis.y, targetModel.position.z += axis.z);
        }
      }
      setModelTransform();
      if (getModelOverlapState(targetModel as Object3D, selectedModel.uuid)) {
        return;
      }
      targetModel = selectedModel;
      setModelTransform();
    }

    async function apply() {
      if (scene && groups) {
        const result: Array<Promise<boolean>> = [];
        store.commit('updateLoadingStr', '場景存檔中');
        store.commit('updateModalLoaded', false);
        store.dispatch('openModal', {
          type: 'loading',
          asynchronous: true,
        });
        groups.forEach((group) => {
          const pos = group.position.toArray();
          const rotation = group.rotation.toArray();
          const id = group.userData?.id;
          console.log(pos, rotation);
          modelData.value.forEach((obj) => {
            const data = obj;
            if (id === data.id) {
              if (pos[0] !== data.position.x || pos[1] !== data.position.y
                || pos[2] !== data.position.z || rotation[0] !== data.rotation.x
                || rotation[1] !== data.rotation.y || rotation[2] !== data.rotation.z) {
                [data.position.x, data.position.y, data.position.z] = pos;
                [data.rotation.x, data.rotation.y, data.rotation.z] = rotation;
                result.push(store.dispatch('updateModelData', {
                  method: 'edit',
                  id,
                  data: JSON.parse(JSON.stringify(data)),
                }));
              }
            }
          });
        });
        Promise.all(result).then((val) => {
          if (val.indexOf(false) === -1) {
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
            router.push('/home');
          }
        });
      }
    }

    return {
      getMousePos,
      mouse,
      controller,
      apply,
    };
  },
});
</script>

<style lang="scss">
.model-editor-wrap {
  .header {
    >div {
      display: flex;
    }
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
    justify-content: space-between;
    margin-top: 24px;
    position: absolute;
  }
  #directionController {
    > div {
      &:nth-of-type(1) {
        button {
          &:nth-of-type(1) {
            transform: rotate(45deg);
          }
          &:nth-of-type(2) {
            transform: rotate(135deg);
          }
        }
      }
      &:nth-of-type(2) {
        button {
          &:nth-of-type(1) {
            transform: rotate(-45deg);
          }
          &:nth-of-type(2) {
            transform: rotate(-135deg);
          }
        }
      }
      button {
        margin: 8px;
      }
      display: flex;
    }
    bottom: 32px;
    display: flex;
    flex-wrap: wrap;
    transform: rotate(45deg);
    position: absolute;
    right: 32px;
    width: 136px;
  }
  #rotateController {
    button {
      margin: 8px;
    }
    bottom: 18px;
    display: flex;
    left: 16px;
    position: absolute;
  }
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
</style>
