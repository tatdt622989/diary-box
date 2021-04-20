<template>
  <div class="main-wrap model-selector-wrap">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/text-editor')">
        <span class="material-icons">home</span>
      </button>
      <button
        class="btn-circle"
        @click="listMode = 'using'"
        v-if="listMode === 'all'"
      >
        <span class="material-icons">arrow_back</span>
      </button>
      <p>請選擇使用的物品來源</p>
      <button class="btn-circle" @click="listMode = 'all'" v-if="listMode === 'using'">
        <span class="material-icons">all_inbox</span>
      </button>
    </div>
    <div class="content">
      <button>使用物品庫</button>
      <button>建立新的物品</button>
    </div>
    <Menu></Menu>
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
import Navbar from '@/components/Navbar.vue';
import Menu from '@/components/Menu.vue';

export default defineComponent({
  name: 'ModelList',
  components: {
    Navbar,
    Menu,
  },
  setup() {
    onMounted(() => {
    });
    return {
    };
  },
});
</script>

<style lang="scss">
</style>
