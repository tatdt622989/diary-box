<template>
  <div class="function-bar container-fluid">
    <button
      class="t-base"
      @click="$router.push('/note-list')"
      v-if="mode === 'home'"
    >
      <span class="material-icons">article</span>
    </button>
    <button
      class="t-base"
      @click="$router.push('/')"
      v-if="mode === 'model-list'"
    >
      <span class="material-icons">edit</span>
    </button>
    <button
      class="t-base"
      @click="$router.push({
        name: 'ModelList',
        params: {
          status: 'all-models',
        }
      })"
      v-if="mode === 'home'"
    >
      <span class="material-icons">category</span>
    </button>
    <button
      class="t-base"
      @click="$router.push('/store')"
      v-if="mode === 'model-list'"
    >
      <span class="material-icons">store</span>
    </button>
  </div>
</template>

<style lang="scss">
.function-bar {
  button {
    &:hover,
    &:active {
      background-color: darken($primary, 10%);
    }
    span {
      font-size: 36px;
      color: $secondary;
      line-height: 52px;
    }
    height: 52px;
    width: 52px;
    border-radius: 999px;
    background-color: $primary;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  background-color: $secondary;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 66px;
  width: 100%;
}
</style>

<script>
import {
  ref, reactive, defineComponent, onMounted,
} from 'vue';

export default defineComponent({
  name: 'FunctionBar',
  props: ['mode'],
  // setup(props) {
  // },
});
</script>
