<template>
  <div class="model-preview-wrap">
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  onMounted,
  computed,
  nextTick,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default defineComponent({
  name: 'ModelPreview',
  components: {
  },
  setup() {
    const route = useRoute();
    console.log(route.params.ts);
    return {

    };
  },
});
</script>

<style lang="scss">
</style>
