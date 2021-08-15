<template>
  <div
    class="modal fade"
    id="titleEditorModal"
    tabindex="-1"
    aria-labelledby="titleEditorModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="titleEditorModalLabel">標題編輯</h5>
          <button
            type="button"
            class="btn btn-circle"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <input type="text" v-model="inputTitle" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            取消
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="$emit('title-edit', inputTitle)"
            data-bs-dismiss="modal"
          >
            套用
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  onMounted,
  watch,
  toRefs,
} from 'vue';

export default defineComponent({
  name: 'TitleEditor',
  props: {
    title: String,
  },
  setup(props) {
    const inputTitle = ref<string>();

    return {
      inputTitle,
    };
  },
});
</script>

<style lang="scss" scoped>
.modal-body {
  input {
    height: 52px;
    border: 2px solid $primary;
    background: none;
    border-radius: 999px;
    color: $primary;
    width: 100%;
    font-size: 24px;
    font-weight: bold;
    text-indent: 16px;
  }
}
</style>
