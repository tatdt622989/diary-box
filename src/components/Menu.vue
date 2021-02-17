<template>
  <div class="menu-wrap">
    <button class="close-btn t-base"><span class="material-icons">close</span></button>
    <ul class="menu-list">
      <li><span class="material-icons">get_app</span><button>匯出檔案</button></li>
      <li><span class="material-icons">publish</span><button>匯入存檔</button></li>
    </ul>
    <div class="about">
      <p>關於作者</p>
      <button class="website"></button>
      <button class="facebook"></button>
    </div>
  </div>
</template>

<style lang="scss">
  .menu-wrap {
    .close-btn {
      &:hover {
        span {
          color: $secondary;
        }
        background-color: $primary;
      }
      span {
        font-size: 36px;
        color: $primary;
      }
      height: 52px;
      width: 52px;
      border-radius: 999px;
      background-color: $secondary;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    position: absolute;
    right: 0;
    top: 0;
    background-color: $secondary;
    box-shadow: -4px 0px 16px rgba(46, 131, 80, 0.5);
    border-radius: 20px 0px 0px 20px;
    height: 100vh;
    width: 160px;
    padding: 16px;
  }

  .menu-list {
    li {
      span {
        line-height: 52px;
        color: $primary;
      }
      button {
        background-color: transparent;
        font-size: 20px;
        font-weight: bold;
        color: $primary;
      }
      display: flex;
      width: 100%;
      height: 52px;
    }
    padding: 0;
  }
</style>
