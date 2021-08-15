<template>
  <div class="menu-wrap" :class="{ active: isMenuOpen }">
    <div class="content" :style="{ height }">
      <div class="w-100">
        <div class="w-100 d-flex">
          <button class="close-btn t-base" @click="menuToggler">
            <span class="material-icons">close</span>
          </button>
        </div>
        <ul class="menu-list">
          <li class="t-base user-info" v-if="userInfo">
            <div class="photo">
              <span class="material-icons" v-if="!userInfo.photoURL"
                >account_circle</span
              >
              <img :src="userInfo.photoURL" v-if="userInfo.photoURL" />
            </div>
            <p class="w-100 px-2 text-center user-text">
              {{ userInfo.displayName || (userData && userData.name) }}
            </p>
          </li>

          <li class="t-base" v-if="userInfo && userInfo.email">
            <button @click="signOut">
              <span class="material-icons">logout</span>
              會員登出
            </button>
          </li>
          <li class="t-base">
            <button @click="openModal('guide')">
              <span class="material-icons">help</span>
              操作引導
            </button>
          </li>
          <!-- <li class="t-base">
          <button @click="openModal">
            <span class="material-icons">settings</span>
            畫質設定
          </button>
        </li> -->
        </ul>
      </div>
      <!-- <div class="donate">
        <p>贊助作者</p>
        <a
          href="https://payment.opay.tw/Broadcaster/Donate/295B12291C902E3532C2AEAD0516C39E"
        >
          <img src="@/assets/images/coffee.jpg" alt="" />
        </a>
      </div> -->
      <div class="about">
        <p>聯絡方式</p>
        <p>contact@6yuwei.com</p>
        <div class="d-flex justify-content-between px-4">
          <a class="website t-base" href="https://6yuwei.com" target="_blank">
            <img src="@/assets/images/web-logo.svg" alt="六魚丸設計" />
          </a>
          <a
            class="facebook t-base"
            href="https://www.facebook.com/DiaryBoxAPP/?ref=pages_you_manage"
            target="_blank"
          >
            <img src="@/assets/images/facebook.svg" alt="Facebook" />
          </a>
        </div>
      </div>
      <p class="uid">UID：{{ uid }}</p>
    </div>
    <transition name="fade">
      <div class="bg" v-if="isMenuOpen" @click="menuToggler"></div>
    </transition>
  </div>
</template>

<script lang="ts">
import router from '@/router';
import {
  ref,
  reactive,
  defineComponent,
  computed,
  onMounted,
  onUnmounted,
} from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Menu',
  emits: ['set-data'],
  components: {
  },
  setup(props, { attrs, slots, emit }) {
    const store = useStore();
    const timer = ref<number | null>(null);
    const uid = ref<number | null>();

    function resize() {
      if (timer.value) {
        clearTimeout(timer.value);
      }
      timer.value = setTimeout(() => {
        store.commit('getHeight', `${window.innerHeight}px`);
        timer.value = null;
      }, 500);
    }

    onMounted(() => {
      if (store.state.userInfo) {
        uid.value = store.state.userInfo.uid;
      }
      window.addEventListener('resize', resize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', resize);
    });

    function openModal(type: string) {
      store.commit('menuToggler', false);
      store.dispatch('openModal', {
        type,
        asynchronous: false,
      });
    }

    function signOut() {
      openModal('signOut');
      router.push('/');
    }

    return {
      isMenuOpen: computed(() => store.state.isMenuOpen),
      menuToggler: () => store.commit('menuToggler', false),
      height: computed(() => store.state.height),
      userInfo: computed(() => store.state.userInfo),
      userData: computed(() => store.state.userData),
      signOut,
      openModal,
      uid,
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
  .user-text {
    span {
      font-size: 16px;
    }
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
      margin-left: 8px;
      margin-bottom: 8px;
    }
    .about {
      p {
        &:nth-of-type(2) {
          font-size: 15px;
          margin-bottom: 16px;
        }
        color: $primary;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 6px;
      }
      a {
        &:hover,
        &:active {
          transform: scale(1.1);
        }
        background-color: transparent;
        padding: 0;
      }
      img {
        width: 44px;
      }
      margin: 0 16px;
      width: calc(100% - 32px);
    }
    .donate {
      p {
        color: $primary;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 12px;
      }
      a {
        img {
          object-fit: cover;
          width: 100%;
          height: 100%;
        }
        border-radius: 8px;
        display: flex;
        height: 80px;
        width: 120px;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        margin: 0;
        margin-bottom: 16px;
      }
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
    }
    background-color: $secondary;
    box-shadow: -4px 0px 16px rgba(46, 131, 80, 0.5);
    border-radius: 20px 0px 0px 20px;
    height: 100vh;
    width: 190px;
    padding: 16px 0;
    transition: all 0.3s ease-out;
    z-index: 2;
    position: absolute;
    top: 0;
    right: -220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
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
  z-index: 1001;
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
      line-height: 52px;
      color: $primary;
      margin-right: 12px;
    }
    button {
      background-color: transparent;
      font-size: 20px;
      font-weight: bold;
      color: $primary;
      display: flex;
      align-items: center;
    }
    display: flex;
    justify-content: center;
    width: 100%;
    height: 52px;
  }
  .user-info {
    &:hover {
      span {
        color: $primary;
      }
      background-color: transparent;
    }
    .photo {
      > span {
        margin: 0;
        font-size: 72px;
      }
      img {
        height: 100%;
        width: 100%;
        object-fit: cover;
      }
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      border: 2px solid $primary;
      display: flex;
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
    margin-bottom: 8px;
  }
  padding: 0;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.uid {
  color: #989898;
  font-size: 13px;
  word-break: break-all;
  margin: 0 16px;
  text-align: center;
  margin-top: 6px;
}
</style>
