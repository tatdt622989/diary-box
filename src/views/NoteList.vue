<template>
  <div class="node-list-wrap">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/')">
        <span class="material-icons">home</span>
      </button>
      <p>筆記一覽</p>
      <button class="btn-circle" @click="openFilter">
        <span class="material-icons">filter_alt</span>
      </button>
    </div>
    <div class="content" @click="isFilterOpen = false">
      <div class="data-group">
        <div class="date-wrap">
          <span>2021 / 02 / 25</span>
        </div>
        <ul class="note-list">
          <li>
            <span class="title">過年採買清單</span>
            <span class="time">08:30</span>
            <button class="btn-circle">
              <span class="material-icons">more_vert</span>
            </button>
            <ul class="menu" v-if="selectedMenu">
              <li>
                <button>查看</button>
              </li>
              <li>
                <button>編輯</button>
              </li>
              <li>
                <button>編輯位置</button>
              </li>
              <li>
                <button>刪除</button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <button class="add-btn">
      <span class="material-icons">add</span>
      <span>新增筆記</span>
    </button>
    <div class="filter-wrap" :class="{active : isFilterOpen}">
      <p>搜尋</p>
      <button class="close-btn" @click="isFilterOpen = false">
        <span class="material-icons">close</span>
      </button>
      <input type="search">
      <hr>
      <p>類型</p>
      <div class="btn-group">
        <button class="btn-rectangle">建立日期</button>
        <button class="btn-rectangle">修改日期</button>
      </div>
      <hr>
      <p>排序</p>
      <div class="btn-group">
        <button class="btn-rectangle">新到舊</button>
        <button class="btn-rectangle">舊到新</button>
      </div>
      <hr>
      <div class="btn-group status-group">
        <button class="btn-rectangle cancel-btn">取消</button>
        <button class="btn-rectangle apply-btn">套用</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
} from 'vue';
import Navbar from '@/components/Navbar.vue';

export default defineComponent({
  name: 'NoteList',
  components: {
    Navbar,
  },
  setup() {
    const isFilterOpen = ref<boolean>(false);

    function openFilter() {
      isFilterOpen.value = true;
    }

    return {
      isFilterOpen,
      openFilter,
    };
  },
});
</script>

<style lang="scss">
  .node-list-wrap {
    .header {
      p {
        color: $secondary;
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      align-items: center;
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      padding: 0 20px;
      width: 100%;
    }
    .content {
      flex-grow: 1;
      padding:  32px 20px;
      width: 100%;
    }
    .add-btn {
      &:hover, &:active {
        background-color: $tertiary;
      }
      span {
        margin-right: 4px;
        font-size: 24px;
        font-weight: bold;
      }
      align-items: center;
      background-color: $secondary;
      border-radius: 999px;
      bottom: 32px;
      color: $primary;
      display: flex;
      height: 52px;
      justify-content: center;
      padding: 0 16px;
      position: fixed;
      right: 20px;
    }
    align-items: center;
    background: $primary;
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: flex-start;
    overflow: hidden;
    position: relative;
    width: 100%;
  }
  .data-group {
    .date-wrap {
      span {
        color: $secondary;
        font-size: 22px;
        font-weight: bold;
      }
      border: 1px solid $secondary;
      width: 156px;
      margin-bottom: 12px;
    }
    .note-list {
      button {
        &:hover, &:active {
          span {
            color: $primary;
          }
          background-color: $secondary;
        }
        span {
          color: $secondary;
        }
        background-color: $primary;
      }
      li {
        >span {
          color: $secondary;
          font-size: 20px;
        }
        .menu {
          li {
            &:last-child {
              button {
                &:after {
                  content: normal;
                }
              }
            }
          }
          button {
            &:hover, &:active {
              background-color: $tertiary;
            }
            &::after {
              background-color: $primary;
              bottom: 0;
              content: "";
              height: 1px;
              left: 50%;
              position: absolute;
              transform: translateX(-50%);
              width: 90px;
            }
            background-color: transparent;
            color: $primary;
            font-size: 18px;
            font-weight: bold;
            height: 44px;
            margin: 0 auto;
            position: relative;
            text-align: center;
            transition: $t-base;
            width: 100%;
          }
          background-color: $secondary;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: 114px;
        }
        align-items: center;
        border-bottom: 1px solid $secondary;
        display: flex;
        justify-content: space-between;
        padding: 7px 0;
        position: relative;
        width: 100%;
      }
      align-items: center;
      display: flex;
      height: 68px;
      justify-content: space-between;
      margin-bottom: 0;
      padding: 0;
    }
    display: flex;
    flex-direction: column;
  }
  .filter-wrap {
    p {
      font-size: 20px;
      font-weight: bold;
      color: $primary;
      margin-bottom: 20px;
    }
    input {
      height: 52px;
      width: 100%;
      border-radius: 999px;
      border: 3px solid $primary;
      background: transparent;
      text-indent: 20px;
      font-size: 20px;
      font-weight: bold;
      color: $primary;
    }
    .close-btn {
      &:hover {
        background-color: $tertiary;
      }
      span {
        color: $primary;
        line-height: 52px;
      }
      background-color: transparent;
      border-radius: 999px;
      height: 52px;
      position: absolute;
      right: 20px;
      top: 8px;
      transition: $t-base;
      width: 52px;
    }
    .btn-group {
      button {
        &:first-child {
          margin-right: 20px;
        }
        width: 170px;
      }
      .cancel-btn {
        &:hover {
          background-color: darken(#9F9684, 10%);
        }
        background-image: linear-gradient();
        background-color: #9F9684;
        color: $secondary;
        border: 0;
        margin-top: 20px;
      }
      .apply-btn {
        &:hover {
          background-position: 0 0;
        }
        background: linear-gradient(90deg, $primary 0%, $primary 50%,
        $secondary 110%) 100% 0 / 200%;
        border: 0;
        color: $secondary;
        margin-top: 20px;
      }
      display: flex;
      justify-content: flex-start;
    }
    .status-group {
      justify-content: flex-end;
    }
    hr {
      height: 0;
      border-top: 1px dashed #9F9684;
    }
    &.active {
      bottom: 0;;
    }
    background-color: $secondary;
    border-radius: 20px 20px 0 0;
    bottom: -540px;
    height: 540px;
    padding: 24px 28px 25px 28px;
    position: absolute;
    text-align: left;
    transition: $t-base;
    width: 100%;
  }
</style>
