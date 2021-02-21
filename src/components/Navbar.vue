<template>
  <div id="nav">
    <img src="@/assets/images/logo.svg" alt="貼生活">
    <button @click="menuToggler">
      <span class="material-icons">menu</span>
    </button>
    <Menu></Menu>
  </div>
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
import Menu from '@/components/Menu.vue';

export default defineComponent({
  components: {
    Menu,
  },
  setup() {
    const store = useStore();
    return {
      menuToggler: () => store.commit('menuToggler', true),
    };
  },
});
</script>

<style lang="scss">
#nav {
  >img {
    width: 180px;
  }
  button {
    &:hover, &:active {
      background-color: #F0E0B9;
    }
    span {
      color: $primary;
      font-size: 36px;
      line-height: 52px;
    }
    border: 0;
    height: 52px;
    width: 52px;
    border-radius: 999px;
    background-color: $secondary;
    margin-bottom: 0px;
    transition: $t-base;
  }
  background-color: $secondary;
  height: 66px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 0 20px;
}
</style>
