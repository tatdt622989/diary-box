<template>
  <div class="menu-wrap" :class="{ active: isMenuOpen }">
    <div class="content" :style="{ height }">
      <button class="close-btn t-base" @click="menuToggler">
        <span class="material-icons">close</span>
      </button>
      <ul class="menu-list">
        <li class="t-base user-info" v-if="userInfo">
          <div class="photo" v-if="userInfo.photoURL">
            <img :src="userInfo.photoURL">
          </div>
          <p>{{ userInfo.displayName }}</p>
        </li>
        <li class="t-base" v-if="!userInfo">
          <span class="material-icons">assignment_ind</span
          ><button @click="register">會員註冊</button>
        </li>
        <li class="t-base" v-if="!userInfo">
          <span class="material-icons">login</span
          ><button @click="login">會員登入</button>
        </li>
        <li class="t-base" v-if="userInfo">
          <span class="material-icons">logout</span><button>會員登出</button>
        </li>
      </ul>
      <div class="about">
        <p>關於作者</p>
        <div class="d-flex justify-content-between">
          <a class="website t-base" href="https://6yuwei.com" target="_blank">
            <img src="@/assets/images/web-logo.svg" alt="六魚丸設計" />
          </a>
          <a
            class="facebook t-base"
            href="https://www.facebook.com/profile.php?id=100032140747157"
            target="_blank"
          >
            <img src="@/assets/images/facebook.svg" alt="Facebook" />
          </a>
        </div>
      </div>
    </div>
    <transition name="fade">
      <div class="bg" v-if="isMenuOpen" @click="menuToggler"></div>
    </transition>
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
  name: 'Menu',
  emits: ['set-data'],
  setup(props, { attrs, slots, emit }) {
    const store = useStore();
    const timer = ref<number | null>(null);

    onMounted(() => {
      window.addEventListener('resize', () => {
        if (timer.value) {
          clearTimeout(timer.value);
        }
        timer.value = setTimeout(() => {
          store.commit('getHeight', `${window.innerHeight}px`);
          console.log('高度變動');
          timer.value = null;
        }, 500);
      });
    });

    function login() {
      store.commit('openModal', 'login');
    }

    function register() {
      store.commit('openModal', 'register');
    }

    return {
      isMenuOpen: computed(() => store.state.isMenuOpen),
      menuToggler: () => store.commit('menuToggler', false),
      height: computed(() => store.state.height),
      userInfo: computed(() => store.state.userInfo),
      login,
      register,
    };
  },
});
</script>

<style lang="scss" scoped>
.menu-wrap {
  &.active {
    .content {
      position: absolute;
      right: 0;
    }
    width: 100vw;
  }
  .content {
    .close-btn {
      &:hover,
      &:active {
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
      margin-left: 8px;
    }
    .about {
      p {
        color: $primary;
        font-size: 20px;
        font-weight: bold;
      }
      a {
        &:hover,
        &:active {
          transform: scale(1.1);
        }
        background-color: transparent;
        padding: 0;
      }
      left: 50%;
      transform: translateX(-50%);
      bottom: 56px;
      position: absolute;
      width: calc(100% - 32px);
    }
    background-color: $secondary;
    box-shadow: -4px 0px 16px rgba(46, 131, 80, 0.5);
    border-radius: 20px 0px 0px 20px;
    height: 100vh;
    width: 160px;
    padding: 16px 0;
    transition: all 0.3s ease-out;
    z-index: 2;
    position: absolute;
    top: 0;
    right: -176px;
  }
  .bg {
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    right: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }
  position: absolute;
  right: 0;
  top: 0;
  height: 100vh;
  z-index: 999;
}

.menu-list {
  li {
    &:hover {
      span,
      button {
        color: $secondary;
      }
      background-color: $primary;
    }
    span {
      line-height: 56px;
      color: $primary;
    }
    button {
      background-color: transparent;
      font-size: 20px;
      font-weight: bold;
      color: $primary;
    }
    display: flex;
    justify-content: center;
    width: 100%;
    height: 56px;
  }
  .user-info {
    .photo {
      img {
        height: 100%;
        width: 100%;
        object-fit: cover;
      }
      border-radius: 999px;
      border: 2px solid $primary;
      height: 72px;
      margin-bottom: 12px;
      overflow: hidden;
      width: 72px;
    }
    p {
      color: $gray-800;
      font-size: 20px;
      font-weight: bold;
      margin: 0;
      letter-spacing: 1px;
    }
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: auto;
    padding: 0;
    margin-bottom: 20px;
  }
  padding: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
