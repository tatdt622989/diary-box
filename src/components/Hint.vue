<template>
  <div
    class="modal fade"
    id="hintModal"
    tabindex="-1"
    aria-labelledby="hintModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="hintModalLabel">Modal title</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">...</div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            取消
          </button>
          <button type="button" class="btn btn-primary">儲存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ref,
  defineComponent,
  onMounted,
  onUnmounted,
  computed,
} from 'vue';

export default defineComponent({
  name: 'Hint',
});
</script>

<style lang="scss">
</style>
