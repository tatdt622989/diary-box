<template>
  <div class="node-list-wrap">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-1" @click="$router.push('/')">
        <span class="material-icons">home</span>
      </button>
      <p>筆記一覽</p>
      <button class="btn-1"><span class="material-icons">filter_alt</span></button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
} from 'vue';
import Navbar from '@/components/Navbar.vue';

export default defineComponent({
  name: 'NoteList',
  components: {
    Navbar,
  },
});
</script>

<style lang="scss">
  .node-list-wrap {
    background: $primary;
    overflow: hidden;
    width: 100%;
    height: 100vh;
  }
  .header {
    p {
      color: $secondary;
      font-weight: bold;
      font-size: 20px;
      margin: 0;
    }
    margin-top: 12px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
