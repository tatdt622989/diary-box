<template>
  <div class="welcome-wrap" :style="{ height }">
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
