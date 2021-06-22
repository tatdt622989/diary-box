<template>
  <div
    class="modal fade"
    id="AccountingEditorModal"
    tabindex="-1"
    aria-labelledby="AccountingEditorModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="AccountingEditorModalLabel">
            新增收支
          </h5>
          <button
            type="button"
            class="btn btn-circle close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">...</div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Close
          </button>
          <button type="button" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
} from 'vue';
import Navbar from '@/components/Navbar.vue';
import { useStore } from 'vuex';

export default defineComponent({

});
</script>

<style lang="scss">
</style>
