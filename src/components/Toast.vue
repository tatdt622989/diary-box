<template>
  <div class="toast-container position-absolute p-3 top-0 end-0">
    <div
      class="toast fade show"
      :class="{
        'hint': toast.type === 'hint',
        'success': toast.type === 'success',
        'error': toast.type === 'error',
      }"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      v-for="(toast, i) in toastMsgList"
      :key="i"
    >
      <div
        class="toast-header"
      >
        <strong class="me-auto">{{ getTypeStr(toast.type) }}</strong>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="toast"
          aria-label="Close"
          @click="removeToast(i)"
        ></button>
      </div>
      <div class="toast-body">{{ toast.content }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  toRef,
  defineComponent,
  onMounted,
  computed,
} from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Toast',
  setup(props) {
    const store = useStore();
    function getTypeStr(type: string) {
      let str = '';
      switch (type) {
        case 'hint':
          str = '提示';
          break;
        case 'success':
          str = '成功';
          break;
        case 'error':
          str = '錯誤';
          break;
        default:
          break;
      }
      return str;
    }
    function removeToast(index: number) {
      store.commit('removeToast', index);
    }
    return {
      toastMsgList: computed(() => store.state.toastMsgList),
      getTypeStr,
      removeToast,
    };
  },
});
</script>

<style lang="scss" scoped>
  .toast-container {
    .toast {
      border-radius: 20px;
      overflow: hidden;
      z-index: 9999;
    }
    .toast-header {
      font-size: 20px;
      font-weight: bold;
    }
    .toast-body {
      font-size: 20px;
      font-weight: bold;
    }
    z-index: 9999;
  }
</style>
