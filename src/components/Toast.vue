<template>
  <div
    class="toast align-items-center text-white bg-primary border-0 position-absolute top-0 end-0"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    <div class="d-flex">
      <div class="toast-body">Hello, world! This is a toast message.</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
  nextTick,
} from 'vue';
import { ToastMSG } from '@/types';

export default defineComponent({
  name: 'Toast',
  setup() {
    const toastData = ref<Array<ToastMSG>>([]);
    return {
      toastData,
    };
  },
});
</script>
