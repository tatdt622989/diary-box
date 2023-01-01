<template>
  <Transition>
    <div
      id="loadingModal"
      v-if="isOpen"
    >
      <div class="modal-wrap">
        <div class="modal-content">
          <div class="modal-body">
            <div class="imgBox">
              <img class="logo" src="@/assets/images/logo-no-text.svg" alt="diary-box">
              <img class="loading" src="@/assets/images/loading2.svg" alt="載入動畫" />
            </div>
            <p>{{ text }}</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
} from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Loading',
  setup() {
    const store = useStore();
    return {
      isOpen: computed(() => store.state.loading),
      text: computed(() => store.state.loadingStr),
    };
  },
});
</script>

<style lang="scss" scoped>
#loadingModal {
  width: 100%;
  height: 100%;
  position: fixed;
  display: flex;
  align-items: stretch;
  z-index: 99999999;
  top: 0;
  left: 0;
}

.modal-wrap {
  width: 100%;
  height: 100%;
  background-color: $secondary;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: transparent;
  border: 0;
}

.modal-body {
  .imgBox {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    .loading {
    }
    .logo {
      width: 100px;
      height: 100px;
      transform: translateY(55px);
    }
  }
  p {
    margin-top: -75px;
    color: $primary;
    font-weight: bold;
    font-size: 24px;
  }
}
</style>
