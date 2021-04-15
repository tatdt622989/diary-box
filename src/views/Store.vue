<template>
  <div class="main-wrap store-wrap" :style="{ height: height + 'px' }">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/model-list')">
        <span class="material-icons">arrow_back</span>
      </button>
      <p>解鎖模型</p>
    </div>
    <div class="content">
      <div class="currency">
        <span>999</span>
        <span class="material-icons">monetization_on</span>
      </div>
      <div class="products container-fluid">
        <div class="row">
          <div class="item col-6 col-md-4 col-lg-3">
            <div class="item-wrap">
              <div class="product"></div>
              <button class="price">
                <span>999</span>
                <span class="material-icons">monetization_on</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Menu></Menu>
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
import Navbar from '@/components/Navbar.vue';
import Menu from '@/components/Menu.vue';

export default defineComponent({
  name: 'ModelList',
  components: {
    Navbar,
    Menu,
  },
  setup() {
    const height = ref<number>(0);

    onMounted(() => {
      height.value = window.innerHeight;
      window.addEventListener('resize', () => {
        height.value = window.innerHeight;
      }, false);
    });

    return {
      height,
    };
  },
});
</script>

<style lang="scss">
.store-wrap {
  .currency {
    span:not(.material-icons) {
      color: $secondary;
      flex-grow: 1;
      font-size: 28px;
      font-weight: bold;
      padding: 0 16px;
      text-align: left;
    }
    .material-icons {
      color: $secondary;
      font-size: 32px;
      margin-right: 10px;
    }
    align-items: center;
    border-radius: 999px;
    border: 2px solid $secondary;
    display: flex;
    height: 52px;
    justify-content: flex-end;
    margin-bottom: 32px;
    margin-top: 20px;
    width: 190px;
  }
  .header {
    p {
      flex-grow: 1;
      padding-right: 52px;
      text-align: center;
    }
  }
  .content {
    align-items: center;
    padding: 0;
    flex-grow: 1;
  }
  .item-wrap {
    .price {
      .material-icons {
        color: $secondary;
        font-size: 32px;
        margin-right: 10px;
      }
      span:not(.material-icons) {
        color: $secondary;
        flex-grow: 1;
        font-size: 24px;
        font-weight: bold;
      }
      align-items: center;
      background: $primary;
      border-radius: 999px;
      display: flex;
      height: 52px;
      justify-content: center;
      width: 140px;
      padding: 0;
    }
    .product {
      flex-grow: 1;
      width: 100%;
    }
    align-items: center;
    background-color: $secondary;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    height: 230px;
    padding: 16px;
    position: relative;
  }
  display: flex;
  flex-direction: column;
}
</style>
