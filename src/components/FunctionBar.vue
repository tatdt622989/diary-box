<template>
  <div class="function-bar">
    <button class="t-base" @click="$router.push('/note-list')">
      <span class="material-icons">article</span>
    </button>
    <button class="t-base"><span class="material-icons">add</span></button>
    <button class="t-base" @click="$router.push('/model-list')">
      <span class="material-icons">category</span>
    </button>
  </div>
</template>

<style lang="scss">
.function-bar {
  button {
    &:first-child {
      margin-right: 109px;
    }
    &:last-child {
      margin-left: 109px;
    }
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
  justify-content: center;
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
});
</script>
