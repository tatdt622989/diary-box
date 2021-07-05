<template>
  <div class="function-bar container-fluid">
    <button class="t-base position-relative" @click.stop="menuToggler('note')">
      <span class="material-icons">article</span>
      <span class="text">日記</span>
      <ul
        class="function-menu note"
        :class="{ active: functionMenuOpen === 'note' }"
        @click.stop
      >
        <img src="@/assets/images/menu-arrow.svg" />
        <li><button @click="$router.push('/note-list')">文字日記</button></li>
        <li><button>手繪日記</button></li>
      </ul>
    </button>
    <button class="t-base" @click="$router.push('/accounting')">
      <span class="material-icons">savings</span>
      <span class="text">記帳</span>
    </button>
    <button
      class="t-base"
      id="addBtn"
      @click.stop="menuToggler('add')"
    >
      <span class="material-icons">add</span>
      <ul
        class="function-menu add"
        :class="{ active: functionMenuOpen === 'add' }"
        @click.stop
      >
        <img src="@/assets/images/menu-arrow.svg" />
        <li><button>文字日記</button></li>
        <li><button>手繪日記</button></li>
        <li><button>開始記帳</button></li>
      </ul>
    </button>
    <button
      class="t-base"
      @click="
        $router.push({
          name: 'ModelList',
        })
      "
    >
      <span class="material-icons">category</span>
      <span class="text">模型</span>
    </button>
    <button class="t-base" @click="$router.push('/store')">
      <span class="material-icons">store</span>
      <span class="text">商店</span>
    </button>
  </div>
</template>

<script lang="ts">
import {
  ref, reactive, defineComponent, onMounted, computed,
} from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'FunctionBar',
  props: ['mode'],
  setup(props) {
    const store = useStore();
    const functionMenuOpen = computed(() => store.state.functionMenuOpen);

    function menuToggler(type: string | boolean) {
      store.commit('functionMenuToggler', type);
    }

    return {
      menuToggler,
      functionMenuOpen,
    };
  },
});
</script>

<style lang="scss" scoped>
.function-bar {
  button {
    &:hover,
    &:active {
      span {
        color: #34764e;
      }
    }
    span {
      color: $primary;
      font-size: 36px;
      line-height: 36px;
      margin-bottom: 3px;
      transition: all .2s ease-in-out;
    }
    span.text {
      font-size: 14px;
      line-height: 14px;
    }
    background: none;
    align-items: center;
    border: 0;
    display: flex;
    height: 100%;
    justify-content: center;
    width: 52px;
    flex-direction: column;
  }
  #addBtn {
    &:hover,
    &:active {
      background-color: darken($primary, 10%);
      opacity: 1;
    }
    span {
      color: $secondary;
      font-size: 52px;
      font-weight: bold;
    }
    align-items: center;
    background-color: $primary;
    border-radius: 999px;
    border: 2px solid $secondary;
    bottom: 8px;
    display: flex;
    height: 72px;
    position: relative;
    width: 72px;
  }
  align-items: center;
  background-color: $secondary;
  border-radius: 20px 20px 0 0;
  bottom: 0;
  display: flex;
  height: 66px;
  justify-content: space-between;
  left: 0;
  margin: auto;
  min-height: 66px;
  padding: 0 20px;
  position: absolute;
  right: 0;
  width: 100%;
}
.function-menu {
  &.add.active {
    transform: translateX(-50%) scale(1);
  }
  &.note.active {
    transform: scale(1);
  }
  &.add {
    img {
      transform: translateX(-50%);
      left: 50%;
    }
    top: -190px;
    left: 50%;
    right: auto;
    transform: translateX(-50%) scale(0);
  }
  &.note {
    img {
      left: 20px;
    }
    top: -140px;
    left: -10px;
    transform: scale(0);
  }
  button {
    height: 52px;
  }
  img {
    position: absolute;
    bottom: -20px;
  }
  bottom: auto;
  transform-origin: bottom center;
  overflow: visible;
  transition: all 0.2s ease-in-out;
  margin: 0;
}
</style>
