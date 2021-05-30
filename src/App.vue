<template>
  <router-view/>
  <Toast></Toast>
  <PointNotification></PointNotification>
  <Loading></Loading>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  computed,
  onMounted,
  provide,
} from 'vue';
import { useStore } from 'vuex';
import Toast from '@/components/Toast.vue';
import PointNotification from '@/components/PointNotification.vue';
import Loading from '@/components/Loading.vue';

export default defineComponent({
  name: 'app',
  components: {
    Toast,
    PointNotification,
    Loading,
  },
  setup() {
    const store = useStore();

    store.dispatch('getModelFormat');

    onMounted(() => {
      store.commit('getHeight');
      window.addEventListener('resize', () => {
        store.commit('getHeight');
      }, false);
    });

    return {
    };
  },
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
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
</style>
