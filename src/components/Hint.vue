<template>
  <div
    class="modal fade"
    id="hintModal"
    tabindex="-1"
    aria-labelledby="hintModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <button
            type="button"
            class="btn btn-circle"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p>是否要刪除模型？</p>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
          >
            否
          </button>
          <button type="button" class="btn btn-primary" @click="$emit('deleteModel')">是</button>
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

<style lang="scss" scoped>
.modal-header {
  display: flex;
  justify-content: flex-end;
  padding: 0;
  height: auto;
  padding: 16px;
}
</style>
