<template>
  <div
    class="modal fade"
    id="pointNotificationModal"
    tabindex="-1"
    aria-labelledby="pointNotificationModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
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
          <img src="@/assets/images/currency.svg">
          <span
            >獲得{{ $store.state.getPoint }}日記幣！</span
          >
          <span class="">持續保持寫日記的習慣獲得更多日記幣！</span>
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
  nextTick,
} from 'vue';

export default defineComponent({
  name: 'PointNotification',
});
</script>

<style lang="scss" scoped>
.modal-body {
  img {
    height: 90px;
    width: 90px;
    margin-bottom: 24px;
    animation: rotate 3s linear infinite;
    @keyframes rotate {
      from {
        transform: rotate3d(0, 1, 0, 0deg);
      }
      to {
        transform: rotate3d(0, 1, 0, 360deg);
      }
    }
  }
  span {
    &:last-child {
      font-weight: normal;
      font-size: 20px;
    }
    color: $primary;
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  justify-content: flex-start;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
