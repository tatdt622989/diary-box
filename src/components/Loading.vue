<template>
  <div
    class="modal fade"
    id="loadingModal"
    tabindex="-1"
    aria-labelledby="loadingModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
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
.modal-body {
  img {
    height: 180px;
    margin-bottom: 20px;
    width: 180px;
  }
  p {
    color: $primary;
    font-weight: bold;
    font-size: 24px;
  }
}
</style>
