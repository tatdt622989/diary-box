import { createStore } from 'vuex';

export default createStore({
  state: {
    isMenuOpen: false,
    height: null,
    noteData: [],
  },
  mutations: {
    menuToggler(state, data) {
      state.isMenuOpen = data;
    },
    getHeight(state, data) {
      state.height = data;
    },
    updateNote(state, data) {
      state.noteData = data;
    },
  },
  actions: {
  },
  modules: {
  },
});
