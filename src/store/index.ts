import { createStore } from 'vuex';

export default createStore({
  state: {
    isMenuOpen: false,
  },
  mutations: {
    menuToggler(state, data) {
      state.isMenuOpen = data;
    },
  },
  actions: {
  },
  modules: {
  },
});
