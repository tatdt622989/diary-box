<template>
  <div class="toast-container position-absolute p-3 top-0 end-0">
    <div
      class="toast fade show"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      v-for="(toast, i) in toastMsgList"
      :key="i"
    >
      <div class="toast-header">
        <strong class="me-auto">Bootstrap</strong>
        <small class="text-muted">just now</small>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="toast"
          aria-label="Close"
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
    return {
      toastMsgList: computed(() => store.state.toastMsgList),
    };
  },
});
</script>
