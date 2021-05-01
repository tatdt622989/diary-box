<template>
  <div class="main-wrap node-list-wrap" :style="{ height }" @click="selectedMenu = []">
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
      <div class="data-group" v-for="(item, i) in noteList" :key="i">
        <div class="date-wrap">
          <span>{{ item.date }}</span>
        </div>
        <ul class="note-list">
          <li
            v-for="(item, n) in noteList[i].notes"
            :key="n"
            @click="editNote(item)"
          >
            <span class="title">{{ item.title }}</span>
            <span class="time">{{ noteList[i].time[[n]] }}</span>
            <button
              class="btn-circle"
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
                <button @click="editNote(item)">查看</button>
              </li>
              <li>
                <button>預覽</button>
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
    <button class="add-btn" @click="createNote">
      <span class="material-icons">add</span>
      <span>新增筆記</span>
    </button>
    <div class="filter-wrap" :class="{ active: isFilterOpen }">
      <p>搜尋</p>
      <button class="close-btn" @click="isFilterOpen = false">
        <span class="material-icons">close</span>
      </button>
      <input type="search" />
      <hr />
      <p>類型</p>
      <div class="btn-group">
        <button class="btn-rectangle">建立日期</button>
        <button class="btn-rectangle">修改日期</button>
      </div>
      <hr />
      <p>排序</p>
      <div class="btn-group">
        <button class="btn-rectangle">新到舊</button>
        <button class="btn-rectangle">舊到新</button>
      </div>
      <hr />
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
  computed,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Note, NoteList } from '@/types';
import Navbar from '@/components/Navbar.vue';

export default defineComponent({
  name: 'NoteList',
  components: {
    Navbar,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const isFilterOpen = ref<boolean>(false);
    const noteList = ref<Array<NoteList>>([]);
    const selectedMenu = ref<Array<string>>([]);
    const noteData = computed(() => store.state.noteData);

    onMounted(() => {
      const dateList: Array<string> = [];
      try {
        if (localStorage.getItem('note-data')) {
          noteData.value.forEach((el: Note) => {
            console.log(el.id);
            const date = new Date(parseInt(el.id, 10));
            const dateStr = `${date.getFullYear()} / ${date.getMonth() + 1 > 10 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`} / ${date.getDate() > 10 ? date.getDate() : `0${date.getDate()}`}`;
            console.log(dateStr);
            const timeStr = `${date.getHours() > 10 ? date.getHours() : `0${date.getHours()}`} : ${date.getMinutes() > 10 ? date.getMinutes() : `0${date.getMinutes()}`}`;
            const index = dateList.indexOf(dateStr);
            if (index === -1) {
              noteList.value.push({
                date: dateStr,
                notes: [el],
                time: [timeStr],
              });
              dateList.push(dateStr);
            } else {
              noteList.value[index].notes.push(el);
              noteList.value[index].time.push(timeStr);
            }
          });
        }
      } catch (e) {
        noteList.value = [];
      }
    });

    function openFilter() {
      isFilterOpen.value = true;
    }

    function createNote() {
      const ts = Date.now();
      router.push({
        name: 'TextEditor',
        params: { status: 'note-add', id: ts },
      });
    }

    function editNote(note: Note) {
      console.log(note);
      router.push({
        name: 'TextEditor',
        params: { status: 'note-edit', id: note.id },
      });
    }

    return {
      createNote,
      editNote,
      height: computed(() => store.state.height),
      isFilterOpen,
      noteList,
      openFilter,
      selectedMenu,
    };
  },
});
</script>

<style lang="scss">
.node-list-wrap {
  .add-btn {
    &:hover,
    &:active {
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
    padding: 0 16px;
    width: 100%;
  }
  .content {
    flex-grow: 1;
    padding: 0px 16px 0px 16px;
    margin-top: 28px;
    width: 100%;
    overflow-y: auto;
  }
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: flex-start;
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
    > li {
      > button {
        &:hover,
        &:active, &.active {
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
      > span {
        color: $secondary;
        font-size: 20px;
      }
      .title {
        flex: 1;
        padding-right: 90px;
        text-align: left;
      }
      .time {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 60px;
      }
      align-items: center;
      border-bottom: 1px solid $secondary;
      cursor: pointer;
      display: flex;
      height: 68px;
      justify-content: space-between;
      margin-bottom: 20px;
      padding: 7px 0;
      position: relative;
      width: 100%;
    }
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 0;
    padding: 0;
  }
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
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
        background-color: darken(#9f9684, 10%);
      }
      background-image: linear-gradient();
      background-color: #9f9684;
      color: $secondary;
      border: 0;
      margin-top: 20px;
    }
    .apply-btn {
      &:hover {
        background-position: 0 0;
      }
      background: linear-gradient(
          90deg,
          $primary 0%,
          $primary 50%,
          $secondary 110%
        )
        100% 0 / 200%;
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
    border-top: 1px dashed #9f9684;
  }
  &.active {
    bottom: 0;
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
