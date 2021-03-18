<template>
  <div class="text-editor-wrap" :style="{ height }" @click="activeTool = ''">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/note-list')">
        <span class="material-icons">arrow_back</span>
      </button>
      <p>筆記編輯模式</p>
      <button class="btn-circle" @click="saveData">
        <span class="material-icons">check</span>
      </button>
    </div>
    <div class="content">
      <div id="editorHeader">
        <input type="text" placeholder="請輸入標題" v-model="title"/>
      </div>
      <div class="editor-wrap" ref="editor">
        <div class="toolbar" id="toolbar">
          <div class="ql-formats">
            <button class="ql-bold btn-circle"></button>
            <select class="ql-color">
              <option selected></option>
              <option value="red"></option>
              <option value="orange"></option>
              <option value="yellow"></option>
              <option value="#449966"></option>
              <option value="blue"></option>
              <option value="purple"></option>
            </select>
            <select class="ql-background">
              <option selected></option>
              <option value="red"></option>
              <option value="orange"></option>
              <option value="yellow"></option>
              <option value="#449966"></option>
              <option value="blue"></option>
              <option value="purple"></option>
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
              <option value="Microsoft JhengHei">微軟正黑體</option>
              <option value="Arial">Arial</option>
              <option value="Noto Serif TC">Noto Serif TC</option>
              <option value="Noto Sans TC">Noto Sans TC</option>
            </select>
            <select class="ql-size">
              <option :value="size" v-for="size in sizeList" :key="size">
                {{ size }}
              </option>
            </select>
          </div>
        </div>
        <div
          id="editorContent"
          class="editor"
          spellcheck="false"
        ></div>
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
  nextTick,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import Quill from 'quill';
import Navbar from '@/components/Navbar.vue';

export default defineComponent({
  name: 'TextEditor',
  components: {
    Navbar,
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
    const title = ref<string>('');
    let status: string | null = null;
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
      font.whitelist = ['Microsoft JhengHei', 'Arial', 'Noto Serif TC', 'Noto Sans TC'];
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
    };

    onMounted(() => {
      console.log(route.params);
      if (!route.params.status) {
        // router.push('/note-list');
      }
      status = route.params.status as string;
      noteId = route.params.id as string;
      editorInit();
    });

    function saveData() {
      if (!title.value) {
        store.dispatch('updateToast', {
          type: 'hint',
          content: '請輸入標題',
        });
        return;
      }
      if (quill.value && status) {
        const content = quill.value.getContents();
        const data = {
          id: noteId,
          content,
          title: title.value,
        };
        store.dispatch('updateToast', {
          type: 'success',
          content: '成功新增',
        });
        console.log(store.state.noteData);
      }
    }

    return {
      activeTool,
      bgColor,
      editor,
      editorInit,
      fontSize,
      height: computed(() => store.state.height),
      noteData: computed(() => store.state.noteData),
      saveData,
      sizeList,
      textColor,
      title,
    };
  },
});
</script>

<style lang="scss">
@import "~quill/dist/quill.bubble.css";
@import "~quill/dist/quill.snow.css";

.text-editor-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.header {
  p {
    color: $secondary;
    flex-shrink: 0;
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-top: 16px;
}
.ql-editor {
  font-size: 20px;
}
#toolbar.toolbar {
  input[type="color"] {
    height: 0;
    width: 0;
    position: absolute;
    opacity: 0;
  }
  .ql-formats {
    .ql-picker-item {
      color: $primary;
      font-size: 20px;
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
        &:active, &:focus {
          border: 0;
        }
        font-size: 20px;
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
      &:focus, &:active {
        border: 0;
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
        &:focus {
          outline: 0;
        }
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
      background-color: $secondary;
      border-radius: 20px;
      border: 0;
      box-shadow: 3px 3px 12px rgba(68, 153, 102, 0.49);
      padding: 0 12px;
      right: 0;
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
    padding: 0 20px;
    width: 100%;
  }
  border-radius: 20px;
  margin-bottom: 20px;
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
</style>
