<template>
  <div
    class="modal fade"
    id="qualityModal"
    tabindex="-1"
    aria-labelledby="qualityModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="qualityModalLabel">畫質設定</h5>
          <button
            type="button"
            class="btn btn-circle close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <input type="range" min="0" max="2" v-model="quality" />
          <div class="range-text d-flex justify-content-between">
            <span>低</span>
            <span>中</span>
            <span>高</span>
          </div>
        </div>
        <div class="modal-footer d-flex justify-content-center">
          <button type="button" class="btn btn-primary" @click="apply">套用</button>
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
  nextTick,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Quality',
  setup() {
    const store = useStore();
    const quality = ref('1');

    function apply() {
      store.commit('updateQuality', quality.value);
    }

    return {
      apply,
      quality,
    };
  },
});
</script>

<style lang="scss">
.modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.range-text {
  color: $primary;
  font-size: 24px;
  font-weight: bold;
  margin-top: 32px;
  width: 300px;
}
input[type="range"] {
  appearance: none;
  background: $tertiary;
  height: 12px;
  border-radius: 999px;
  width: 300px;
  &::-webkit-slider-thumb {
    appearance: none;
    background: $primary;
    border-radius: 99px;
    cursor: pointer;
    height: 40px;
    width: 40px;
  }
}
</style>
