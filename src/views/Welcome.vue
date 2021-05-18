<template>
  <div class="welcome-wrap" :style="{ height }">
    <img src="@/assets/images/logo.svg" alt="logo">
    <p>記錄生活，打造屬於你的日記盒</p>
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
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Welcome',
  setup() {
    const store = useStore();
    const router = useRouter();
    // onMounted(() => {
    // });

    return {
      height: computed(() => store.state.height),
    };
  },
});
</script>

<style lang="scss">
</style>
