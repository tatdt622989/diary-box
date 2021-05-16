<template>
  <div
    class="modal fade"
    id="registerModal"
    tabindex="-1"
    aria-labelledby="registerModalLabel"
    aria-hidden="true"
    ref="registerModal"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="registerModalLabel">會員註冊</h5>
          <button
            type="button"
            class="btn btn-circle close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form action="">
            <div class="mb-3">
            <input
              type="text"
              class="form-control"
              id="userNameInput"
              placeholder="請輸入名稱"
              v-model="userName"
              autocomplete="on"
            />
            </div>
            <div class="mb-3">
              <input
                type="email"
                class="form-control"
                id="userInput"
                placeholder="請輸入電子郵件"
                v-model="email"
                autocomplete="on"
              />
            </div>
            <div class="mb-3">
              <input
                type="password"
                class="form-control"
                id="userPasswordInput"
                placeholder="請輸入密碼"
                v-model="password"
                autocomplete="on"
              />
            </div>
          </form>
          <p class="hint">{{ formHint }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="register">註冊</button>
          <hr>
          <button class="google-login-btn" @click="login">
              <img src="@/assets/images/google-icon.svg">
              <span>Google登入</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  computed,
  onMounted,
} from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup(props, { emit }) {
    const store = useStore();
    const userName = ref('');
    const email = ref('');
    const password = ref('');

    function register() {
      if (!userName.value || !password.value || !email.value) {
        store.commit('updateFormHint', '欄位不能為空');
      }
      if (userName.value.search(/\W/g) > 0 || password.value.search(/\W/g) > 0) {
        store.commit('updateFormHint', '不能使用特殊符號');
      }
      store.dispatch('register', {
        userName: userName.value,
        email: email.value,
        password: password.value,
      });
      return false;
    }

    function login() {
      store.dispatch('login', { type: 'google' });
    }

    return {
      login,
      register,
      userName,
      email,
      password,
      formHint: computed(() => store.state.formHint),
    };
  },
});
</script>

<style lang="scss" scoped>
  #registerModal {
    .modal-footer {
      button {
        width: 100%;
      }
      hr {
        &::after{
          background-color: $secondary;
          color: $primary;
          content: "或";
          font-size: 18px;
          font-weight: bold;
          left: 50%;
          padding: 0 8px;
          position: absolute;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
        }
        background-color: $primary;
        height: 2px;
        margin: 20px 0;
        position: relative;
        width: 100%;
        overflow: visible;
        opacity: 1;
      }
      padding-top: 0;
    }
  }
  input {
    &:focus {
      background-color: transparent;
      color: $primary;
    }
    background-color: transparent;
    border-radius: 999px;
    border: 2px solid $primary;
    color: $primary;
    font-size: 20px;
    height: 52px;
    text-indent: 16px;
  }
  .hint {
    color: red;
    font-size: 20px;
    font-weight: bold;
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
    height: 52px;
    justify-content: center;
  }
</style>
