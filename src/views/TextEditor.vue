<template>
  <div class="text-editor-wrap" :style="{ height }" @click="activeTool = ''">
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click="$router.push('/')">
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
          <ul class="function-menu font-family" v-if="activeTool === 'font-family'">
            <li>
              <button>Noto Sans TC</button>
            </li>
            <li>
              <button>Noto Serif TC</button>
            </li>
            <li>
              <button>微軟正黑體</button>
            </li>
            <li>
              <button>Arial</button>
            </li>
          </ul>
        </li>
        <li>
          <button class="btn-circle">
            <span class="material-icons">format_size</span>
          </button>
          <div class="function-menu font-size">
            <label for="fontSizeRange"></label>
            <input type="range" name="" id="fontSizeRange">
          </div>
        </li>
        <li>
          <button class="btn-circle">
            <span class="material-icons">format_color_text</span>
          </button>
        </li>
        <li>
          <button class="btn-circle">
            <span class="material-icons">format_color_fill</span>
          </button>
        </li>
        <li>
          <button class="btn-circle">
            <span class="material-icons">format_align_left</span>
          </button>
        </li>
        <li>
          <button class="btn-circle">
            <span class="material-icons">format_bold</span>
          </button>
        </li>
      </ul>
      <div class="editor">
        <input type="text" name="" id="" placeholder="請輸入標題" />
        <textarea
          name=""
          id=""
          cols="30"
          rows="10"
          placeholder="請輸入內容"
        ></textarea>
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

    return {
      height: computed(() => store.state.height),
      activeTool,
    };
  },
});
</script>

<style lang="scss">
.text-editor-wrap {
  .function-menu {
    &.font-family {
      li {
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
      top: 59px;
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
    top: 0;
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
  button {
    &.active {
      span {
        color: $secondary;
      }
      background-color: $primary;
    }
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
  textarea {
    background: transparent;
    flex-grow: 1;
    height: 0;
    padding: 16px 0;
    resize: none;
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
