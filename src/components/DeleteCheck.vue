<template>
  <div
    class="modal fade"
    id="deleteCheckModal"
    tabindex="-1"
    aria-labelledby="deleteCheckModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <p>是否真的要刪除？</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            否
          </button>
          <button
            type="button"
            class="btn btn-primary yes-btn"
            @click="$emit('deleteEvent')"
          >
            是
          </button>
        </div>
      </div>
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
  watch,
} from 'vue';

export default defineComponent({
  name: 'DeleteCheck',
});
</script>

<style lang="scss">
.yes-btn {
  background: #818080;
  border-color: #818080;
}
.modal-body {
  p {
    margin: 0;
  }
  align-items: center;
  display: flex;
  padding: 32px 0;
}
</style>
