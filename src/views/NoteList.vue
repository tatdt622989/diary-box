<template>
  <div class="node-list-wrap">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/')">
        <span class="material-icons">home</span>
      </button>
      <p>筆記一覽</p>
      <button class="btn-circle" @click="openFilter">
        <span class="material-icons">filter_alt</span>
      </button>
    </div>
    <div class="filter-wrap" :class="{active : isFilterOpen}">
      <p>搜尋</p>
      <button class="close-btn" @click="isFilterOpen = false">
        <span class="material-icons">close</span>
      </button>
      <input type="search">
      <hr>
      <p>類型</p>
      <div class="btn-group">
        <button class="btn-rectangle">建立日期</button>
        <button class="btn-rectangle">修改日期</button>
      </div>
      <hr>
      <p>排序</p>
      <div class="btn-group">
        <button class="btn-rectangle">新到舊</button>
        <button class="btn-rectangle">舊到新</button>
      </div>
      <hr>
      <div class="btn-group">
        <button class="btn-rectangle">取消</button>
        <button class="btn-rectangle">套用</button>
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
import Navbar from '@/components/Navbar.vue';

export default defineComponent({
  name: 'NoteList',
  components: {
    Navbar,
  },
  setup() {
    const isFilterOpen = ref<boolean>(false);

    function openFilter() {
      isFilterOpen.value = true;
    }

    return {
      isFilterOpen,
      openFilter,
    };
  },
});
</script>

<style lang="scss">
  .node-list-wrap {
    background: $primary;
    overflow: hidden;
    width: 100%;
    height: 100vh;
    position: relative;
  }
  .header {
    p {
      color: $secondary;
      font-weight: bold;
      font-size: 20px;
      margin: 0;
    }
    margin-top: 12px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .filter-wrap {
    p {
      font-size: 20px;
      font-weight: bold;
      color: $primary;
      margin-bottom: 20px;
    }
    input {
      height: 52px;
      width: 100%;
      border-radius: 999px;
      border: 3px solid $primary;
      background: transparent;
      text-indent: 20px;
      font-size: 20px;
      font-weight: bold;
      color: $primary;
    }
    .close-btn {
      &:hover {
        background-color: #F0E0B9;
      }
      span {
        color: $primary;
        line-height: 52px;
      }
      position: absolute;
      top: 8px;
      right: 20px;
      height: 52px;
      width: 52px;
      border-radius: 999px;
      background-color: transparent;
      transition: $t-base;
    }
    .btn-group {
      button {
        &:first-child {
          margin-right: 20px;
        }
        width: 170px;
      }
      display: flex;
      justify-content: flex-start;
    }
    hr {
      height: 0;
      border-top: 1px dashed #9F9684;
    }
    &.active {
      bottom: 0;;
    }
    background-color: $secondary;
    border-radius: 20px 20px 0 0;
    height: 520px;
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 24px 28px 25px 28px;
    text-align: left;
    bottom: -520px;
    transition: $t-base;
  }
</style>
