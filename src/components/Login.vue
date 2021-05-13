<template>
  <div
    class="modal fade"
    id="loginModal"
    tabindex="-1"
    aria-labelledby="loginModalLabel"
    aria-hidden="true"
    ref="loginModal"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="loginModalLabel">會員登入</h5>
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
          <div class="mb-3">
            <input
              type="email"
              class="form-control"
              id="userInput"
              placeholder="請輸入電子郵件"
              v-model="email"
            />
          </div>
          <div class="mb-3">
            <input
              type="password"
              class="form-control"
              id="userPasswordInput"
              placeholder="請輸入密碼"
              v-model="password"
            />
          </div>
          <p class="hint">{{ formHint }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="login('email')">登入</button>
          <hr>
          <button class="google-login-btn" @click="login('google')">
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
        default:
          break;
      }
      return false;
    }

    return {
      login,
      userName,
      email,
      password,
      formHint: computed(() => store.state.formHint),
    };
  },
});
</script>

<style lang="scss" scoped>
  #loginModal {
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
        margin: 18px 0;
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
