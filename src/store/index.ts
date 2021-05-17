import {
  Model,
  Note,
  ToastMSG,
  UserData,
} from '@/types';
import { createStore, Store } from 'vuex';
import { Modal } from 'bootstrap';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import 'firebase/analytics';
import 'firebase/functions';

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
      style: {
        color: null,
      },
      passive: false,
    }] as Array<Model>,
    modelFormat: null,
    firebase: null,
    userInfo: null as null | firebase.User,
    formHint: '' as string,
    modal: null as null | Modal,
    userData: null as null | UserData,
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
    openModal(state, data) {
      let el;
      state.formHint = '';
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
        state.modal = new Modal(el);
        state.modal.show();
      }
    },
    updateFormHint(state, data) {
      state.formHint = data;
    },
  },
  actions: {
    updateToast({ commit }, data) {
      commit('addToast', data);
      setTimeout(() => {
        commit('removeToast');
      }, 3000);
    },
    updateUserInfo({ state, commit, dispatch }) {
      firebase.auth().onAuthStateChanged((user) => {
        console.log('登入狀態改變', user);
        if (user) {
          state.userInfo = user;
          dispatch('getUserData');
          dispatch('updateToast', {
            type: 'success',
            content: '登入成功',
          });
        } else {
          state.userInfo = null;
        }
        if (state.modal) {
          state.modal.hide();
        }
      });
    },
    login({ dispatch, commit, state }, data) {
      const provider = new firebase.auth.GoogleAuthProvider();
      switch (data.type) {
        case 'google':
          firebase.auth().signInWithPopup(provider)
            .then((result) => {
              /** @type {firebase.auth.OAuthCredential} */
              const { credential } = result;
              // This gives you a Google Access Token. You can use it to access the Google API.
              const token = (result as any).credential.accessToken;
              // The signed-in user info.
              // const { user } = result;
              // console.log(token, user, credential);
              dispatch('updateUserInfo');
            })
            .catch((error) => {
              // Handle Errors here.
              const errorCode = error.code;
              const errorMessage = error.message;
              // The email of the user's account used.
              const { email } = error;
              // The firebase.auth.AuthCredential type that was used.
              const { credential } = error;
            });
          break;
        case 'email':
          firebase.auth().signInWithEmailAndPassword(data.email, data.password)
            .then((userCredential) => {
              // Signed in
              dispatch('updateUserInfo');
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorCode, errorMessage);
              if (errorCode.search('invalid-email') > 0) {
                state.formHint = '電子郵件格式錯誤';
              }
              if (errorCode.search('user-not-found') > 0) {
                state.formHint = '找不到用戶';
              }
              if (errorCode.search('wrong-password') > 0) {
                state.formHint = '密碼錯誤';
              }
            });
          break;
        default:
          break;
      }
    },
    getModelFormat({ commit, state }) {
      db.ref('/products').once('value', (snapshot) => {
        console.log(snapshot.val());
        state.modelFormat = snapshot.val();
      });
    },
    async register({ commit, dispatch, state }, data) {
      firebase.auth().createUserWithEmailAndPassword(data.email, data.password).then((result) => {
        state.formHint = '';
        dispatch('updateToast', {
          type: 'success',
          content: '註冊成功',
        });
        console.log(result);
        if (result.user) {
          result.user.updateProfile({
            displayName: data.userName,
          }).then(() => {
            dispatch('updateUserInfo');
          });
        }
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        if (errorMessage.search('email-already-in-use') > 0) {
          state.formHint = '電子郵件已經被使用';
        }
        if (errorCode.search('invalid-email') > 0) {
          state.formHint = '電子郵件格式錯誤';
        }
        if (errorMessage.search('should be at least 6 characters') > 0) {
          state.formHint = '密碼需至少六個字';
        }
      });
    },
    async buyModel({ dispatch, commit, state }, data) {
      const buyModel = firebase.functions().httpsCallable('buyModel');
      buyModel({ buyingModel: data })
        .then((result) => {
          console.log(result);
          dispatch('getUserData');
          dispatch('updateToast', {
            type: 'success',
            content: result.data.msg,
          });
        });
    },
    signOut({ commit, dispatch, state }) {
      firebase.auth().signOut().then(() => {
        dispatch('updateToast', {
          type: 'success',
          content: '登出成功',
        });
        state.userInfo = null;
        state.userData = null;
        commit('menuToggler', false);
      }).catch((err) => {
        dispatch('updateToast', {
          type: 'error',
          content: err,
        });
      });
    },
    async getUserData({ dispatch, commit, state }) {
      if (state.userInfo) {
        await db.ref(`/users/${state.userInfo.uid}`).once('value', async (snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            state.userData = userData;
          } else {
            const newUserFormat = firebase.functions().httpsCallable('newUserFormat');
            await newUserFormat({ displayName: state.userInfo?.displayName }).then((res) => {
              console.log('資料取得完畢', res);
              if (res.data.userData) {
                state.userData = res.data.userData;
              }
            });
          }
        });
        commit('menuToggler', false);
      }
    },
  },
  modules: {
  },
});
