<template>
  <div class="welcome-wrap" :style="{ height }">
    <div></div>
    <div class="logo">
      <img src="@/assets/images/logo-no-text.svg" alt="logo" />
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
      <div class="mb-2 position-relative">
        <span class="material-icons">lock</span>
        <input
          type="password"
          class="form-control"
          placeholder="密碼"
          v-model="password"
          autocomplete="on"
        />
      </div>
      <p class="hint" v-if="formHint">{{ formHint }}</p>
    </form>
    <div class="login-group mt-2">
      <button
        type="button"
        class="login-btn btn btn-primary"
        @click="login('email')"
      >
        登入
      </button>
      <p class="register-text" @click="openRegisterModel">
        沒有日記盒的帳戶嗎?{{ "\xa0\xa0" }}<span>立即註冊</span>
      </p>
      <!-- <hr> -->
      <div class="btn-group">
        <button class="google-login-btn" @click="login('google')">
          <img src="@/assets/images/google-icon.svg" />
          <span>Google</span>
        </button>
        <button
          class="sign-later-btn btn btn-primary"
          @click="login('anonymous')"
        >
          訪客登入
        </button>
      </div>
    </div>
    <Register></Register>
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
  watch,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Register from '@/components/Register.vue';

export default defineComponent({
  name: 'Welcome',
  components: {
    Register,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const dataLoaded = computed(() => store.state.dataLoaded);
    // onMounted(() => {
    // });

    watch(dataLoaded, (newVal, oldVal) => {
      console.log('資料載入狀態變更');
      if (newVal) {
        router.push('/home');
        store.commit('updateDataLoadStatus', false);
      }
    });

    function login(type: string) {
      switch (type) {
        case 'email':
          if (!password.value || !email.value) {
            return store.commit('updateFormHint', '欄位不能為空');
          }
          if (password.value.search(/\W/g) > 0) {
            return store.commit('updateFormHint', '不能使用特殊符號');
          }
          store.dispatch('login', {
            type,
            email: email.value,
            password: password.value,
          });
          break;
        case 'google':
          store.dispatch('login', { type });
          break;
        case 'anonymous':
          store.dispatch('login', { type });
          break;
        default:
          break;
      }
      return false;
    }

    function openRegisterModel() {
      if (store.state.modal) {
        store.state.modal.hide();
      }
      store.commit('openModal', 'register');
    }

    return {
      height: computed(() => store.state.height),
      formHint: computed(() => store.state.formHint),
      router,
      email,
      login,
      openRegisterModel,
      password,
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
    height: 110px;
    justify-content: center;
    width: 110px;
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
    .hint {
      color: #fff;
      margin: 0;
    }
  }
  .login-group {
    button.login-btn {
      color: $primary;
      height: 52px;
      border-radius: 999px;
      width: 100%;
      flex-grow: 0;
      flex-shrink: 0;
      background-color: $secondary;
      font-size: 20px;
      font-weight: bold;
    }
    button {
      width: 100%;
    }
    hr {
      &::after {
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
        margin-left: 14px;
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
    button.sign-later-btn {
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
    margin-bottom: 24px;
  }
  .register-text {
    span {
      color: $secondary;
    }
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    margin: 16px 0;
  }
  .btn-group {
    button {
      width: calc(50% - 8px);
      flex-shrink: 0;
      flex-grow: 0;
    }
    display: flex;
    justify-content: space-between;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
