<template>
  <div class="main-wrap note-preview-wrap" :style="{ height }">
    <div class="header d-flex">
      <button class="btn btn-circle close-btn" @click="$router.go(-1)">
        <span class="material-icons">arrow_back</span>
      </button>
      <span class="title ellipsis">{{ title }}</span>
    </div>
    <div class="content" v-if="type === 'canvas'">
      <img :src="URL" class="img-cover">
    </div>
    <div class="content" v-html="note[0].content" v-if="type === 'text'"></div>
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
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'NotePreviewer',
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const height = computed(() => store.state.height);
    const noteData = computed(() => store.state.userData.noteData);
    const { id } = route.params;
    const note = ref(noteData.value.filter((obj) => obj.id === id));
    const title = ref();
    const { type } = route.params;

    onMounted(() => {
      if (!id) {
        router.go(-1);
      }
      if (type === 'text') {
        title.value = note.value[0].title;
      }
      if (type === 'canvas') {
        title.value = route.params.title;
      }
    });

    return {
      note,
      height,
      title,
      type,
      URL: route.params.URL,
    };
  },
});
</script>

<style lang="scss">
.note-preview-wrap {
  .header {
    span.title {
      color: $secondary;
      flex-grow: 1;
      font-size: 24px;
      font-weight: bold;
      padding-right: 52px;
      min-width: 0;
      padding-left: 10px;
    }
    display: flex;
    padding: 16px 0;
  }
  .content {
    >p {
      word-break: break-word;
      width: 100%;
      margin: 0;
    }
    border-radius: 20px;
    background: $secondary;
    padding: 16px;
    text-align: left;
    display: flex;
    flex-wrap: wrap;
  }
  display: flex;
  flex-grow: 1;
  padding: 0 16px;
  padding-bottom: 16px;
  display: flex;
  flex-direction: column;
}
</style>
