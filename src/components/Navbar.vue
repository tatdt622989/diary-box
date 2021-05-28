<template>
  <div id="nav">
    <img src="@/assets/images/logo.svg" alt="日記盒" @click="linkTo">
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
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    Menu,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    function linkTo() {
      if (store.state.userInfo) {
        router.push('/home');
      } else {
        router.push('/');
      }
    }

    return {
      menuToggler: () => store.commit('menuToggler', true),
      linkTo,
    };
  },
});
</script>

<style lang="scss" scoped>
#nav {
  >img {
    cursor: pointer;
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
    background-color: $secondary;
    border-radius: 999px;
    border: 0;
    height: 52px;
    margin-bottom: 0px;
    transition: $t-base;
    width: 52px;
  }
  align-items: center;
  background-color: $secondary;
  display: flex;
  flex-shrink: 0;
  height: 66px;
  justify-content: space-between;
  padding: 0 20px;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1001;
}
</style>
