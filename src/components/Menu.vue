<template>
  <div class="menu-wrap" :class="{ active: isMenuOpen }">
    <button class="close-btn t-base" @click="$emit('update:is-menu-open', false)">
      <span class="material-icons">close</span>
    </button>
    <ul class="menu-list">
      <li class="t-base"><span class="material-icons">get_app</span><button>匯出檔案</button></li>
      <li class="t-base"><span class="material-icons">publish</span><button>匯入存檔</button></li>
    </ul>
    <div class="about">
      <p>關於作者</p>
      <div class="d-flex justify-content-between">
        <button class="website t-base">
          <img src="@/assets/images/web-logo.svg" alt="六魚丸設計">
        </button>
        <button class="facebook t-base">
          <img src="@/assets/images/facebook.svg" alt="Facebook">
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
} from 'vue';

export default defineComponent({
  name: 'Menu',
  props: ['is-menu-open'],
  // setup(props, { attrs, slots, emit }) {
  // },
});
</script>

<style lang="scss">
  .menu-wrap {
    &.active {
      right: 0;
    }
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
      button {
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
    position: absolute;
    right: 0;
    top: 0;
    background-color: $secondary;
    box-shadow: -4px 0px 16px rgba(46, 131, 80, 0.5);
    border-radius: 20px 0px 0px 20px;
    height: 100vh;
    width: 160px;
    padding: 16px 0;
    right: -160px;
    transition: all .3s ease-out;
  }

  .menu-list {
    li {
      &:hover {
          background-color: #F0E0B9;
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
</style>
