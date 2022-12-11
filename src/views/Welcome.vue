<template>
  <div class="welcome-wrap" :style="{ height }">
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
      <div class="btn-group">
        <button class="google-login-btn" @click="login('google')">
          <img src="@/assets/images/google-icon.svg" />
          <span>Google</span>
        </button>
        <!-- <button class="facebook-login-btn btn btn-circle" @click="login('facebook')">
          <img src="@/assets/images/f.svg">
        </button> -->
        <button
          class="sign-later-btn btn btn-primary"
          @click="login('anonymous')"
        >
          訪客登入
        </button>
      </div>
    </div>
    <Register></Register>
    <div class="contact">
      <p>聯絡我們：<span>contact@6yuwei.com</span></p>
      <p>官網留言：<a href="https://6yuwei.com/contact.html">留言表單</a></p>
    </div>
    <a class="privacy-btn" @click="$router.push('/privacy')">隱私權條款</a>
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  computed,
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

    watch(dataLoaded, async (newVal, oldVal) => {
      if (newVal) {
        store.commit('updateDataLoadStatus', false);
        router.push('/home');
      }
    });

    let lastTs: null | number = null;
    function login(type: string) {
      const ts = Date.now();
      if (!lastTs || ts - lastTs > 5000) {
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
          default:
            store.dispatch('login', { type });
            break;
        }
        lastTs = Date.now();
      }
      return false;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Enter') {
        login('email');
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeyDown);
      if (sessionStorage.getItem('pending')) {
        store.commit('updateLoadingStr', '登入中');
        store.dispatch('openModal', {
          type: 'loading',
          asynchronous: true,
        });
        store.dispatch('getRedirectRes');
      }
    });

    function openRegisterModel() {
      if (store.state.modal) {
        store.state.modal.hide();
      }
      store.dispatch('openModal', {
        type: 'register',
        asynchronous: false,
      });
    }

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });

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
      height: 70px;
      width: 70px;
    }
    align-items: center;
    background-color: $secondary;
    border-radius: 999px;
    display: flex;
    height: 90px;
    justify-content: center;
    width: 90px;
  }
  .title {
    color: $secondary;
    font-size: 32px;
    font-weight: bold;
    margin-top: 4px;
    margin-bottom: 4px;
    letter-spacing: 2px;
    line-height: 36px;
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
      height: 48px;
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
      height: 48px;
      border-radius: 999px;
      width: 100%;
      flex-grow: 0;
      flex-shrink: 0;
      background-color: $secondary;
      font-size: 20px;
      font-weight: bold;
      border-color: $secondary;
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
      height: 48px;
      justify-content: center;
      margin-bottom: 12px;
    }
    button.facebook-login-btn {
      img {
        width: 52px;
      }
      border-radius: 999px !important;
      height: 52px;
      width: 52px;
    }
    button.sign-later-btn {
      border-radius: 999px;
      border: 2px solid $secondary;
      color: $secondary;
      font-size: 20px;
      font-weight: bold;
      height: 48px;
      margin-bottom: 12px;
    }
    padding-top: 0;
    width: 100%;
    max-width: 320px;
  }
  .text {
    color: $secondary;
    font-size: 16px;
    letter-spacing: 4px;
    margin-bottom: 16px;
  }
  .register-text {
    span {
      color: $secondary;
    }
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    margin: 10px 0;
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
  .privacy-btn {
    background: none;
    color: $secondary;
    cursor: pointer;
  }
  .contact {
    p, a {
      color: $secondary;
      letter-spacing: 2px;
    }
    a {
      font-weight: bold;
    }
    p {
      &:nth-of-type(1) {
        margin-bottom: 0;
      }
    }
    margin-top: 10px;
    margin-bottom: 4px;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
