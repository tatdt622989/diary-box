import {
  Model,
  Note,
  Products,
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
import { TierResult } from 'detect-gpu';

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
    toastMsgList: [] as Array<ToastMSG>,
    previewModel: '',
    defaultModelData: {
      name: 'can',
      id: '1',
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      color: {},
      passive: false,
    } as Model,
    modelFormat: null as null | Products,
    firebase: null,
    userInfo: null as null | firebase.User,
    formHint: '' as string,
    modal: null as null | Modal,
    userData: {
      modelData: [],
      noteData: [] as Array<Note>,
      name: '',
      pointInfo: {
        balance: 0,
        lastGet: '',
        pointCounter: 0,
      },
      email: '',
    } as UserData,
    dataLoaded: false,
    getPoint: null,
    loadingStr: '',
    quality: null,
    gpuTier: null as null | TierResult,
    isDebug: false,
    modalLoaded: false,
  },
  mutations: {
    menuToggler(state, data) {
      state.isMenuOpen = data;
    },
    getHeight(state) {
      state.height = `${window.innerHeight}px`;
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
    closeModal(state) {
      if (state.modal) {
        state.modal.hide();
      }
    },
    resetUserData(state) {
      state.userData = {
        modelData: [],
        noteData: [],
        name: '',
        pointInfo: {
          balance: 0,
          lastGet: '',
          pointCounter: 0,
        },
        email: '',
      };
    },
    updateLoadingStr(state, data) {
      state.loadingStr = data;
    },
    updateFormHint(state, data) {
      state.formHint = data;
    },
    updateDataLoadStatus(state, data) {
      state.dataLoaded = data;
    },
    updateNoteData(state, data) {
      state.userData.noteData = data;
    },
    updateModelData(state, data) {
      state.userData.modelData = data;
    },
    updateBalance(state, data) {
      state.userData.pointInfo.balance = data;
    },
    updateGetPoint(state, data) {
      state.getPoint = data;
    },
    updateUserData(state, data) {
      state.userData.modelData = data.modelData;
      state.userData.name = data.name;
      state.userData.pointInfo = data.pointInfo;
      state.userData.email = data.email;
      state.userData.noteData = data.noteData ? data.noteData : [];
    },
    updateQuality(state, data) {
      state.quality = data;
      if (state.modal) {
        state.modal.hide();
      }
    },
    updateGpuTier(state, data) {
      state.gpuTier = data;
    },
    updateModalLoaded(state, data) {
      state.modalLoaded = data;
    },
  },
  actions: {
    login({ dispatch, commit, state }, data) {
      commit('updateLoadingStr', '登入中');
      commit('updateModalLoaded', false);
      dispatch('openModal', {
        type: 'loading',
        asynchronous: true,
      });
      const provider = new firebase.auth.GoogleAuthProvider();
      switch (data.type) {
        case 'google':
          firebase.auth().signInWithPopup(provider)
            .then((result) => {
              dispatch('updateUserInfo');
            })
            .catch((error) => {
              // Handle Errors here.
              const errorMessage = error.message;
              dispatch('updateToast', {
                type: 'error',
                content: errorMessage,
              });
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
        case 'anonymous':
          firebase.auth().signInAnonymously()
            .then(() => {
              // Signed in..
              dispatch('updateUserInfo');
            })
            .catch((error) => {
              const errorMessage = error.message;
              dispatch('updateToast', {
                type: 'error',
                content: errorMessage,
              });
            });
          break;
        default:
          break;
      }
    },
    async register({ dispatch, state }, data) {
      firebase.auth().createUserWithEmailAndPassword(data.email, data.password).then((result) => {
        state.formHint = '';
        if (result.user) {
          result.user.updateProfile({
            displayName: data.userName,
          }).then(() => {
            dispatch('updateUserInfo');
          }).catch((err) => {
            dispatch('updateToast', {
              type: 'error',
              content: err,
            });
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
      commit('updateLoadingStr', '購買中');
      commit('updateModalLoaded', false);
      dispatch('openModal', {
        type: 'loading',
        asynchronous: true,
      });
      const buyModel = firebase.functions().httpsCallable('buyModel');
      const result = await buyModel({ buyingModel: data })
        .then((res) => res)
        .catch((err) => {
          dispatch('updateToast', {
            type: 'error',
            content: err,
          });
          return null;
        });
      if (result) {
        if (result.data.status === 'ok') {
          if (result.data.msg === '購買成功') {
            await dispatch('getModelData');
            await dispatch('getBalance');
          }
          dispatch('updateToast', {
            type: 'success',
            content: result.data.msg,
          });
        } else {
          dispatch('updateToast', {
            type: 'error',
            content: result.data.msg,
          });
        }
      }
    },
    signOut({ dispatch, commit, state }) {
      firebase.auth().signOut().then(() => {
        dispatch('updateToast', {
          type: 'success',
          content: '登出成功',
        });
        commit('resetUserData');
        state.userInfo = null;
        commit('menuToggler', false);
      }).catch((err) => {
        dispatch('updateToast', {
          type: 'error',
          content: err,
        });
      });
    },
    getModelFormat({ state }) {
      db.ref('/products').once('value', (snapshot) => {
        state.modelFormat = snapshot.val();
      });
    },
    getPoint({ dispatch, commit, state }) {
      const getPoint = firebase.functions().httpsCallable('getPoint');
      getPoint().then((res) => {
        if (state.modal) {
          state.modal.hide();
        }
        if (res.data && res.data.status === 'ok') {
          if (res.data.point > 0) {
            commit('updateModalLoaded', false);
            dispatch('openModal', {
              type: 'pointNotification',
              asynchronous: false,
            });
            commit('updateGetPoint', res.data.point);
            dispatch('getBalance');
          } else {
            dispatch('updateToast', {
              type: 'error',
              content: res.data.msg,
            });
          }
        }
      }).catch((err) => {
        dispatch('updateToast', {
          type: 'error',
          content: err,
        });
      });
    },
    async getUserData({ dispatch, commit, state }) {
      if (state.userInfo) {
        let userData = await db.ref(`/users/${state.userInfo.uid}`).once('value').then((snapshot) => snapshot.val());
        if (!userData) {
          let displayName;
          if (state.userInfo?.isAnonymous) {
            displayName = '訪客';
          } else {
            displayName = state.userInfo?.displayName;
          }
          const newUserFormat = firebase.functions().httpsCallable('newUserFormat');
          await newUserFormat({ displayName }).then((res) => {
            if (res.data.userData) {
              userData = res.data.userData;
            }
          });
        }
        commit('updateUserData', userData);
        commit('menuToggler', false);
        let times = 0;
        const closeModal = setInterval(() => {
          if (times > 50 || state.modalLoaded) {
            commit('closeModal');
            clearInterval(closeModal);
            let guideState;
            try {
              guideState = Number(localStorage.getItem('guideState'));
            } catch (e) {
              localStorage.removeItem('guideState');
            }
            if (!guideState) {
              dispatch('openModal', {
                type: 'guide',
                asynchronous: false,
              });
            }
          }
          times += 1;
        }, 100);
      }
      return false;
    },
    async getBalance({ commit, state }) {
      if (state.userInfo) {
        const balance = await db.ref(`/users/${state.userInfo.uid}/pointInfo/balance`).once('value').then((snap) => snap.val());
        commit('updateBalance', balance);
      }
    },
    async getNoteData({ commit, state }) {
      if (state.userInfo) {
        const noteData = await db.ref(`/users/${state.userInfo.uid}/noteData`).once('value').then((snap) => snap.val());
        commit('updateNoteData', noteData);
      }
    },
    async getModelData({ commit, state }) {
      if (state.userInfo) {
        const modelData = await db.ref(`/users/${state.userInfo.uid}/modelData`).once('value').then((snap) => snap.val());
        commit('updateModelData', modelData);
      }
    },
    updateToast({ commit }, data) {
      commit('addToast', data);
      setTimeout(() => {
        commit('removeToast');
      }, 3000);
    },
    async updateUserInfo({ dispatch, state, commit }) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          state.userInfo = user;
          dispatch('getUserData').then(() => {
            state.dataLoaded = true;
          });
        } else {
          commit('resetUserData');
          state.userInfo = null;
        }
      });
    },
    async updateModelData({ dispatch, commit, state }, data) {
      const editModel = firebase.functions().httpsCallable('editModel');
      let isSuccess = false;
      await editModel(data).then((res) => {
        if (res.data.status === 'ok' && res.data.modelData) {
          commit('updateModelData', res.data.modelData);
          isSuccess = true;
        }
      });
      return isSuccess;
    },
    async updateNoteData({ dispatch, commit, state }, data) {
      let { noteData } = state.userData;
      if (state.userInfo) {
        switch (data.type) {
          case 'add':
            commit('updateModalLoaded', false);
            commit('updateLoadingStr', '資料上傳中');
            dispatch('openModal', {
              type: 'loading',
              asynchronous: true,
            });
            noteData.push(data.data);
            break;
          case 'edit':
            noteData.forEach((el: Note, i: number) => {
              if (el.id === data.data.id) {
                noteData[i] = data.data;
              }
            });
            break;
          case 'delete':
            noteData = noteData.filter((el: Note) => el.id !== data.id);
            break;
          default:
            break;
        }
        await db.ref(`/users/${state.userInfo.uid}/noteData`).set(noteData);
        await dispatch('getNoteData');
        if (data.type === 'edit') {
          dispatch('updateToast', {
            type: 'success',
            content: '編輯成功',
          });
        } else if (data.type === 'delete') {
          dispatch('updateToast', {
            type: 'success',
            content: '刪除成功',
          });
        }
      }
    },
    openModal({ dispatch, commit, state }, data) {
      state.formHint = '';
      const el = document.getElementById(`${data.type}Modal`);
      let backdrop: boolean | 'static' | undefined = true;
      if (data.type === 'loading') {
        backdrop = 'static';
      }
      if (el) {
        if (data.asynchronous) {
          el.addEventListener('shown.bs.modal', () => {
            state.modalLoaded = true;
          });
        }
        state.modal = new Modal(el, {
          backdrop,
        });
        state.modal.show();
      }
    },
  },
  modules: {
  },
});
