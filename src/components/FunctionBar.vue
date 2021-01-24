<template>
  <div class="function-bar">
    <button><span class="material-icons">article</span></button>
    <button><span class="material-icons">add</span></button>
    <button><span class="material-icons">category</span></button>
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
