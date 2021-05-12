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
            <button id="googleLogin">Google</button>
            <input
              type="email"
              class="form-control"
              id="userInput"
              placeholder="請輸入電子郵件"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">登入</button>
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

});
</script>
