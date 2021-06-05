<template>
  <div
    class="modal fade"
    id="guideModal"
    tabindex="-1"
    aria-labelledby="guideModalLabel"
    aria-hidden="true"
    ref="guideModal"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5>簡易導引</h5>
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
          <div id="guideSliderWrap">
            <Splide :options="options">
              <SplideSlide :style="{ width: width + 'px' }">
                <img src="@/assets/images/guide1.png" />
              </SplideSlide>
              <SplideSlide :style="{ width: width + 'px' }">
                <img src="@/assets/images/guide2.png" />
              </SplideSlide>
              <SplideSlide :style="{ width: width + 'px' }">
                <img src="@/assets/images/guide3.png" />
              </SplideSlide>
              <SplideSlide :style="{ width: width + 'px' }">
                <img src="@/assets/images/guide4.png" />
              </SplideSlide>
              <SplideSlide :style="{ width: width + 'px' }">
                <img src="@/assets/images/guide5.png" />
              </SplideSlide>
              <SplideSlide :style="{ width: width + 'px' }">
                <img src="@/assets/images/guide6.png" />
              </SplideSlide>
            </Splide>
          </div>
          <div class="guide-hint-group">
            <label for="guideHint">不再提醒(可以到右上角目錄內查看)</label>
            <input type="checkbox" name="" id="guideHint">
          </div>
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
  watch,
  onUnmounted,
  nextTick,
} from 'vue';
import { Splide, SplideSlide } from '@splidejs/vue-splide';

export default defineComponent({
  name: 'Guide',
  components: {
    Splide,
    SplideSlide,
  },
  setup() {
    const options = ref({
      width: '100%',
      fixedWidth: 'auto',
      autoHeight: true,
      perPage: 1,
    });
    const width = ref(0);

    onMounted(() => {
      width.value = document.getElementById('guideSliderWrap').getBoundingClientRect();
      const myModalEl = document.getElementById('guideModal');
      myModalEl.addEventListener('shown.bs.modal', (e) => {
        console.log(document.getElementById('guideSliderWrap').getBoundingClientRect().width);
        width.value = document.getElementById('guideSliderWrap').getBoundingClientRect().width;
      });
    });

    onUnmounted(() => {
      window.removeEventListener('resize');
    });

    return {
      options,
      width,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "~@splidejs/splide/dist/css/themes/splide-default.min.css";

.modal-body {
  >div {
    overflow: hidden;
    width: 100%;
  }
  img {
    height: auto;
    width: 325px;
    object-fit: cover;
    margin: 0;
    border-radius: 10px;
    cursor: grab;
  }
  .guide-hint-group {
    padding-top: 16px;
  }
  width: 100%;
}
.modal-dialog {
  max-width: 500px;
}
.modal-header {
  h5 {
    font-size: 20px;
    margin: 0;
  }
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 20px;
}
</style>
