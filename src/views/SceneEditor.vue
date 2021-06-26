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
    <p class="hint">{{ hint }}</p>
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
import { Camera, Event, Object3D } from 'three';
import modelOverlapping from '@/utils/modelOverlapping';
import rendererCreator from '@/utils/rendererCreator';
import getModelOverlapState from '@/utils/getModelOverlapState';
import getModelPosition from '@/utils/getModelPosition';
import { LoadedModel, Model, ModelColor } from '@/types';

export default defineComponent({
  name: 'SceneEditor',
  setup(props) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const targetId = route.params.target;
    const publicPath = ref(process.env.BASE_URL);
    const hint = ref('請選擇模型開始編輯');
    const modelData = store.state.userData
      ? computed(() => store.state.userData.modelData)
      : ref<Array<Model>>([store.state.defaultModelData]);
    const canvas = ref<HTMLCanvasElement>();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / (window.innerHeight - 66),
      0.1,
      10000,
    );
    const mouse = ref<THREE.Vector2 | null>(null);
    let selectedModel: Object3D | null = null;
    let outlinePass: OutlinePass | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let composer: EffectComposer | null = null;
    let effectFXAA: ShaderPass | null = null;
    let groups: Array<THREE.Object3D> | null = null;
    const scene: THREE.Scene = new THREE.Scene();
    const overlapping = ref<Array<Array<THREE.Object3D>> | null>(null);
    const raycaster = new THREE.Raycaster();

    scene.background = new THREE.Color(0x449966);

    // 相機
    camera.position.set(40, 30, 0);
    camera.zoom = 1;

    // 地板
    const planeGeometry = new THREE.PlaneGeometry(600, 600, 32);
    const texture = new THREE.TextureLoader().load(`${publicPath.value}images/grid.png`, (obj) => {
      const t = obj;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.offset.set(0, 0.492);
      t.repeat.set(6, 6);
    });
    const planeMaterial = new THREE.MeshStandardMaterial(
      { color: '#929292', side: THREE.DoubleSide, map: texture },
    );
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.name = 'plane';
    plane.rotateX(Math.PI / 2);
    plane.receiveShadow = true;
    scene.add(plane);
    const pointer = new THREE.Vector2();
    let planePoint: THREE.Vector3;

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
    // const pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
    // scene.add(pointLightHelper);

    // 霧
    scene.fog = new THREE.Fog(0x449966, 1, 300);

    onMounted(() => {
      canvas.value = document.getElementById('editor') as HTMLCanvasElement;
      renderer = rendererCreator(store.state.gpuTier ? store.state.gpuTier.tier : 0, canvas.value);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer = new EffectComposer(renderer);
      composer.setSize(window.innerWidth, window.innerHeight);

      // 取得滑鼠位置模型
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth,
        window.innerHeight), scene, camera);
      composer.addPass(outlinePass);

      effectFXAA = new ShaderPass(FXAAShader);
      effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
      composer.addPass(effectFXAA);

      // 控制器
      const controls: MapControls = new MapControls(camera, canvas.value);
      controls.target = new THREE.Vector3(0, 5, 0);
      // controls.dampingFactor = 0.03;
      controls.enableDamping = true;
      controls.enableRotate = false;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI / 2.5;

      function render() {
        if (renderer) {
          requestAnimationFrame(render);
          if (mouse.value && outlinePass && groups) {
            raycaster.setFromCamera(mouse.value, camera);
            const intersects = raycaster.intersectObjects(groups, true);
            console.log(intersects, mouse.value, scene);
            if (intersects.length > 0
              && intersects[0].object.parent?.parent!.uuid !== selectedModel?.uuid) {
              outlinePass.selectedObjects = [intersects[0].object.parent as Object3D];
              selectedModel = intersects[0].object.parent?.parent!;
              hint.value = '點擊空白處和控制按鈕修改模型位置及旋轉角度，點擊選中模型取消選取';
              // const helper = new THREE.Box3Helper(new THREE.Box3().setFromObject(selectedModel));
              // scene.add(helper);
            } else {
              outlinePass.selectedObjects = [];
              selectedModel = null;
              hint.value = '請選擇模型開始編輯';
            }
            mouse.value = null;
          }
          controls.update();
          if (composer) {
            composer.render();
          }
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
              if (colorKeys.indexOf(object.name) >= 0 && color[object.name]) {
                mesh.material.color = new THREE.Color((color as ModelColor)[object.name]);
              }
            }
          }
        });
        threeObj.castShadow = true;
        threeObj.position.set(data.position.x, data.position.y, data.position.z);
        threeObj.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
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
              `${publicPath.value}model/${data.name}.gltf?v=1.0`,
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
        if (!modelData.value[i].passive) {
          result.push(ModelLoad(i));
        }
        i += 1;
      }

      Promise.all(result).then(() => {
        groups = scene.children.filter((el) => el.type === 'Group');
        if (modelLen > 1 && groups) {
          overlapping.value = modelOverlapping(groups) as Array<Array<THREE.Object3D>>;
          console.log('取得模型重疊狀態', overlapping.value);
          overlapping.value.forEach((ary) => {
            const target = ary[0];
            getModelPosition(groups!, target);
          });
        }
        const model = groups.find((obj) => obj.userData.id === Number(targetId));
        console.log(model, '框選目標', groups);
        if (outlinePass && model) {
          outlinePass.selectedObjects = [model];
          selectedModel = model;
        }

        render();
      });
    });

    function controller(type: string, direction: string) {
      console.log(selectedModel, direction);
      const posUnit = 1;
      const rotateUnit = Math.PI / 8;
      if (!selectedModel && type !== 'point') {
        store.dispatch('updateToast', {
          type: 'hint',
          content: '請先選擇模型',
        });
        return;
      }
      function setModelTransform(model: THREE.Object3D) {
        const targetModel = model;
        console.log(type, targetModel, 'tranform');
        const axis = new THREE.Vector3(0, 1, 0);
        if (type === 'rotate') {
          switch (direction) {
            case 'left':
              targetModel.rotateOnWorldAxis(axis, rotateUnit);
              break;
            case 'right':
              targetModel.rotateOnWorldAxis(axis, -rotateUnit);
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
            0, targetModel.position.z += axis.z);
        } else if (type === 'point' && planePoint) {
          console.log(planePoint);
          axis.set(planePoint.x, 0, planePoint.z);
          targetModel.position.set(axis.x, 0, axis.z);
        }
      }
      if (selectedModel) {
        selectedModel.rotation.order = 'YXZ';
        let targetModel = selectedModel.clone(true);
        let currentIsOverlap = false;
        if (groups) {
          overlapping.value = modelOverlapping(groups) as Array<Array<THREE.Object3D>>;
          overlapping.value.forEach((ary) => {
            if (ary[0].uuid === selectedModel?.uuid || ary[1].uuid === selectedModel?.uuid) {
              currentIsOverlap = true;
            }
          });
        }
        console.log(currentIsOverlap, overlapping.value);
        if (!currentIsOverlap && groups) {
          setModelTransform(targetModel);
          if (getModelOverlapState(groups, targetModel as Object3D, selectedModel.uuid)) {
            return;
          }
        }
        targetModel = selectedModel;
        setModelTransform(targetModel);
      }
    }

    function onPointerClick(e: Event, pos: any) {
      console.log(pos);
      if (renderer && camera && mouse.value && groups) {
        pointer.x = (pos.x / renderer.domElement.clientWidth) * 2 - 1;
        pointer.y = -(pos.y / renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera as any);
        const intersects = raycaster.intersectObjects(
          [plane as THREE.Object3D, ...groups], true,
        );
        console.log('與平面相交', intersects, groups);
        if (intersects[0].object.name !== 'plane') {
          return;
        }
        planePoint = intersects[0].point;
        controller('point', '');
      }
    }

    function getMousePos(e: any) {
      console.log(e);
      mouse.value = new THREE.Vector2();
      let pos;
      if (window.TouchEvent && e instanceof TouchEvent) {
        mouse.value.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.value.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        pos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        console.log(e.touches[0].clientX, e.touches[0].clientY, '按下');
      } else {
        mouse.value.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.value.y = -(e.clientY / window.innerHeight) * 2 + 1;
        pos = {
          x: e.clientX,
          y: e.clientY,
        };
        console.log(e, e.clientX, e.clientY, '按下');
      }
      onPointerClick(e, pos);
    }

    async function apply() {
      if (scene && groups) {
        const result: Array<Promise<boolean>> = [];
        store.commit('updateLoadingStr', '場景存檔中');
        store.dispatch('openModal', {
          type: 'loading',
          asynchronous: true,
        });
        groups.forEach((group) => {
          const pos = group.position.toArray();
          const rotation = group.rotation.toArray();
          const id = group.userData?.id;
          modelData.value.forEach((obj: Model) => {
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

    function resize() {
      if (renderer && composer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / (window.innerHeight);
        camera.updateProjectionMatrix();
      }
    }
    window.addEventListener('resize', resize, false);

    onUnmounted(() => {
      window.removeEventListener('resize', resize);
      renderer = null;
    });

    return {
      modelData,
      getMousePos,
      mouse,
      controller,
      apply,
      hint,
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
      color: $primary;
      background: $secondary;
      font-size: 20px;
      font-weight: bold;
      height: 52px;
      line-height: 52px;
      margin-left: 16px;
      width: 120px;
    }
    display: flex;
    justify-content: space-between;
    padding-top: 24px;
    position: absolute;
  }
  .hint {
    position: absolute;
    left: 0;
    right: 0;
    top: 120px;
    font-size: 20px;
    font-weight: bold;
    color: $secondary;
    letter-spacing: 2px;
    margin: auto;
    width: 374px;
    border: 2px solid $secondary;
    border-radius: 10px;
    padding: 8px;
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
    bottom: 30px;
    display: flex;
    flex-wrap: wrap;
    transform: rotate(45deg);
    position: absolute;
    right: 26px;
    width: 136px;
  }
  #rotateController {
    button {
      &:first-child {
        margin-right: 8px;
      }
      &:last-child {
        margin-left: 8px;
      }
    }
    bottom: 24px;
    display: flex;
    left: 20px;
    position: absolute;
  }
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
</style>
