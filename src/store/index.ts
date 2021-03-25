import { Note, ToastMSG } from '@/types';
import { createStore } from 'vuex';

export default createStore({
  state: {
    isMenuOpen: false,
    height: null,
    noteData: [] as Array<Note>,
    toastMsgList: [] as Array<ToastMSG>,
  },
  mutations: {
    menuToggler(state, data) {
      state.isMenuOpen = data;
    },
    getHeight(state, data) {
      state.height = data;
    },
    getNoteData(state, data) {
      state.noteData = data;
    },
    updateNote(state, data) {
      const idList = state.noteData.map((el) => el.id);
      const idIndex: number = idList.indexOf(data.id);
      if (idIndex === -1) {
        state.noteData.push(data);
        localStorage.setItem('note-data', JSON.stringify(state.noteData));
      } else {
        state.noteData[idIndex] = data;
      }
    },
    addToast(state, data) {
      state.toastMsgList.push(data);
    },
    removeToast(state) {
      state.toastMsgList.splice(0, 1);
    },
  },
  actions: {
    updateToast({ commit }, data) {
      commit('addToast', data);
      setTimeout(() => {
        commit('removeToast');
      }, 3000);
    },
  },
  modules: {
  },
});
