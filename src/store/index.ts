import { createStore } from 'vuex';

export default createStore({
  state: {
    isMenuOpen: false,
    height: null,
  },
  mutations: {
    menuToggler(state, data) {
      state.isMenuOpen = data;
    },
    getHeight(state, data) {
      console.log(data);
      state.height = data;
    },
  },
  actions: {
  },
  modules: {
  },
});
