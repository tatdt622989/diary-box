<template>
  <div
    class="modal fade"
    id="loadingModal"
    tabindex="-1"
    aria-labelledby="loadingModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <img src="@/assets/images/loading.svg" alt="載入動畫" />
          <p>{{ $store.state.loadingStr }}</p>
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

export default defineComponent({
  name: 'Loading',
  setup() {
    return {};
  },
});
</script>

<style lang="scss">
</style>
