<template>
  <router-view/>
  <Toast></Toast>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  computed,
  onMounted,
} from 'vue';
import Toast from '@/components/Toast.vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'app',
  components: {
    Toast,
  },
  setup() {
    const store = useStore();

    onMounted(() => {
      try {
        if (localStorage.getItem('note-data')) {
          store.commit('getNoteData', JSON.parse(localStorage.getItem('note-data') as string));
        }
      } catch (e) {
        localStorage.settItem('note-data', []);
        store.commit('getNoteData', []);
      }
    });
    return {
    };
  },
});
</script>

<style lang="scss">
@import '~@/assets/scss/app.scss';

@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: local('Material Icons'),
       local('MaterialIcons-Regular'),
       url(~@/assets/fonts/MaterialIcons-Regular.ttf) format('truetype'),
       url(~@/assets/fonts/MaterialIcons-Regular.woff2) format('woff2'),
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;  /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;

  /* Support for all WebKit browsers. */
  -webkit-font-smoothing: antialiased;
  /* Support for Safari and Chrome. */
  text-rendering: optimizeLegibility;

  /* Support for Firefox. */
  -moz-osx-font-smoothing: grayscale;

  /* Support for IE. */
  font-feature-settings: 'liga';
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  background-color: $primary !important;
}

.function-menu {
  li {
    &:last-child {
      button {
        &:after {
          content: normal;
        }
      }
    }
  }
  button {
    &:hover, &:active {
      background-color: $tertiary;
    }
    &::after {
      background-color: $primary;
      bottom: 0;
      content: "";
      height: 1px;
      left: 50%;
      position: absolute;
      transform: translateX(-50%);
      width: 90px;
    }
    background-color: transparent;
    color: $primary;
    font-size: 18px;
    font-weight: bold;
    height: 52px;
    margin: 0 auto;
    position: relative;
    text-align: center;
    transition: $t-base;
    width: 100%;
  }
  background-color: $secondary;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toast-container .toast {
  &.hint, &.hint .toast-header {
    background-color: rgb(252, 193, 84);
    color: rgb(47, 47, 47);
  }
  &.success, &.success .toast-header {
    background-color: rgb(62, 167, 80);
    color: rgb(255, 255, 255);
  }
  &.error, &.error .toast-header {
    background-color: rgb(219, 62, 62);
    color: rgb(255, 255, 255);
  }
}
</style>
