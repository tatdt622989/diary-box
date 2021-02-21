<template>
  <div class="menu-wrap" :class="{ active: isMenuOpen }">
    <div class="content">
      <button class="close-btn t-base" @click="menuToggler">
        <span class="material-icons">close</span>
      </button>
      <ul class="menu-list">
        <li class="t-base"><span class="material-icons">get_app</span><button>匯出檔案</button></li>
        <li class="t-base"><span class="material-icons">publish</span><button>匯入存檔</button></li>
      </ul>
      <div class="about">
        <p>關於作者</p>
        <div class="d-flex justify-content-between">
          <a class="website t-base" href="https://6yuwei.com" target="_blank">
            <img src="@/assets/images/web-logo.svg" alt="六魚丸設計">
          </a>
          <a class="facebook t-base" href="https://www.facebook.com/profile.php?id=100032140747157" target="_blank">
            <img src="@/assets/images/facebook.svg" alt="Facebook">
          </a>
        </div>
      </div>
    </div>
    <transition name="fade">
      <div class="bg" v-if="isMenuOpen" @click="menuToggler"></div>
    </transition>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  computed,
} from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Menu',
  setup(props, { attrs, slots, emit }) {
    const store = useStore();
    return {
      isMenuOpen: computed(() => store.state.isMenuOpen),
      menuToggler: () => store.commit('menuToggler', false),
    };
  },
});
</script>

<style lang="scss" scoped>
  .menu-wrap {
    &.active {
      .content {
        position: absolute;
        right: 0;
      }
      width: 100vw;
    }
    .content {
      .close-btn {
        &:hover, &:active {
          span {
            color: $secondary;
          }
          background-color: $primary;
        }
        span {
          font-size: 36px;
          color: $primary;
        }
        height: 52px;
        width: 52px;
        border-radius: 999px;
        background-color: $secondary;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        margin-left: 8px;
      }
      .about {
        p {
          color: $primary;
          font-size: 20px;
          font-weight: bold;
        }
        a {
          &:hover, &:active {
            transform: scale(1.1);
          }
          background-color: transparent;
          padding: 0;
        }
        left: 50%;
        transform: translateX(-50%);
        bottom: 56px;
        position: absolute;
        width: calc(100% - 32px);
      }
      background-color: $secondary;
      box-shadow: -4px 0px 16px rgba(46, 131, 80, 0.5);
      border-radius: 20px 0px 0px 20px;
      height: 100vh;
      width: 160px;
      padding: 16px 0;
      transition: all .3s ease-out;
      z-index: 2;
      position: absolute;
      top: 0;
      right: -176px;
    }
    .bg {
      background-color: rgba(0, 0, 0, 0.5);
      position: fixed;
      right: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      z-index: 1;
    }
    position: absolute;
    right: 0;
    top: 0;
    height: 100vh;
  }

  .menu-list {
    li {
      &:hover {
        span, button {
          color: $secondary;
        }
        background-color: $primary;
      }
      span {
        line-height: 56px;
        color: $primary;
      }
      button {
        background-color: transparent;
        font-size: 20px;
        font-weight: bold;
        color: $primary;
      }
      display: flex;
      width: 100%;
      height: 56px;
      padding-left: 16px;
    }
    padding: 0;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
