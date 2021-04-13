<template>
  <div class="main-wrap store-wrap">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle">
        <span class="material-icons">arrow_back</span>
      </button>
      <p>解鎖模型</p>
    </div>
    <div class="content">
      <div class="currency">
        <span>999</span>
        <span class="material-icons">monetization_on</span>
      </div>
      <div class="products container-fluid"></div>
    </div>
    <Menu></Menu>
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
import Navbar from '@/components/Navbar.vue';
import Menu from '@/components/Menu.vue';

export default defineComponent({
  name: 'ModelList',
  components: {
    Navbar,
    Menu,
  },
  setup() {
    return {
    };
  },
});
</script>

<style lang="scss">
  .store-wrap {
    .currency {
      span:not(.material-icons) {
        color: $secondary;
        flex-grow: 1;
        font-size: 28px;
        padding: 0 16px;
        text-align: left;
      }
      .material-icons {
        color: $secondary;
        font-size: 32px;
        margin-right: 10px;
      }
      align-items: center;
      border-radius: 999px;
      border: 2px solid $secondary;
      display: flex;
      height: 52px;
      justify-content: flex-end;
      width: 190px;
    }
    .header {
      p {
        flex-grow: 1;
        padding-right: 52px;
        text-align: center;
      }
    }
    .content {
      align-items: center;
    }
  }
</style>
