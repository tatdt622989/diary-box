<template>
  <div
    class="main-wrap text-editor-wrap"
    :style="{ height }"
    @click="activeTool = ''"
  >
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/note-list')">
        <span class="material-icons">arrow_back</span>
      </button>
      <div class="title">
        <span class="ellipsis">{{ title }}</span>
        <button
          class="btn"
          @click="
            $store.dispatch('openModal', {
              type: 'titleEditor',
              asynchronous: false,
            })
          "
        >
          <span class="material-icons">edit</span>
        </button>
      </div>
      <button class="btn-circle" @click="saveData">
        <span class="material-icons">check</span>
      </button>
    </div>
    <div class="content container-fluid">
      <!-- <div id="editorHeader">
        <input type="text" placeholder="請輸入標題" v-model="title" />
      </div> -->
      <div class="editor-wrap" ref="editor">
        <div class="toolbar" id="toolbar">
          <div class="ql-formats">
            <button class="ql-bold btn-circle"></button>
            <select class="ql-color">
              <option selected></option>
              <option value="#e23b3b"></option>
              <option value="orange"></option>
              <option value="#53d094"></option>
              <option value="#449966"></option>
              <option value="#7070f1"></option>
              <option value="#d44b87"></option>
            </select>
            <select class="ql-background">
              <option selected></option>
              <option value="#e23b3b"></option>
              <option value="orange"></option>
              <option value="#53d094"></option>
              <option value="#449966"></option>
              <option value="#7070f1"></option>
              <option value="#d44b87"></option>
            </select>
            <select class="ql-align">
              <option value=""></option>
              <option value="right"></option>
              <option value="center"></option>
              <option value="justify"></option>
            </select>
          </div>
          <div class="ql-formats">
            <select class="ql-font">
              <option value=""></option>
              <option value="jhengHei">微軟正黑體</option>
              <option value="arial">Arial</option>
              <option value="noto-serif-tc">Noto Serif TC</option>
              <option value="noto-sans-tc">Noto Sans TC</option>
            </select>
            <select class="ql-size">
              <option :value="size" v-for="size in sizeList" :key="size">
                {{ size }}
              </option>
            </select>
          </div>
        </div>
        <div id="editorContent" class="editor" spellcheck="false"></div>
      </div>
    </div>
    <TitleEditor :title="title" @title-edit="titleEdit"></TitleEditor>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  onUnmounted,
  computed,
  nextTick,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import Quill from 'quill';
import Navbar from '@/components/Navbar.vue';
import TitleEditor from '@/components/TitleEditor.vue';
import { Note } from '@/types';

export default defineComponent({
  name: 'TextEditor',
  components: {
    Navbar,
    TitleEditor,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const activeTool = ref<string>('');
    const textColor = ref<string>('#449966');
    const bgColor = ref<string>('#F8EBCF');
    const fontSize = ref<number>(32);
    const editor = ref<HTMLElement | null>(null);
    const quill = ref<Quill | null>(null);
    const sizeList = ref<Array<string>>([]);
    const title = ref<string>('未命名標題');
    const status = ref<string | null>(null);
    const noteData = computed(() => store.state.userData.noteData);
    let qlEditor: HTMLElement | null = null;
    let noteId: string | null = null;

    const editorInit = async () => {
      let i = 4;
      while (i < 53) {
        sizeList.value.push(`${i}px`);
        i += 4;
      }

      await nextTick();

      const font = Quill.import('formats/font');
      const size = Quill.import('attributors/style/size');
      font.whitelist = ['jhengHei', 'arial', 'noto-serif-tc', 'noto-sans-tc'];
      size.whitelist = sizeList.value;
      Quill.register(font, true);
      Quill.register(size, true);
      quill.value = new Quill('#editorContent', {
        modules: {
          toolbar: '#toolbar',
        },
        placeholder: '請輸入內容',
        theme: 'snow', // or 'bubble'
      });

      qlEditor = document.querySelector('.ql-editor');

      if (status.value === 'note-edit') {
        const targetNote: Note = noteData.value.filter((note: Note) => note.id === noteId)[0];
        if (targetNote) {
          (qlEditor as HTMLElement).innerHTML = targetNote.content;
          title.value = targetNote.title;
        }
      } else {
        (qlEditor as HTMLElement).innerHTML = '';
      }
    };

    function titleEdit(str: string) {
      title.value = str;
    }

    onMounted(() => {
      if (!route.params.status) {
        router.push('/note-list');
      }
      status.value = route.params.status as string;
      noteId = route.params.id as string;
      editorInit();
    });

    async function saveData() {
      if (!title.value) {
        store.dispatch('updateToast', {
          type: 'hint',
          content: '請輸入標題',
        });
        return;
      }
      if (quill.value && status.value) {
        const content = (qlEditor as HTMLElement).innerHTML;
        const data = {
          id: noteId,
          content,
          title: title.value,
        };
        if (status.value === 'note-edit') {
          await store.dispatch('updateNoteData', {
            type: 'text',
            status: 'edit',
            data,
          });
          store.commit('closeModal');
          router.push('/note-list');
        } else if (status.value === 'note-add') {
          await store.dispatch('updateNoteData', {
            type: 'text',
            status: 'add',
            data,
          });
          store.dispatch('getPoint', { type: 'note' });
          router.push('/note-list');
        }
        store.commit('closeModal');
        // store.commit('updateNote', data);
      }
    }

    return {
      activeTool,
      bgColor,
      editor,
      editorInit,
      fontSize,
      status,
      height: computed(() => store.state.height),
      noteData: computed(() => store.state.noteData),
      saveData,
      sizeList,
      textColor,
      title,
      titleEdit,
    };
  },
});
</script>

<style lang="scss">
@import "~quill/dist/quill.bubble.css";
@import "~quill/dist/quill.snow.css";

.text-editor-wrap {
  .header {
    .title {
      min-width: 0;
      > span {
        color: $secondary;
        font-size: 24px;
        font-weight: bold;
      }
      button {
        flex-shrink: 0;
        span {
          color: $secondary;
          font-size: 24px;
        }
        align-items: center;
        display: flex;
        justify-content: center;
        padding: 0;
        height: 44px;
        width: 44px;
        flex-shrink: 0;
      }
      align-items: center;
      display: flex;
      flex-grow: 1;
      margin: 0 8px;
      justify-content: center;
    }
    button {
      flex-shrink: 0;
    }
  }
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: 66px;
}
.ql-editor {
  font-size: 20px;
}
#toolbar.toolbar {
  input[type="color"] {
    height: 0;
    opacity: 0;
    position: absolute;
    width: 0;
  }
  .ql-formats {
    .ql-picker-item {
      &:hover {
        background: $tertiary;
      }
      &:focus,
      &:active {
        border: 0;
        outline: 0;
      }
      &::after {
        background: $primary;
        bottom: 0;
        content: "";
        height: 1px;
        left: 50%;
        position: absolute;
        transform: translateX(-50%);
        width: 90%;
      }
      color: $primary;
      font-size: 20px;
      height: 52px;
      padding: 8px 0;
      position: relative;
      transition: $t-base;
      width: 100%;
    }
    .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) {
      &:first-child {
        margin-right: 10px;
      }
      &:last-child {
        margin-left: 10px;
      }
      svg {
        transform: translateY(-50%);
        margin: 0;
      }
      .ql-picker-label {
        &:active,
        &:focus {
          border: 0;
        }
        font-size: 20px;
        border: 0;
      }
      height: 44px;
      border: 2px solid $primary;
    }
    svg {
      .ql-stroke {
        stroke: $primary;
      }
      .ql-fill {
        fill: $primary;
      }
      height: 28px;
      width: 28px;
    }
    .ql-picker-label {
      &:focus,
      &:active {
        border: 0;
        outline: 0;
      }
      &::before {
        color: $primary;
        margin-right: 12px;
        line-height: 52px;
      }
      align-items: center;
      display: flex;
      font-size: 20px;
      justify-content: center;
      outline: 0;
      padding: 0;
    }
    .ql-align {
      .ql-picker-item {
        align-items: center;
        display: flex;
        height: 52px;
        justify-content: center;
        width: 52px;
      }
      .ql-picker-options[aria-hidden="false"] {
        align-items: center;
        display: flex;
        justify-content: center;
      }
    }
    .ql-picker-options {
      &:focus,
      &:active {
        border: 0;
        outline: 0;
      }
      &::-webkit-scrollbar {
        width: 8px;
      }
      &::-webkit-scrollbar-track {
        background: $tertiary;
        border-radius: 0 20px 20px 0;
        margin: 16px 0;
      }
      &::-webkit-scrollbar-thumb {
        background: $primary;
        border-radius: 99px;
      }
      background-color: $secondary;
      border-radius: 20px;
      border: 0;
      box-shadow: 3px 3px 12px rgba(68, 153, 102, 0.49);
      max-height: 300px;
      overflow: auto;
      padding: 0;
      right: 0;
    }
    .ql-color,
    .ql-background {
      .ql-picker-label {
        border: 0;
      }
      .ql-picker-item {
        &::after {
          content: normal;
        }
        border-radius: 99px;
        border: 0;
        height: 44px;
        margin: 6px;
        padding: 0;
        width: 44px;
      }
      .ql-picker-options {
        left: 50%;
        padding: 12px;
        transform: translateX(-50%);
        width: 192px;
      }
      position: relative;
    }
    button,
    > span {
      &:hover {
        background: #f0e0b9;
      }
      &.active {
        span {
          color: $secondary;
        }
        background-color: $primary;
      }
      span {
        font-size: 32px;
      }
      align-items: center;
      border-radius: 999px;
      display: flex;
      height: 52px;
      justify-content: center;
      padding: 0;
      transition: $t-base;
      width: 52px;
    }
    .ql-size,
    .ql-font {
      width: 50%;
    }
    &::after {
      content: normal;
    }
    &:first-child {
      justify-content: space-between;
      padding-bottom: 4px;
      padding-top: 0;
    }
    align-items: center;
    display: flex;
    height: auto;
    margin: 0;
    padding-top: 0px;
    width: 100%;
  }
  align-items: center;
  background-color: $secondary;
  border-radius: 20px;
  display: flex;
  flex-wrap: wrap;
  height: auto;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0;
  position: relative;
}
#editorHeader {
  input {
    &::placeholder {
      color: $secondary;
      opacity: 0.7;
    }
    background: transparent;
    border-radius: 20px;
    border: 2px solid $secondary;
    color: $secondary;
    font-size: 20px;
    font-weight: bold;
    height: 48px;
    line-height: 44px;
    padding: 0 16px;
    width: 100%;
  }
  border-radius: 20px;
  margin-bottom: 16px;
  padding: 0;
  width: 100%;
}
.editor-wrap {
  .title {
    color: $primary;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 8px;
    text-align: left;
  }
  .editor {
    display: flex;
  }
  .ql-toolbar.ql-snow {
    align-items: center;
    display: flex;
    border: 0;
    height: 68px;
  }
  .ql-editor {
    padding: 0;
    width: 100%;
  }
  .ql-editor.ql-blank::before {
    left: 20px;
  }
  #editorContent {
    border-radius: 20px;
    border: 2px solid $primary;
    flex-grow: 1;
    margin: 0;
    padding: 16px 20px;
  }
  background-color: $secondary;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 8px 16px 16px 16px;
  width: 100%;
}
.ql-font-arial {
  font-family: Arial;
}
.ql-font-noto-serif-tc {
  font-family: "Noto Serif TC";
}
.ql-font-noto-sans-tc {
  font-family: "Noto Sans TC";
}
.ql-font-jhengHei {
  font-family: "Microsoft JhengHei";
}
</style>
