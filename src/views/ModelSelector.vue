<template>
  <div class="main-wrap model-selector-wrap" :style="{ height }">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/text-editor')">
        <span class="material-icons">arrow_back</span>
      </button>
      <p>選擇貼上的模型</p>
    </div>
    <div class="content">
      <button @click="linkTo('add-model')">
        <span class="material-icons"> note_add </span>
        建立新模型
      </button>
      <button @click="linkTo('select-model')">
        <span class="material-icons"> topic </span>
        現有模型
      </button>
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
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Menu from '@/components/Menu.vue';

export default defineComponent({
  name: 'ModelList',
  components: {
    Navbar,
    Menu,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    // onMounted(() => {
    // });

    function linkTo(status: string) {
      router.push({
        name: 'ModelList',
        params: {
          status,
        },
      });
    }

    return {
      height: computed(() => store.state.height),
      linkTo,
    };
  },
});
</script>

<style lang="scss">
.model-selector-wrap {
  .header {
    p {
      flex-grow: 1;
      padding-right: 52px;
      text-align: center;
    }
  }
  > .content {
    button {
      &:active {
        box-shadow: 0px 0px 4px 4px #2E8350;
      }
      &:first-child {
        margin-bottom: 36px;
      }
      span {
        font-size: 64px;
        margin-bottom: 16px;
      }
      align-items: center;
      background-color: $secondary;
      border-radius: 20px;
      box-shadow: 0px 0px 32px 4px #2E8350;
      color: $primary;
      display: flex;
      flex-direction: column;
      font-size: 20px;
      font-weight: bold;
      height: 160px;
      justify-content: center;
      transition: $t-base;
      width: 70%;
    }
    align-items: center;
    display: flex;
    flex-grow: 1;
    justify-content: center;
    padding-bottom: 66px;
  }
  display: flex;
  flex-direction: column;
}
</style>
