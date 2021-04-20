<template>
  <div
    class="main-wrap model-list-wrap all"
    @click="selectedMenu = []"
    :style="{ height: height + 'px' }"
  >
    <Navbar></Navbar>
    <div class="header">
      <button
        class="btn-circle"
        @click="$router.push('/')"
        v-if="listMode === 'using'"
      >
        <span class="material-icons">home</span>
      </button>
      <p>所有物品</p>
    </div>
    <div class="content container-fluid">
      <div class="row">
        <div
          class="item col-6 col-md-4 col-lg-3"
          v-for="(item, i) in models"
          :key="i"
        >
          <div class="item-wrap" :class="{ active: i === 0 }">
            <div>
              <span class="quantity">20 / 20</span>
              <button
                class="menu-btn btn-circle"
                @click.stop="selectedMenu = [i, n]"
                :class="{
                  active: selectedMenu[0] === i && selectedMenu[1] === n,
                }"
              >
                <span class="material-icons">more_vert</span>
              </button>
            </div>
            <span class="item-status">{{ i === 0 ? '使用中' : '未使用' }}</span>
            <ul
              class="function-menu"
              @click.stop
              v-if="selectedMenu[0] === i && selectedMenu[1] === n"
            >
              <li>
                <button>預覽</button>
              </li>
              <li>
                <button>放置到場景</button>
              </li>
              <li>
                <button>刪除</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <Menu></Menu>
    <FunctionBar :mode="'model-list'"></FunctionBar>
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
import FunctionBar from '@/components/FunctionBar.vue';

export default defineComponent({
  name: 'ModelList',
  components: {
    Navbar,
    Menu,
    FunctionBar,
  },
  setup() {
    const models = ref<Array<object>>([{}, {}]);
    const selectedMenu = ref<Array<string>>([]);
    const height = ref<number>(0);
    const listMode = ref<string>('using');

    onMounted(() => {
      height.value = window.innerHeight;
      window.addEventListener('resize', () => {
        height.value = window.innerHeight;
      }, false);
    });

    return {
      selectedMenu,
      models,
      height,
      listMode,
    };
  },
});
</script>

<style lang="scss">
.model-list-wrap {
  .item-wrap {
    &.active{
      background-color: $secondary;
    }
    .item-status {
      color: $primary;
      font-size: 20px;
      font-weight: bold;
    }
    >div {
      display: flex;
      width: 100%;
    }
    .quantity {
      color: $primary;
      flex-grow: 1;
      flex-wrap: wrap;
      font-size: 20px;
      font-weight: bold;
      height: 52px;
      margin: 0;
      text-align: left;
    }
    .menu-btn {
      &.active {
        span {
          color: $secondary;
        }
        background-color: $primary;
      }
      position: relative;
      right: -10px;
      top: -10px;
    }
    background-color: #d4dbba;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    height: 230px;
    justify-content: space-between;
    padding: 16px;
    position: relative;
  }
  .function-menu {
    button {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }
    box-shadow: 4px 0px 16px rgba(68, 153, 102, 0.5);
    opacity: 1;
  }
  &.all .header {
    p {
      flex-grow: 1;
      padding-right: 52px;
      text-align: center;
    }
  }
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
