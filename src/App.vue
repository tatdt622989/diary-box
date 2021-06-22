<template>
  <router-view/>
  <Toast></Toast>
  <PointNotification></PointNotification>
  <Loading></Loading>
  <Quality></Quality>
  <Guide></Guide>
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
import Quality from '@/components/Quality.vue';
import Guide from '@/components/Guide.vue';
import { getGPUTier } from 'detect-gpu';

export default defineComponent({
  name: 'app',
  components: {
    Toast,
    PointNotification,
    Loading,
    Quality,
    Guide,
  },
  setup() {
    const store = useStore();
    store.dispatch('getModelFormat');

    onMounted(async () => {
      store.commit('getHeight');
      window.addEventListener('resize', () => {
        store.commit('getHeight');
      }, false);
      (async () => {
        const gpuTier = await getGPUTier();
        console.log(gpuTier);
        store.commit('updateGpuTier', gpuTier);
      })();
    });

    return {
    };
  },
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
@import '~@/assets/scss/app.scss';
@import '~material-icons/iconfont/material-icons.css';

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
