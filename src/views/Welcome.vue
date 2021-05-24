<template>
  <div class="welcome-wrap" :style="{ height }">
    <div></div>
    <div class="logo">
      <img src="@/assets/images/logo-no-text.svg" alt="logo">
    </div>
    <p class="title">Diary Box</p>
    <p class="text">記錄生活，打造屬於你的日記盒</p>
    <form action="">
      <div class="mb-3 position-relative">
        <span class="material-icons">mail</span>
        <input
          type="email"
          class="form-control"
          placeholder="電子郵件"
          v-model="email"
          autocomplete="on"
        />
      </div>
      <div class="mb-3 position-relative">
        <span class="material-icons">lock</span>
        <input
          type="password"
          class="form-control"
          placeholder="密碼"
          v-model="password"
          autocomplete="on"
        />
      </div>
    </form>
    <div class="login-group">
      <div class="btn-group">
        <button class="btn btn-primary" @click="openRegisterModel">註冊</button>
        <button type="button" class="btn btn-primary" @click="login('email')">登入</button>
      </div>
      <hr>
      <button class="google-login-btn" @click="login('google')">
          <img src="@/assets/images/google-icon.svg">
          <span>Google登入</span>
      </button>
      <button class="sign-later-btn btn btn-primary" @click="router.push('/home')">稍後註冊</button>
    </div>
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
      router,
    };
  },
});
</script>

<style lang="scss">
.welcome-wrap {
  .logo {
    img {
      height: 90px;
      width: 90px;
    }
    align-items: center;
    background-color: $secondary;
    border-radius: 999px;
    display: flex;
    height: 120px;
    justify-content: center;
    width: 120px;
  }
  .title {
    color: $secondary;
    font-size: 36px;
    font-weight: bold;
    margin-top: 8px;
    margin-bottom: 0;
    letter-spacing: 2px;
  }
  form {
    span.material-icons {
      color: $secondary;
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
    input {
      &::placeholder {
        color: $secondary;
        opacity: 0.5;
      }
      &:focus {
        background-color: transparent;
        color: $secondary;
        border-color: $secondary;
      }
      background-color: transparent;
      border-radius: 999px;
      border: 2px solid $secondary;
      color: $secondary;
      font-size: 20px;
      height: 52px;
      text-indent: 16px;
      padding-left: 38px;
      min-width: 320px;
    }
  }
  .login-group {
      .btn-group {
        button.btn {
          color: $primary;
          height: 52px;
          border-radius: 999px;
          width: calc(50% - 8px);
          flex-grow: 0;
          flex-shrink: 0;
          background-color: $secondary;
          font-size: 20px;
          font-weight: bold;
        }
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin: 0;
      }
      button {
        width: 100%;
      }
      hr {
        &::after{
          background-color: $primary;
          color: $secondary;
          content: "或";
          font-size: 18px;
          font-weight: bold;
          left: 50%;
          padding: 0 8px;
          position: absolute;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
        }
        background-color: $secondary;
        height: 2px;
        margin: 20px 0;
        opacity: 1;
        overflow: visible;
        position: relative;
        width: 100%;
      }
      .google-login-btn {
        background-color: #fff;
        border-radius: 999px;
        span {
          color: $gray-700;
          margin-left: 20px;
          user-select: none;
        }
        img {
          height: 32px;
          pointer-events: none;
        }
        align-items: center;
        display: flex;
        font-size: 20px;
        font-weight: bold;
        height: 52px;
        justify-content: center;
        margin-bottom: 16px;
      }
      .sign-later-btn {
        border-radius: 999px;
        color: $secondary;
        font-size: 20px;
        font-weight: bold;
        height: 52px;
        border: 2px solid $secondary;
        margin-bottom: 16px;
      }
      padding-top: 0;
      width: 100%;
      max-width: 320px;
  }
  .text {
    color: $secondary;
    font-size: 16px;
    letter-spacing: 4px;
    margin-bottom: 20px;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
