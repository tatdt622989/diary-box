<template>
  <div
    class="modal fade"
    id="canvasSelectorModal"
    tabindex="-1"
    aria-labelledby="canvasSelectorModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <span>請選擇要使用的手繪日記</span>
          <button
            type="button"
            class="btn btn-circle close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body" ref="content">
          <div
            class="item"
            v-for="(data, i) in canvasData"
            :key="i"
            :class="{ active: selectedURL === data.URL }"
            @click="selectedURL = data.URL"
          >
            <div class="img-frame" :id="data.id"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            取消
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="applyCanvas"
          >
            套用
          </button>
        </div>
      </div>
    </div>
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
import { CanvasNote } from '@/types';

export default defineComponent({
  name: 'CanvasSelector',
  setup(props, context) {
    const store = useStore();
    const canvasData = computed(() => store.state.userData.canvasData);
    const content = ref<HTMLElement>();
    const selectedURL = ref<string>();

    function displayImg() {
      const allEl = document.querySelectorAll('.item .img-frame');
      const maxHeight = window.innerHeight;
      allEl.forEach((el) => {
        const offset = el.getBoundingClientRect().top;
        if (maxHeight - offset > 20 && el.childNodes.length === 0) {
          const img = document.createElement('img');
          img.src = canvasData.value.find((data: CanvasNote) => data.id === el.id).URL;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.style.margin = '0';
          el.appendChild(img);
        }
      });
    }

    let timer: number;
    function scroll() {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        displayImg();
      }, 100);
    }

    function applyCanvas() {
      store.commit('closeModal');
      context.emit('apply-canvas', selectedURL.value);
    }

    onMounted(async () => {
      await store.dispatch('getNoteData', { type: 'canvas' });
      displayImg();
      if (content.value) {
        content.value.addEventListener('scroll', scroll);
      }
    });

    onUnmounted(() => {
      if (content.value) {
        content.value.removeEventListener('scroll', scroll);
      }
    });

    return {
      content,
      canvasData,
      selectedURL,
      applyCanvas,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/mixins/mixins.scss";

.modal-body {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}

.modal-header {
  color: $primary;
  font-weight: bold;
  font-size: 20px;
}

.item {
  &.active {
    .img-frame {
      border: 3px solid $primary;
    }
  }
  .img-frame {
    background: $primary;
    border-radius: 15px;
    margin: 0;
    flex-grow: 1;
    overflow: hidden;
    animation: loading 1s linear infinite;
    background: linear-gradient(
      90deg,
      $secondary,
      #fffaec,
      $secondary,
      #fffaec
    );
    background-size: 300% auto;
    @keyframes loading {
      0% {
        background-position-x: 0;
      }
      100% {
        background-position: 100%;
      }
    }
  }
  .function-menu {
    top: 50px;
  }
  @include phone {
    width: calc(50% - 16px);
  }
  @include tablet {
    .title {
      font-size: 18px;
    }
    width: calc(33.333% - 16px);
  }
  @include desktop {
    .title {
      font-size: 20px;
    }
    width: calc(25% - 16px);
  }
  background: $secondary;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 160px;
  margin: 8px 8px;
  position: relative;
}
.modal-dialog {
  max-width: 800px;
}
</style>
