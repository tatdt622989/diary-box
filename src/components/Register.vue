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
          <div class="mb-3">
            <input
              type="text"
              class="form-control"
              id="userNameInput"
              placeholder="請輸入名稱"
              v-model="userName"
            />
          </div>
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
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="register">註冊</button>
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
        return store.dispatch('updateToast', {
          type: 'hint',
          content: '欄位不能為空',
        });
      }
      if (userName.value.search(/\W/g) > 0 || password.value.search(/\W/g) > 0) {
        return store.dispatch('updateToast', {
          type: 'hint',
          content: '不能使用特殊符號',
        });
      }
      store.dispatch('register', {
        userName: userName.value,
        email: email.value,
        password: password.value,
      });
      return false;
    }

    return {
      register,
      userName,
      email,
      password,
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
</style>
