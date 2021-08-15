<template>
  <div
    class="main-wrap menu-layout drawing-notes-wrap"
    @click="
      selectedMenu = [];
      isFilterOpen = false;
    "
    :style="{ height }"
  >
    <Navbar></Navbar>
    <div class="header">
      <div>
        <p>手繪日記</p>
        <div class="hint">
          每日首筆獲得50~250
          <img src="@/assets/images/currency-reverse.svg" alt="" />
        </div>
      </div>
      <div class="d-flex">
        <button
          class="btn-circle me-3"
          @click.stop="$router.push('/note-list')"
        >
          <span class="material-icons">text_fields</span>
        </button>
        <button class="btn-circle" @click.stop="isFilterOpen = true">
          <span class="material-icons">filter_alt</span>
        </button>
      </div>
    </div>
    <div class="content scroll-bar over-scroll" ref="content">
      <div v-if="searchingWord" class="search-status">
        <p class="search-result">
          搜尋"&nbsp;&nbsp;<span>{{ searchingWord }}</span
          >&nbsp;&nbsp;"結果
        </p>
        <button class="cancel-btn btn" @click="clearSearch">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="day-items" v-for="(val, key) in filteredData" :key="key">
        <div class="date">
          <span>{{ key }}</span>
        </div>
        <div class="items-wrap">
          <div
            class="item"
            v-for="(item, i) in filteredData[key]"
            :key="item.id"
            @click="goToEditor(item)"
          >
            <div class="item-header">
              <span class="title ellipsis" :title="item.title">{{
                item.title
              }}</span>
              <button
                class="btn btn-circle"
                @click.stop="selectedMenu = [key, i]"
              >
                <span class="material-icons">more_vert</span>
              </button>
            </div>
            <div class="img-frame" :id="item.id"></div>
            <ul
              class="function-menu"
              @click.stop
              v-if="selectedMenu[0] === key && selectedMenu[1] === i"
            >
              <li>
                <button @click="goToEditor(item)">編輯</button>
              </li>
              <li>
                <button
                  @click="
                    $router.push({
                      name: 'NotePreviewer',
                      params: {
                        type: 'canvas',
                        id: item.id,
                        URL: item.URL,
                        title: item.title,
                      },
                    })
                  "
                >
                  預覽
                </button>
              </li>
              <li>
                <button @click="imageDownload(item.URL, item.id)">下載</button>
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
          </div>
        </div>
      </div>
    </div>
    <button class="add-btn" @click="createNote">
      <span>新增日記</span>
    </button>
    <div class="default" v-if="!canvasData || canvasData.length === 0">
      <span class="material-icons"> playlist_add </span>
      還沒有日記喔！
    </div>
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
    <DeleteCheck @deleteEvent="deleteCanvas"></DeleteCheck>
  </div>
</template>

<script lang="ts">
import {
  ref,
  nextTick,
  defineComponent,
  onMounted,
  computed,
  watch,
  onUnmounted,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import DeleteCheck from '@/components/DeleteCheck.vue';
import { CanvasNote, CanvasNoteList } from '@/types';

export default defineComponent({
  name: 'DrawingNotes',
  components: {
    Navbar,
    DeleteCheck,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const canvasData = computed(() => store.state.userData.canvasData);
    const filteredData = ref<CanvasNoteList>({});
    const selectedMenu = ref<Array<number>>([]);
    const content = ref<HTMLElement>();
    const isFilterOpen = ref<boolean>(false);
    const selectedId = ref();
    const filterSort = ref('new->old');
    const tempFilterSort = ref('new->old');
    const filterKeyword = ref<string>('');
    const searchingWord = ref<string>('');

    function createNote() {
      const ts = Date.now();
      router.push({
        name: 'Canvas',
        params: { status: 'add', id: ts },
      });
    }

    function zeroPadding(num: number) {
      return num < 10 ? `0${num}` : num;
    }

    function updateData(data: Array<CanvasNote> | null = canvasData.value) {
      if (data) {
        filteredData.value = {};
        data.forEach((el: CanvasNote) => {
          const date = new Date(Number(el.id));
          const dateStr = `${date.getFullYear()} / ${zeroPadding(date.getMonth() + 1)} / ${zeroPadding(date.getDate())}`;
          if (!filteredData.value[dateStr]) {
            filteredData.value[dateStr] = [el];
          } else {
            filteredData.value[dateStr].push(el);
          }
        });
      }
    }

    function filterApply() {
      let tempData: Array<CanvasNote> = canvasData.value
        ? JSON.parse(JSON.stringify(canvasData.value)) : [];
      if (filterSort.value === 'new->old') {
        tempData.reverse();
      }
      if (filterKeyword.value !== '') {
        tempData = tempData.filter((data: CanvasNote) => data.title.search(
          filterKeyword.value,
        ) >= 0);
      }
      updateData(tempData);
      tempFilterSort.value = filterSort.value;
      searchingWord.value = filterKeyword.value;
      isFilterOpen.value = false;
    }

    async function imageDownload(URL: string, id: number) {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
      img.src = URL;
      img.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        img.addEventListener('load', resolve, false);
      });
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL();
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${id}.png`;
      link.click();
    }

    watch(canvasData, () => {
      filterApply();
    });

    function displayImg() {
      const allEl = document.querySelectorAll('.img-frame');
      const maxHeight = window.innerHeight;
      allEl.forEach((el) => {
        const offset = el.getBoundingClientRect().bottom;
        if (maxHeight - offset > -70 && el.childNodes.length === 0) {
          const img = document.createElement('img');
          img.src = canvasData.value.find((data: CanvasNote) => data.id === el.id).URL;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          el.appendChild(img);
        }
      });
    }

    let timer: number;

    function scroll() {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        displayImg();
      }, 100);
    }

    function goToEditor(data: CanvasNote) {
      router.push({
        name: 'Canvas',
        params: {
          status: 'edit', id: data.id, URL: data.URL, title: data.title,
        },
      });
    }

    async function deleteCanvas() {
      store.commit('closeModal');
      await store.dispatch('updateNoteData', {
        type: 'canvas',
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

    function filterReset() {
      tempFilterSort.value = filterSort.value;
      filterKeyword.value = '';
      isFilterOpen.value = false;
    }

    function clearSearch() {
      updateData();
      searchingWord.value = '';
    }

    watch(isFilterOpen, (newVal) => {
      if (!newVal) {
        filterKeyword.value = '';
      }
    });

    onMounted(async () => {
      filterApply();
      await nextTick();
      displayImg();
      if (content.value) {
        content.value.addEventListener('scroll', scroll);
      }
    });

    onUnmounted(() => {
      if (content.value) {
        content.value.removeEventListener('scroll', scroll);
      }
    });

    return {
      canvasData,
      clearSearch,
      content,
      createNote,
      deleteCanvas,
      filterApply,
      filteredData,
      filterKeyword,
      filterReset,
      filterSort,
      goToEditor,
      height: computed(() => store.state.height),
      imageDownload,
      isFilterOpen,
      searchingWord,
      selectedId,
      selectedMenu,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/mixins/mixins.scss";

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
.content {
  .date {
    span {
      color: #449966;
      font-size: 22px;
      font-weight: bold;
    }
    align-items: center;
    background-color: $secondary;
    border-radius: 99px;
    display: flex;
    height: 44px;
    justify-content: center;
    margin-bottom: 8px;
  }
  .day-items {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .items-wrap {
    &:last-of-type {
      margin-bottom: 32px;
    }
    .item {
      .item-header {
        button {
          margin-right: 6px;
          height: 44px;
          width: 44px;
        }
        align-items: center;
        display: flex;
        padding: 6px 0;
        padding-left: 12px;
      }
      .title {
        color: $primary;
        flex-grow: 1;
        font-size: 18px;
        font-weight: bold;
        text-align: left;
      }
      .img-frame {
        background: $primary;
        border-radius: 15px;
        margin: 12px;
        margin-top: 0;
        flex-grow: 1;
        overflow: hidden;
        animation: loading 1s linear infinite;
        background: linear-gradient(
          90deg,
          $secondary,
          #fffaec,
          $secondary,
          #fffaec
        );
        background-size: 300% auto;
        @keyframes loading {
          0% {
            background-position-x: 0;
          }
          100% {
            background-position: 100%;
          }
        }
      }
      .function-menu {
        top: 50px;
      }
      @include phone {
        width: calc(50% - 16px);
      }
      @include tablet {
        .title {
          font-size: 18px;
        }
        width: calc(33.333% - 16px);
      }
      @include desktop {
        .title {
          font-size: 20px;
        }
        width: calc(25% - 16px);
      }
      background: $secondary;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 240px;
      margin: 8px 8px;
      position: relative;
    }
    display: flex;
    flex-wrap: wrap;
    margin: 0 -8px;
  }
  padding: 0 16px;
  overflow-y: auto;
}
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
.drawing-notes-wrap {
  display: flex;
  flex-direction: column;
}
</style>
