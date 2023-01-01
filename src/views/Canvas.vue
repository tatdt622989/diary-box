<template>
  <div
    class="main-wrap canvas-wrap"
    :style="{ height }"
    @mousedown="toolMenuInUse = ''"
    @touchstart="toolMenuInUse = ''"
  >
    <div class="header">
      <button
        class="btn btn-circle"
        @click="
          $router.push({
            name: 'DrawingNotes',
          })
        "
      >
        <span class="material-icons">arrow_back</span>
      </button>
      <div class="title">
        <span class="ellipsis">{{ title }}</span>
        <button
          class="btn"
          @click="
            $store.dispatch('openModal', {
              type: 'titleEditor',
              asynchronous: false,
            })
          "
        >
          <span class="material-icons">edit</span>
        </button>
      </div>
      <button class="btn btn-circle" @click="save">
        <span class="material-icons">check</span>
      </button>
    </div>
    <div class="content">
      <ul class="toolbar">
        <li class="tool brush">
          <button
            class="btn btn-circle"
            @click.stop="toolInUse = 'brush'"
            :class="{ active: toolInUse === 'brush' }"
          >
            <span class="material-icons">brush</span>
          </button>
        </li>
        <li class="tool eraser">
          <button
            class="btn btn-circle"
            @click="
              toolInUse !== 'eraser'
                ? (toolInUse = 'eraser')
                : (toolInUse = 'brush')
            "
            :class="{ active: toolInUse === 'eraser' }"
          >
            <svg
              width="26"
              height="23"
              viewBox="0 0 26 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15.8126 1.07414C14.3804 -0.358048 12.0584 -0.358048 10.6262 1.07414L1.07414
                10.6262C-0.35805 12.0584 -0.358046 14.3805 1.07415 15.8127L6.58118 21.3197C8.01337
                22.7519 10.3354 22.7519 11.7676 21.3197L21.3197 11.7676C22.7519 10.3354 22.7519
                8.01337 21.3197 6.58118L15.8126 1.07414ZM5.11917 10.0388L12.355 17.2747L10.0388
                19.5909C9.5614 20.0683 8.78739 20.0683 8.30999 19.5909L2.80295 14.0839C2.32556
                13.6065 2.32556 12.8324 2.80295 12.355L5.11917 10.0388Z"
                fill="#449966"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M25.4999 22.3878H9.17432V19.9429H25.4999V22.3878Z"
                fill="#449966"
              />
            </svg>
          </button>
        </li>
        <li class="tool brush-color">
          <input type="color" v-model="brushColor" id="brushColor" />
          <label for="brushColor">
            <span class="material-icons">palette</span>
          </label>
        </li>
        <li class="tool brush-size">
          <button
            class="btn btn-circle"
            @click.stop="toolMenuInUse = 'brush-size'"
          >
            <span class="material-icons">photo_size_select_small</span>
          </button>
          <div
            class="menu"
            v-if="toolMenuInUse === 'brush-size'"
            @mousedown.stop
            @touchstart.stop
          >
            <input type="range" v-model="brushSize" min="1" max="200" />
            <input type="number" v-model="brushSize" />
          </div>
        </li>
        <li class="tool undo">
          <button class="btn btn-circle" @click="changeStep(-1)">
            <span class="material-icons">undo</span>
          </button>
        </li>
        <li class="tool redo">
          <button class="btn btn-circle" @click="changeStep(1)">
            <span class="material-icons">redo</span>
          </button>
        </li>
        <li class="tool background-color">
          <input
            type="color"
            v-model="backgroundColor"
            id="backgroundColor"
            @change="cache"
          />
          <label for="backgroundColor">
            <img src="@/assets/images/format_color.svg" />
          </label>
        </li>
        <li class="tool clear">
          <button class="btn btn-circle" @click="clear">
            <span class="material-icons">crop_free</span>
          </button>
        </li>
        <li class="tool rotate-right">
          <button class="btn btn-circle" @click="rotate('right')">
            <span class="material-icons">rotate_right</span>
          </button>
        </li>
        <li class="tool rotate-left">
          <button class="btn btn-circle" @click="rotate('left')">
            <span class="material-icons">rotate_left</span>
          </button>
        </li>
        <li class="tool shape">
          <button
            class="btn btn-circle"
            @click="
              toolInUse !== 'rect'
                ? (toolInUse = 'rect')
                : (toolInUse = 'brush')
            "
            :class="{ active: toolInUse === 'rect' }"
          >
            <span class="material-icons">check_box_outline_blank</span>
          </button>
        </li>
        <li class="tool shape">
          <button
            class="btn btn-circle"
            @click="
              toolInUse !== 'circle'
                ? (toolInUse = 'circle')
                : (toolInUse = 'brush')
            "
            :class="{ active: toolInUse === 'circle' }"
          >
            <span class="material-icons">radio_button_unchecked</span>
          </button>
        </li>
        <!-- <li class="tool flip">
          <button class="btn btn-circle">
            <span class="material-icons">flip</span>
          </button>
        </li> -->
        <!-- <li class="tool model">
          <button class="btn btn-circle">
            <span class="material-icons">category</span>
          </button>
        </li> -->
        <li class="tool icon">
          <button
            class="btn btn-circle"
            :class="{ active : toolInUse === 'icon' }"
            @click="
              toolInUse = 'icon';
              $store.dispatch('openModal', {
                type: 'iconSelector',
                asynchronous: false,
              })
            "
          >
            <span class="material-icons">sentiment_satisfied_alt</span>
          </button>
        </li>
      </ul>
      <div class="canvas-container" ref="canvasContainer">
        <div class="hint" v-if="hint" v-html="hint"></div>
        <canvas
          ref="canvas"
          @mousedown="startDrawing($event)"
          @mousemove="drawing"
          @mouseup="stop"
          @touchstart.prevent="startDrawing($event)"
          @touchmove.prevent="drawing"
          @touchend.prevent="stop"
        ></canvas>
      </div>
    </div>
    <TitleEditor :title="title" @title-edit="titleEdit"></TitleEditor>
    <IconSelector @apply-icon="applyIcon"></IconSelector>
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  onMounted,
  onUnmounted,
  computed,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import TitleEditor from '@/components/TitleEditor.vue';
import IconSelector from '@/components/IconSelector.vue';

export default defineComponent({
  name: 'Canvas',
  components: {
    TitleEditor,
    IconSelector,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const canvasContainer = ref<HTMLElement>();
    const canvas = ref<HTMLCanvasElement>();
    const brushColor = ref<string>('#000');
    const brushSize = ref<number>(3);
    const backgroundColor = ref<string>('#fff');
    const isDrawing = ref<boolean>(false);
    const toolInUse = ref<string>('brush');
    const toolMenuInUse = ref<string>('');
    const timeLine = ref<Array<any>>([]);
    const title = ref<string>('未命名標題');
    const hint = ref<string>('');
    let currentStep: null | number = null;
    let tempPos: any = {
      x: 0,
      y: 0,
    };
    let tempImgData: ImageData;
    let ctx: CanvasRenderingContext2D;
    let selectedIcon = '';

    function getSize() {
      if (canvas.value && canvasContainer.value && ctx) {
        let { height } = canvasContainer.value.getBoundingClientRect();
        let { width } = canvasContainer.value.getBoundingClientRect();
        // 畫布緩存
        const img = ctx.getImageData(0, 0, width, height);
        canvas.value.width = 0;
        canvas.value.height = 0;
        height = canvasContainer.value.getBoundingClientRect().height;
        width = canvasContainer.value.getBoundingClientRect().width;
        canvas.value.width = width;
        canvas.value.height = height;
        // 繪製到新長寬的畫布(多出的部分會裁掉)
        ctx.putImageData(img, 0, 0);
      }
    }

    function resize() {
      let timer;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        getSize();
      }, 1000);
    }

    async function init() {
      if (!route.params.id) {
        router.push('/drawing-notes');
      }
      if (canvas.value) {
        ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }

    function clear() {
      if (canvas.value) {
        ctx.fillStyle = backgroundColor.value;
        ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
      }
    }

    function drawPoint(x: number, y: number) {
      if (ctx) {
        ctx.save();
        ctx.beginPath();
        if (toolInUse.value === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = brushColor.value;
        }
        ctx.arc(x, y, brushSize.value / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawLine(sx: number, sy: number, ex: number, ey: number) {
      if (ctx) {
        ctx.beginPath();
        if (toolInUse.value === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = brushColor.value;
        }
        ctx.lineWidth = brushSize.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    }

    function drawRect(sx: number, sy: number, ex: number, ey: number) {
      if (ctx && tempImgData) {
        ctx.putImageData(tempImgData, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize.value;
        ctx.strokeStyle = brushColor.value;
        ctx.strokeRect(sx, sy, ex - sx, ey - sy);
      }
    }

    function drawCircle(sx: number, sy: number, ex: number, ey: number) {
      if (ctx && tempImgData) {
        ctx.putImageData(tempImgData, 0, 0);
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize.value;
        ctx.strokeStyle = brushColor.value;
        const r = Math.sqrt(Math.abs(sx - ex) ** 2 + Math.abs(sy - ey) ** 2);
        ctx.arc(sx, sy, r, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    function drawIcon(x: number, y: number) {
      ctx.putImageData(tempImgData, 0, 0);
      ctx.font = `${brushSize.value * 20}px "Material Icons"`;
      ctx.fillStyle = brushColor.value;
      ctx.fillText(selectedIcon,
        x - (brushSize.value * 20) / 2, y + (brushSize.value * 20) / 2);
    }

    function getPos(e: any) {
      if (canvasContainer.value) {
        isDrawing.value = true;
        const { left } = canvasContainer.value.getBoundingClientRect();
        const { top } = canvasContainer.value.getBoundingClientRect();
        if (e.clientX) {
          return {
            x: e.clientX - left,
            y: e.clientY - top,
          };
        }
        if (e.touches) {
          return {
            x: e.touches[0].clientX - left,
            y: e.touches[0].clientY - top,
          };
        }
      }
      return null;
    }

    function startDrawing(e: any) {
      if (ctx && canvas.value) {
        isDrawing.value = true;
        hint.value = '';
        tempPos = getPos(e);
        tempImgData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
        if (toolInUse.value !== 'circle' && toolInUse.value !== 'icon') {
          drawPoint(tempPos.x, tempPos.y);
        }
        if (toolInUse.value === 'icon') {
          ctx.font = `${brushSize.value * 20}px "Material Icons"`;
          ctx.fillStyle = brushColor.value;
          ctx.fillText(selectedIcon,
            tempPos.x - (brushSize.value * 20) / 2, tempPos.y + (brushSize.value * 20) / 2);
        }
      }
    }

    function cache() {
      if (ctx && canvas.value) {
        const imgData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
        const data = {
          imgData,
        };
        if (currentStep !== null && currentStep >= 0) {
          timeLine.value = timeLine.value.filter((el, i) => i <= currentStep!);
          currentStep += 1;
          if (timeLine.value.length >= 20) {
            timeLine.value.splice(0, 1);
          }
        } else {
          currentStep = 0;
        }
        timeLine.value.push(data);
      }
    }

    function drawing(e: any) {
      if (isDrawing.value) {
        const currentPos = getPos(e);
        if (currentPos) {
          if (toolInUse.value === 'rect') {
            drawRect(tempPos.x, tempPos.y, currentPos.x, currentPos.y);
          } else if (toolInUse.value === 'circle') {
            drawCircle(tempPos.x, tempPos.y, currentPos.x, currentPos.y);
          } else if (toolInUse.value === 'icon') {
            drawIcon(currentPos.x, currentPos.y);
          } else {
            drawLine(tempPos.x, tempPos.y, currentPos.x, currentPos.y);
            tempPos = currentPos;
          }
        }
      }
    }

    function stop() {
      isDrawing.value = false;
      cache();
    }

    function restore() {
      clear();
      if (currentStep !== null && timeLine.value[currentStep]) {
        ctx.putImageData(timeLine.value[currentStep].imgData, 0, 0);
      }
    }

    function changeStep(step: number) {
      if (timeLine.value.length > 0 && currentStep !== null) {
        if (step < 0 && currentStep <= 0) {
          currentStep = 0;
        } else if (step > 0 && currentStep >= timeLine.value.length - 1) {
          currentStep = timeLine.value.length - 1;
        } else {
          currentStep += step;
        }
      }
      restore();
    }

    function rotate(direction: string) {
      const img = new Image();
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
      function imgLoaded() {
        clear();
        tempCtx.save();
        if (ctx && canvas.value) {
          if (direction === 'right') {
            tempCtx.rotate(Math.PI / 2);
            tempCtx.drawImage(img, tempCanvas.height / 2 - img.width / 2,
              -tempCanvas.width + (tempCanvas.width / 2 - img.height / 2));
          } else if (direction === 'left') {
            tempCtx.rotate(-Math.PI / 2);
            tempCtx.drawImage(img, -tempCanvas.height + (tempCanvas.height / 2 - img.width / 2),
              tempCanvas.width / 2 - img.height / 2);
          }
          ctx.drawImage(tempCanvas, 0, 0);
          cache();
          img.removeEventListener('load', imgLoaded);
        }
      }
      if (ctx && canvas.value) {
        tempCanvas.width = canvas.value.width;
        tempCanvas.height = canvas.value.height;
        img.addEventListener('load', imgLoaded, false);
        img.src = canvas.value.toDataURL();
      }
    }

    function titleEdit(str: string) {
      title.value = str;
    }

    function applyIcon(icon: string) {
      selectedIcon = icon;
    }

    async function save() {
      // const el = document.createElement('canvas');
      // const elCtx = el.getContext('2d') as CanvasRenderingContext2D;
      let dataURL;
      if (canvas.value) {
        // el.width = canvas.value.width;
        // el.height = canvas.value.height;
        // elCtx.fillStyle = backgroundColor.value;
        // elCtx.fillRect(0, 0, el.width, el.height);
        // elCtx.drawImage(canvas.value, 0, 0);
        dataURL = canvas.value.toDataURL();
        store.dispatch('openModal', {
          type: 'loading',
          loadingStr: '畫布上傳中',
        });
        await store.dispatch('uploadImg', { data: dataURL, id: route.params.id });
        let times = 0;
        await new Promise((resolve, reject) => {
          const closeModal = setInterval(() => {
            if (times > 50 || store.state.modalLoaded || !store.state.modal) {
              store.commit('closeModal');
              resolve(null);
              clearInterval(closeModal);
            }
            times += 1;
          }, 100);
        });
        const URL = await store.dispatch('getImgURL', { id: route.params.id });
        await store.dispatch('updateNoteData', {
          type: 'canvas',
          status: route.params.status,
          data: {
            title: title.value,
            id: route.params.id,
            URL,
          },
        });
        store.dispatch('getPoint', { type: 'canvas' });
        router.push('/drawing-notes');
      }
    }

    function hintSelector() {
      switch (toolInUse.value) {
        case 'eraser':
          hint.value = '點擊並拖移開始使用橡皮擦<br/>(可透過工具列調整大小、顏色)';
          break;
        case 'icon':
          hint.value = '點擊並拖移開始使用貼圖<br/>(可透過工具列調整大小、顏色)';
          break;
        case 'brush':
          hint.value = '點擊並拖移開始使用筆刷<br/>(可透過工具列調整大小、顏色)';
          break;
        default:
          break;
      }
    }

    watch(backgroundColor, () => {
      if (canvas.value) {
        ctx.fillStyle = backgroundColor.value;
        ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
      }
    });

    watch(toolInUse, () => {
      hintSelector();
    });

    onMounted(async () => {
      init();
      getSize();
      if (canvas.value) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
        if (route.params.status === 'edit') {
          title.value = route.params.title as string;
          const img = new Image();
          img.src = route.params.URL as string;
          img.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            img.addEventListener('load', resolve, false);
          });
          ctx.drawImage(img, canvas.value.width / 2 - img.width / 2,
            canvas.value.height / 2 - img.height / 2);
        }
      }
      cache();
      hintSelector();
      window.addEventListener('resize', resize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', resize);
    });

    return {
      applyIcon,
      backgroundColor,
      brushColor,
      brushSize,
      cache,
      canvas,
      canvasContainer,
      changeStep,
      clear,
      drawing,
      height: computed(() => store.state.height),
      hint,
      isDrawing,
      rotate,
      save,
      startDrawing,
      stop,
      timeLine,
      title,
      titleEdit,
      toolInUse,
      toolMenuInUse,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/mixins/mixins.scss";

.canvas-wrap {
  display: flex;
  flex-direction: column;
}

.header {
  .title {
    > span {
      color: $secondary;
      font-size: 24px;
      font-weight: bold;
    }
    button {
      span {
        color: $secondary;
        font-size: 24px;
      }
      align-items: center;
      display: flex;
      justify-content: center;
      padding: 0;
      height: 44px;
      width: 44px;
      flex-shrink: 0;
    }
    align-items: center;
    display: flex;
    flex-grow: 1;
    margin: 0 8px;
    justify-content: center;
  }
}
.content {
  .toolbar {
    background-color: $secondary;
    border-radius: 20px;
    display: flex;
    flex-wrap: wrap;
    height: 106px;
    padding: 6px;
    padding-bottom: 6px;
  }
  .tool {
    &.brush-color,
    &.background-color {
      input {
        & + label {
          span {
            height: 28px;
            display: flex;
            width: 28px;
            font-size: 28px;
          }
          &:hover,
          &:active {
            background: $tertiary;
          }
          align-items: center;
          background-color: $secondary;
          border-radius: 999px;
          color: $primary;
          cursor: pointer;
          display: flex;
          height: 44px;
          justify-content: center;
          width: 44px;
          transition: all 0.2s ease-in-out;
        }
        position: absolute;
        height: 0;
        width: 0;
        opacity: 0;
      }
      position: relative;
    }
    &.brush-size {
      .menu {
        input[type="range"] {
          margin-bottom: 28px;
          margin-top: 8px;
          width: 90%;
        }
        input[type="number"] {
          background: $tertiary;
          border-radius: 10px;
          color: $primary;
          font-size: 28px;
          font-weight: bold;
          height: 44px;
          text-align: center;
          width: 80px;
        }
        align-items: center;
        background: $secondary;
        border-radius: 20px;
        box-shadow: 4px 0px 16px rgba(68, 153, 102, 0.5);
        display: flex;
        flex-direction: column;
        height: 140px;
        justify-content: center;
        position: absolute;
        width: 200px;
        z-index: 5;
        left: 0;
        top: 50px;
      }
    }
    button {
      &.active {
        span {
          color: $secondary;
        }
        svg path {
          fill: $secondary;
        }
        background: $primary;
      }
      span {
        font-size: 28px;
      }
      height: 100%;
      width: 44px;
      padding: 0;
    }
    display: flex;
    height: 44px;
    justify-content: center;
    @include phone {
      width: 14.28%;
    }
    @include tablet {
      width: 11.11%;
    }
    @include desktop {
      width: 7.692%;
    }
    position: relative;
    margin-bottom: 6px;
  }
  .canvas-container {
    border-radius: 20px;
    display: flex;
    flex-grow: 1;
    overflow: hidden;
  }
  .hint {
    align-items: center;
    background: $secondary;
    border-radius: 20px;
    color: $primary;
    display: flex;
    font-size: 20px;
    font-weight: bold;
    justify-content: center;
    left: 50%;
    padding: 8px 16px;
    position: absolute;
    top: 180px;
    transform: translateX(-50%);
    user-select: none;
    width: 80%;
  }
  @include desktop {
    height: 52px;
  }
  position: relative;
  flex-grow: 1;
}
canvas {
  background: white;
}
</style>
