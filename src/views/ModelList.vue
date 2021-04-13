<template>
  <div
    class="main-wrap model-list-wrap"
    :class="{ all : listMode === 'all' }"
    @click="selectedMenu = []"
    :style="{ height: height + 'px' }"
  >
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/')" v-if="listMode === 'using'">
        <span class="material-icons">home</span>
      </button>
      <button
        class="btn-circle"
        @click="listMode = 'using'"
        v-if="listMode === 'all'"
      >
        <span class="material-icons">arrow_back</span>
      </button>
      <p>{{ listMode === 'using' ? '場景中物品' : '所有物品' }}</p>
      <button class="btn-circle" @click="listMode = 'all'" v-if="listMode === 'using'">
        <span class="material-icons">all_inbox</span>
      </button>
    </div>
    <div class="content container-fluid">
      <div class="row">
        <div class="item col-6 col-md-4 col-lg-3">
          <div class="item-wrap" v-for="(item, i) in models" :key="i">
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
    const models = ref<Array<object>>([{}]);
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
    align-items: flex-start;
    background-color: $secondary;
    border-radius: 20px;
    display: flex;
    height: 230px;
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
