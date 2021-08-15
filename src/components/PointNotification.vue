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
            class="btn btn-circle close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <img src="@/assets/images/currency.svg" />
          <span>獲得{{ $store.state.getPoint }}日記幣！</span>
          <span class="">保持寫日記的習慣獲得更多日記幣！</span>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
            @click="goShop"
          >去商店逛逛</button>
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
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'PointNotification',
  setup() {
    const store = useStore();
    const router = useRouter();

    function goShop() {
      let times = 0;
      const closeModal = setInterval(() => {
        if (times > 50 || store.state.modalLoaded || !store.state.modal) {
          store.commit('closeModal');
          clearInterval(closeModal);
          router.push('/store');
        }
        times += 1;
      }, 100);
    }
    return {
      goShop,
    };
  },
});
</script>

<style lang="scss" scoped>
.modal-header {
  display: flex;
  justify-content: flex-end;
}
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
.modal-footer {
  display: flex;
  justify-content: center !important;
}
</style>
