import { Note } from '@/types';
import { createStore } from 'vuex';

export default createStore({
  state: {
    isMenuOpen: false,
    height: null,
    noteData: [] as Array<Note>,
  },
  mutations: {
    menuToggler(state, data) {
      state.isMenuOpen = data;
    },
    getHeight(state, data) {
      state.height = data;
    },
    updateNote(state, data) {
      const idList = state.noteData.map((el) => el.id);
      if (idList.indexOf(data.id) === -1) {
        state.noteData.push(data);
      }
    },
  },
  actions: {
  },
  modules: {
  },
});
