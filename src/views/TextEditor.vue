<template>
  <div class="text-editor-wrap" :style="{ height }" @click="activeTool = ''">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/node-list')">
        <span class="material-icons">arrow_back</span>
      </button>
      <p>筆記編輯模式</p>
      <button class="btn-circle" @click="openFilter">
        <span class="material-icons">check</span>
      </button>
    </div>
    <div class="content">
      <ul class="toolbar">
        <li @click.stop>
          <button
            class="btn-circle"
            @click="activeTool = 'font-family'"
            :class="{ active: activeTool === 'font-family' }"
          >
            <span class="material-icons">title</span>
          </button>
          <ul
            class="function-menu font-family"
            v-if="activeTool === 'font-family'"
          >
            <li>
              <button @click="updateTextStyle('font-family', 'Noto Sans TC')">
                Noto Sans TC
              </button>
            </li>
            <li>
              <button @click="updateTextStyle('font-family', 'Noto Serif TC')">
                Noto Serif TC
              </button>
            </li>
            <li>
              <button
                @click="updateTextStyle('font-family', 'Microsoft JhengHei')"
              >
                微軟正黑體
              </button>
            </li>
            <li>
              <button @click="updateTextStyle('font-family', 'Arial')">
                Arial
              </button>
            </li>
          </ul>
        </li>
        <li @click.stop>
          <button
            class="btn-circle"
            @click="activeTool = 'font-size'"
            :class="{ active: activeTool === 'font-size' }"
          >
            <span class="material-icons">format_size</span>
          </button>
          <div
            class="function-menu font-size"
            v-if="activeTool === 'font-size'"
          >
            <span>20px</span>
            <input
              type="range"
              name=""
              id="fontSizeRange"
              max="40"
              @change="updateTextStyle('font-size')"
              v-model="fontSize"
            />
          </div>
        </li>
        <li @click.stop>
          <button
            class="btn-circle"
            @click="activeTool = 'color'"
            :class="{ active: activeTool === 'color' }"
          >
            <label for="textColor">
              <span class="material-icons">format_color_text</span>
            </label>
          </button>
          <input
            type="color"
            name=""
            id="textColor"
            v-model="textColor"
            @change="updateTextStyle('color')"
          />
        </li>
        <li @click.stop>
          <button
            class="btn-circle"
            @click="activeTool = 'bg-color'"
            :class="{ active: activeTool === 'bg-color' }"
          >
            <label for="bgColor">
              <span class="material-icons">format_color_fill</span>
            </label>
          </button>
          <input
            type="color"
            name=""
            id="bgColor"
            v-model="bgColor"
            @input="updateTextStyle('bg-color')"
          />
        </li>
        <li @click.stop>
          <button
            class="btn-circle"
            @click="activeTool = 'text-align'"
            :class="{ active: activeTool === 'text-align' }"
          >
            <span class="material-icons">format_align_left</span>
          </button>
          <div
            class="function-menu text-align"
            v-if="activeTool === 'text-align'"
          >
            <button class="btn-circle" @click="updateTextStyle('align', 'left')">
              <span class="material-icons">format_align_left</span>
            </button>
            <button class="btn-circle" @click="updateTextStyle('align', 'center')">
              <span class="material-icons">format_align_center</span>
            </button>
            <button class="btn-circle" @click="updateTextStyle('align', 'right')">
              <span class="material-icons">format_align_right</span>
            </button>
            <button class="btn-circle" @click="updateTextStyle('align', 'justify')">
              <span class="material-icons">format_align_justify</span>
            </button>
          </div>
        </li>
        <li>
          <button class="btn-circle" @click="updateTextStyle('bold')">
            <span class="material-icons">format_bold</span>
          </button>
        </li>
      </ul>
      <div class="editor" ref="editor">
        <input type="text" name="" id="" placeholder="請輸入標題" />
        <p
          id="editorContent"
          contenteditable="true"
          @mouseup="getSelectedText"
          @touchend="getSelectedText"
          spellcheck="false"
          ref="editorContent"
        >
          <span></span>
        </p>
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
import Navbar from '@/components/Navbar.vue';

export default defineComponent({
  name: 'TextEditor',
  components: {
    Navbar,
  },
  setup() {
    const store = useStore();
    const activeTool = ref<string>('');
    const textColor = ref<string>('#449966');
    const bgColor = ref<string>('#F8EBCF');
    const fontSize = ref<number>(32);

    let range: Range|null = null;
    let str: string|null = null;
    const editorContent = ref<HTMLElement | null>(null);
    const editor = ref<HTMLElement | null>(null);

    function getSelectedText() {
      const selObj: Selection | null = window.getSelection();
      if (selObj?.isCollapsed) { return; }
      if (selObj && selObj.toString() && editorContent.value) {
        range = selObj.getRangeAt(0);
        str = range.toString();
        const startNode: Node = range.startContainer;
        const startNodeIndex = selObj.anchorOffset;
        const endNode: Node = range.endContainer;
        const endNodeIndex = selObj.focusOffset;
        const nodeList = Array.from(editorContent.value.childNodes);
        const startText: string | null = startNode.textContent;
        const endText: string | null = endNode.textContent;
        const afterStartNode = document.createElement('span');
        const beforeEndNode = document.createElement('span');
        console.log(startNode, endNode);
      }
    }

    function updateTextStyle(type: string, data: string) {
      console.log(editorContent.value, range, str, type);
      const wrap: HTMLElement = document.createElement('span');
      if (type === 'bg-color' && editor.value) {
        editor.value.style.backgroundColor = bgColor.value;
        return;
      }
      if (editorContent.value && range && str) {
        console.log('update');
        switch (type) {
          case 'bold':
            wrap.style.fontWeight = 'bold';
            break;
          case 'font-size':
            wrap.style.fontSize = `${fontSize.value}px`;
            break;
          case 'font-family':
            wrap.style.fontFamily = data;
            break;
          case 'color':
            wrap.style.color = textColor.value;
            break;
          case 'bg-color':
            break;
          default:
            break;
        }
        console.log(editorContent.value);
        wrap.appendChild(range.extractContents());
        const wrapNodes = Array.from(wrap.childNodes as NodeListOf<HTMLElement>);
        console.log(wrapNodes);
        wrapNodes.forEach((node, i) => {
          const text = wrapNodes[i].textContent;
          let style = wrapNodes[i].style ? wrapNodes[i].style.cssText : null;
          if (node.nodeName === 'SPAN') {
            console.log(node.textContent, wrap.textContent, style, wrap.style.cssText);
            if (node.textContent === wrap.textContent && style) {
              wrapNodes[i].remove();
              console.log(style.search(type) > -1);
              if (style.search(type) > -1) {
                style = style.replace(type, '');
              }
              wrap.style.cssText += style;
              wrap.textContent = text;
            } else if (style && style.indexOf(type) > -1) {
              wrapNodes[i].style[type as any] = '';
            }
          }
        });
        range.insertNode(wrap);
        console.log(range.startContainer, range.endContainer);
      }
    }

    return {
      height: computed(() => store.state.height),
      activeTool,
      textColor,
      bgColor,
      getSelectedText,
      updateTextStyle,
      editorContent,
      editor,
      fontSize,
    };
  },
});
</script>

<style lang="scss">
.text-editor-wrap {
  .function-menu {
    &.font-family {
      li {
        button {
          white-space: nowrap;
        }
        &:nth-of-type(1) {
          font-family: "Noto Sans TC";
        }
        &:nth-of-type(2) {
          font-family: "Noto Serif TC";
        }
        &:nth-of-type(3) {
          font-family: Microsoft JhengHei;
        }
        &:nth-of-type(4) {
          font-family: Arial;
        }
      }
      min-width: 140px;
    }
    &.font-size {
      input {
        &::-webkit-slider-thumb {
          appearance: none;
          background-color: $primary;
          border-radius: 999px;
          border: 0;
          box-shadow: 0px 0px 8px rgba(68, 153, 102, 0.5);
          cursor: pointer;
          height: 44px;
          width: 44px;
        }
        appearance: none;
        background-color: #9f9684;
        border-radius: 999px;
        height: 12px;
        margin-bottom: 14px;
        width: 178px;
      }
      span {
        color: $primary;
        font-weight: bold;
        font-size: 20px;
        margin-bottom: 24px;
      }
      align-items: center;
      display: flex;
      height: 120px;
      justify-content: center;
      width: 194px;
    }
    &.text-align {
      button {
        &::after {
          content: normal;
        }
        margin: 0 8px;
        width: 52px;
      }
      align-items: center;
      flex-direction: row;
      height: 66px;
      left: auto;
      right: 0;
    }
    button {
      padding: 0 12px;
    }
    background-color: $secondary;
    border-radius: 20px;
    box-shadow: 3px 3px 12px rgba(68, 153, 102, 0.49);
    left: 0;
    padding: 0;
    position: absolute;
    top: 59px;
  }
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
}
.toolbar {
  li {
    position: relative;
  }
  input[type="color"] {
    height: 0;
    width: 0;
    position: absolute;
    opacity: 0;
  }
  button {
    &.active {
      span {
        color: $secondary;
      }
      background-color: $primary;
    }
    label {
      cursor: pointer;
      width: 100%;
    }
    padding: 0;
  }
  align-items: center;
  background-color: $secondary;
  border-radius: 20px;
  display: flex;
  height: 66px;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 12px;
  position: relative;
}
.editor {
  input,
  textarea {
    &::placeholder {
      color: #9b9b9b;
    }
    appearance: none;
    border-radius: 20px;
    border: 2px solid $primary;
    font-size: 38px;
    font-weight: bold;
    padding: 0;
    text-indent: 20px;
  }
  input {
    background: transparent;
    height: 68px;
    margin-bottom: 20px;
  }
  #editorContent {
    .selection {
      background-color: $primary;
      color: $secondary;
    }
    &::selection,
    p::selection,
    span::selection {
      background-color: $primary;
      color: $secondary;
    }
    &:focus {
      outline: 0;
    }
    border-radius: 20px;
    border: 2px solid $primary;
    color: $primary;
    flex-grow: 1;
    font-size: 38px;
    margin: 0;
    padding: 16px 20px;
    text-align: left;
  }
  background-color: $secondary;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 20px;
  width: 100%;
}
</style>
