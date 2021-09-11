<template>
  <div
    class="main-wrap node-list-wrap menu-layout"
    :style="{ height }"
    @click="
      selectedMenu = [];
      isFilterOpen = false;
    "
  >
    <Navbar></Navbar>
    <div class="header">
      <div>
        <p>文字日記</p>
        <div class="hint">
          每日首筆獲得10~300
          <img src="@/assets/images/currency-reverse.svg" alt="" />
        </div>
      </div>
      <div class="d-flex">
        <button class="btn-circle me-3" @click.stop="$router.push('/drawing-notes')">
          <span class="material-icons">palette</span>
        </button>
        <button class="btn-circle" @click.stop="openFilter">
          <span class="material-icons">filter_alt</span>
        </button>
      </div>
    </div>
    <div class="content scroll-bar over-scroll" @click="isFilterOpen = false">
      <div v-if="searchingWord" class="search-status">
        <p class="search-result">
          搜尋"&nbsp;&nbsp;<span>{{ searchingWord }}</span
          >&nbsp;&nbsp;"結果
        </p>
        <button class="cancel-btn btn" @click="clearSearch">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="data-group" v-for="(item, i) in noteList" :key="i">
        <div class="date-wrap">
          <span>{{ item.date }}</span>
        </div>
        <ul class="note-list">
          <li
            v-for="(item, n) in noteList[i].notes"
            :key="n"
            @click="editNote(item.id)"
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
                <button @click="editNote(item.id)">編輯</button>
              </li>
              <li>
                <button @click="previewNote(item.id)">預覽</button>
              </li>
              <li>
                <button
                  @click="
                    selectedId = item.id;
                    $store.dispatch('openModal', {
                      type: 'deleteCheck',
                      asynchronous: false,
                    });
                  "
                >
                  刪除
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="default" v-if="noteList.length === 0">
        <span class="material-icons"> playlist_add </span>
        還沒有日記喔！
      </div>
    </div>
    <button class="add-btn" @click="createNote">
      <span>新增日記</span>
    </button>
    <div class="slide-up-window" :class="{ active: isFilterOpen }" @click.stop>
      <p>搜尋</p>
      <button class="close-btn" @click="isFilterOpen = false">
        <span class="material-icons">close</span>
      </button>
      <input type="search" v-model="filterKeyword" />
      <hr />
      <p>排序</p>
      <div class="btn-group">
        <button
          class="btn-rectangle"
          :class="{ active: filterSort === 'new->old' }"
          @click="filterSort = 'new->old'"
        >
          新到舊
        </button>
        <button
          class="btn-rectangle"
          :class="{ active: filterSort === 'old->new' }"
          @click="filterSort = 'old->new'"
        >
          舊到新
        </button>
      </div>
      <hr />
      <div class="btn-group status-group">
        <button class="btn-rectangle cancel-btn" @click="filterReset">
          取消
        </button>
        <button class="btn-rectangle apply-btn" @click="filterApply">
          套用
        </button>
      </div>
    </div>
    <DeleteCheck @deleteEvent="deleteNote"></DeleteCheck>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Note, NoteList } from '@/types';
import Navbar from '@/components/Navbar.vue';
import DeleteCheck from '@/components/DeleteCheck.vue';

export default defineComponent({
  name: 'NoteList',
  components: {
    Navbar,
    DeleteCheck,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const isFilterOpen = ref<boolean>(false);
    const noteList = ref<Array<NoteList>>([]);
    const selectedMenu = ref<Array<string>>([]);
    const noteData = computed(() => store.state.userData.noteData);
    const filterSort = ref('new->old');
    const tempFilterSort = ref('new->old');
    const filterKeyword = ref<string>('');
    const searchingWord = ref<string>('');
    const selectedId = ref<number>();

    function getNotelist(data: Array<Note>) {
      noteList.value = [];
      const dateList: Array<string> = [];
      data.forEach((el: Note) => {
        const date = new Date(parseInt(el.id, 10));
        const dateStr = `${date.getFullYear()} / ${date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`} / ${date.getDate() >= 10 ? date.getDate() : `0${date.getDate()}`}`;
        const index = dateList.indexOf(dateStr);
        if (index === -1) {
          noteList.value.push({
            date: dateStr,
            notes: [el],
            time: [],
          });
          dateList.push(dateStr);
        } else {
          noteList.value[index].notes.push(el);
        }
      });
      noteList.value.forEach((obj) => {
        const group = obj;
        if (filterSort.value === 'new->old') {
          group.notes.sort((a, b) => Number(b.id) - Number(a.id));
        } else {
          group.notes.sort((a, b) => Number(a.id) - Number(b.id));
        }
        group.notes.forEach((note) => {
          const { id } = note;
          const date = new Date(parseInt(id, 10));
          const timeStr = `${date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`} : ${date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`}`;
          group.time.push(timeStr);
        });
      });
      if (filterSort.value === 'new->old') {
        noteList.value.reverse();
      }
    }

    onMounted(async () => {
      if (!noteData.value || noteData.value.length <= 1) {
        await store.dispatch('getNoteData', { type: 'text' });
      }
      getNotelist(noteData.value);
    });

    watch(noteData, (newVal, oldVal) => {
      getNotelist(newVal);
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

    function editNote(id: number) {
      router.push({
        name: 'TextEditor',
        params: { status: 'note-edit', id },
      });
    }

    function previewNote(id: number) {
      router.push({
        name: 'NotePreviewer',
        params: {
          type: 'text',
          id,
        },
      });
    }

    async function deleteNote() {
      store.commit('closeModal');
      await store.dispatch('updateNoteData', {
        type: 'text',
        status: 'delete',
        id: selectedId.value,
      });
      let times = 0;
      const closeModal = setInterval(() => {
        if (times > 50 || store.state.modalLoaded) {
          store.commit('closeModal');
          clearInterval(closeModal);
          times += 1;
          selectedMenu.value = [];
        }
      });
    }

    function filterApply() {
      let filteredNoteData = JSON.parse(JSON.stringify(noteData.value));
      if (filterKeyword.value !== '') {
        filteredNoteData = filteredNoteData.filter((note: Note) => note.title.search(
          filterKeyword.value,
        ) >= 0);
      }
      getNotelist(filteredNoteData);
      tempFilterSort.value = filterSort.value;
      searchingWord.value = filterKeyword.value;
      isFilterOpen.value = false;
    }

    function filterReset() {
      tempFilterSort.value = filterSort.value;
      filterKeyword.value = '';
      isFilterOpen.value = false;
    }

    function clearSearch() {
      getNotelist(noteData.value);
      searchingWord.value = '';
    }

    watch(isFilterOpen, (newVal) => {
      if (!newVal) {
        filterKeyword.value = '';
      }
    });

    return {
      clearSearch,
      createNote,
      deleteNote,
      editNote,
      filterApply,
      filterKeyword,
      filterReset,
      filterSort,
      height: computed(() => store.state.height),
      isFilterOpen,
      noteList,
      openFilter,
      previewNote,
      searchingWord,
      selectedMenu,
      selectedId,
    };
  },
});
</script>

<style lang="scss" scoped>
.node-list-wrap {
  .add-btn {
    &:hover,
    &:active {
      background-color: $tertiary;
    }
    span {
      font-size: 24px;
      font-weight: bold;
    }
    align-items: center;
    background-color: $secondary;
    box-shadow: 4px 0px 16px rgba(68, 153, 102, 0.7);
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
  .hint {
    font-size: 16px;
    color: $secondary;
    letter-spacing: 2px;
    height: 35px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .header {
    button {
      span {
        font-size: 28px;
      }
      height: 44px;
      width: 44px;
    }
    img {
      height: 22px;
      width: 22px;
      margin-left: 8px;
    }
    p {
      color: $secondary;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
      text-align: left;
    }
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 20px;
    margin-top: 16px;
    padding: 0 16px;
    width: 100%;
  }
  > .content {
    flex-grow: 1;
    padding: 0px 16px 0px 16px;
    width: 100%;
    overflow-y: auto;
    padding-bottom: 90px;
  }
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: flex-start;
  width: 100%;
}
.default {
  span {
    color: $secondary;
    font-size: 90px;
    margin-bottom: 20px;
  }
  color: $secondary;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.data-group {
  .date-wrap {
    span {
      color: $primary;
      font-size: 22px;
      font-weight: bold;
    }
    // border: 1px solid $secondary;
    background-color: $secondary;
    border-radius: 99px;
    margin-bottom: 12px;
    padding: 4px 16px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .note-list {
    > li {
      > button {
        &:hover,
        &:active,
        &.active {
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
      &:last-of-type {
        border: 0;
        margin-bottom: 0;
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
    margin-bottom: 12px;
  }
  display: flex;
  flex-direction: column;
}
</style>
