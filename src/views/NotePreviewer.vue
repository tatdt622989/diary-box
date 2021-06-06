<template>
  <div class="main-wrap note-preview-wrap" :style="{ height }">
    <button class="btn btn-circle close-btn" @click="$router.push('/note-list')">
      <span class="material-icons">arrow_back</span>
    </button>
    <div class="content" v-html="note[0].content"></div>
  </div>
</template>

<script>
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'NotePreview',
  setup() {
    const store = useStore();
    const route = useRoute();
    const height = computed(() => store.state.height);
    const noteData = computed(() => store.state.userData.noteData);
    const { id } = route.params;
    const note = ref(noteData.value.filter((obj) => obj.id === id));

    return {
      note,
      height,
    };
  },
});
</script>

<style lang="scss" scoped>
.note-preview-wrap {
  .content {
    border-radius: 20px;
    background: $secondary;
    padding: 16px;
    text-align: left;
  }
  display: flex;
  flex-grow: 1;
  padding: 0 16px;
  padding-bottom: 16px;
  padding-top: 92px;
}
.close-btn {
  left: 16px;
  position: absolute;
  top: 16px;
}
</style>
