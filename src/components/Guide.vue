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
          <h5>操作導引</h5>
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
          <div id="guideSliderWrap">
            <div class="swiper-container">
              <div class="swiper-wrapper">
                <div class="swiper-slide">
                  <img src="@/assets/images/guide1.png" />
                </div>
                <div class="swiper-slide">
                  <img src="@/assets/images/guide2.png" />
                </div>
                <div class="swiper-slide">
                  <img src="@/assets/images/guide3.png" />
                </div>
                <div class="swiper-slide">
                  <img src="@/assets/images/guide4.png" />
                </div>
                <div class="swiper-slide">
                  <img src="@/assets/images/guide5.png" />
                </div>
                <div class="swiper-slide">
                  <img src="@/assets/images/guide6.png" />
                </div>
              </div>
              <div class="swiper-pagination"></div>
              <div class="swiper-button-prev">
                <span class="material-icons">chevron_left</span>
              </div>
              <div class="swiper-button-next">
                <span class="material-icons">chevron_right</span>
              </div>
            </div>
          </div>
          <!-- <div class="guide-hint-group">
            <input type="checkbox" id="guideHint" v-model="guideState"/>
            <label for="guideHint">
              <div class="check-box">
                <span class="material-icons">check</span>
              </div>
              <p>不再提醒(可以到右上角目錄內查看)</p>
            </label>
          </div> -->
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
// eslint-disable-next-line import/no-duplicates
import Swiper from 'swiper';
// eslint-disable-next-line import/no-duplicates
import SwiperCore, { Navigation, Pagination } from 'swiper/core';

SwiperCore.use([Navigation, Pagination]);

export default defineComponent({
  name: 'Guide',
  setup() {
    const width = ref(0);
    const guideState = ref();

    watch(guideState, (newVal) => {
      if (guideState.value >= 0) {
        localStorage.setItem('guideState', newVal ? 1 : 0);
      }
    });

    onMounted(() => {
      if (localStorage.getItem('guideState')) {
        try {
          guideState.value = Number(localStorage.getItem('guideState')) > 0;
        } catch (e) {
          localStorage.removeItem('guideState');
        }
      }
      const swiper = new Swiper('.swiper-container', {
        observer: true,
        observeParents: true,
        pagination: {
          el: '.swiper-pagination',
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });
      const myModalEl = document.getElementById('guideModal');
      myModalEl.addEventListener('show.bs.modal', (e) => {
        swiper.slideTo(0);
      });
    });

    onUnmounted(() => {
      window.removeEventListener('resize');
    });

    return {
      width,
      guideState,
    };
  },
});
</script>

<style lang="scss">
@import "~swiper/swiper-bundle.css";

#guideModal {
  .modal-body {
    > div {
      overflow: hidden;
      width: 100%;
    }
    img {
      border-radius: 10px;
      cursor: grab;
      height: auto;
      margin: 0;
      object-fit: cover;
      width: 325px;
      border: 2px solid $primary;
    }
    .guide-hint-group {
      label {
        .check-box {
          span {
            font-size: 20px;
            opacity: 0;
          }
          background-color: #fff;
          border-radius: 4px;
          border: 1px solid $primary;
          content: "";
          height: 23px;
          left: 0;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        p {
          font-size: 18px;
          margin: 0;
          user-select: none;
          cursor: pointer;
        }
        align-items: center;
        display: flex;
        color: $primary;
        font-weight: bold;
        position: relative;
        padding-left: 30px;
        height: 28px;
      }
      input[type="checkbox"] {
        &:checked+label span {
          opacity: 1;
        }
        height: 0;
        opacity: 0;
        width: 0;
      }
      align-items: center;
      display: flex;
      height: 56px;
      justify-content: center;
      padding-top: 16px;
    }
    padding-top: 0;
    width: 100%;
  }
  .swiper-button-prev,
  .swiper-button-next {
    span {
      color: $primary;
      font-size: 36px;
    }
    &::after {
      content: normal;
    }
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 999px;
    height: 44px;
    width: 44px;
  }
  .swiper-pagination-bullet-active {
    background: #fff;
  }
  .modal-dialog {
    max-width: 500px;
  }
  .modal-header {
    h5 {
      font-size: 20px;
      margin: 0;
    }
    .close {
      right: 0;
    }
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 16px;
  }
}
</style>
