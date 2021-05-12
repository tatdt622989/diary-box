import { Model, Note, ToastMSG } from '@/types';
import { createStore } from 'vuex';
import { Modal } from 'bootstrap';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCvCRbDN7cTeJEsUsaLniB_p2LMxpf5sVc',
  authDomain: 'diary-box.firebaseapp.com',
  projectId: 'diary-box',
  storageBucket: 'diary-box.appspot.com',
  messagingSenderId: '857252808766',
  appId: '1:857252808766:web:f1f3fdcc47bad53545e96f',
  measurementId: 'G-LYH2T7DNKF',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.database();

export default createStore({
  state: {
    isMenuOpen: false as boolean,
    height: '' as string,
    noteData: [] as Array<Note>,
    toastMsgList: [] as Array<ToastMSG>,
    previewModel: '',
    modelData: [{
      name: 'can',
      id: '1',
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    {
      name: 'umbrella',
      id: '2',
      position: {
        x: 0,
        y: 0,
        z: 7,
      },
    }] as Array<Model>,
    currency: 9999,
    modelFormat: null,
    firebase: null,
    userInfo: null as null | firebase.User,
    isLogin: null as null|firebase.User,
  },
  mutations: {
    menuToggler(state, data) {
      state.isMenuOpen = data;
    },
    getHeight(state) {
      state.height = `${window.innerHeight}px`;
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
        localStorage.setItem('note-data', JSON.stringify(state.noteData));
      }
    },
    addToast(state, data) {
      state.toastMsgList.push(data);
    },
    removeToast(state, index) {
      if (typeof index === 'number') {
        state.toastMsgList.splice(index, 1);
      } else {
        state.toastMsgList.splice(0, 1);
      }
    },
    updateModel(state, data) {
      if (data.type === 'add') {
        state.modelData.push(data.model);
      }
    },
    getUserInfo(state, data) {
      state.userInfo = data;
    },
    getLoginInfo(state, data) {
      const user = firebase.auth().currentUser;
      state.isLogin = user;
    },
    openModal(state, data) {
      let el;
      switch (data) {
        case 'register':
          el = document.getElementById('registerModal');
          break;
        case 'login':
          el = document.getElementById('loginModal');
          break;
        default:
          break;
      }
      if (el) {
        const modal = new Modal(el);
        modal.show();
      }
    },
  },
  actions: {
    updateToast({ commit }, data) {
      commit('addToast', data);
      setTimeout(() => {
        commit('removeToast');
      }, 3000);
    },
    login({ commit }) {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
          /** @type {firebase.auth.OAuthCredential} */
          const { credential } = result;

          // This gives you a Google Access Token. You can use it to access the Google API.
          const token = (result as any).credential.accessToken;
          // The signed-in user info.
          const { user } = result;
          console.log(token, user, credential);
          if (user) {
            commit('getUserInfo', user);
            db.ref(`/users/${user.uid}`).once('value', (snapshot) => {
              const data = snapshot.val();
              console.log(data);
              if (!data) {
                db.ref(`/users/${user.uid}/mail`).set(user.email);
                db.ref(`/users/${user.uid}/name`).set(user.displayName);
              }
            });
          }
          // ...
        }).catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const { email } = error;
          // The firebase.auth.AuthCredential type that was used.
          const { credential } = error;
          // ...
        });
    },
    getModelFormat({ commit, state }) {
      db.ref('/products').once('value', (snapshot) => {
        console.log(snapshot.val());
        state.modelFormat = snapshot.val();
      });
    },
    register({ commit, dispatch }, data) {
      firebase.auth().createUserWithEmailAndPassword(data.email, data.password).then((result) => {
        console.log(result);
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        if (errorMessage.search('email') > 0) {
          dispatch('updateToast', {
            type: 'hint',
            content: 'email格式錯誤',
          });
        }
        if (errorMessage.search('should be at least 6 characters') > 0) {
          dispatch('updateToast', {
            type: 'hint',
            content: '密碼需至少六個字',
          });
        }
        // ...
      });
    },
    buyModel({ commit, state }, data) {
      db.ref(`/users/${state.userInfo?.uid}/toBuy`).set(data);
    },
    setData({ commit }, data) {
      db.ref('/test').set(data);
      console.log(1);
    },
    getData({ commit }, data) {
      db.ref('/test').once('value', (snapshot) => {
        console.log(snapshot.val());
      });
      console.log(3);
    },
  },
  modules: {
  },
});
