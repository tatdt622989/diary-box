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
    modelsData: [{
      name: 'can',
      id: '1',
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      style: {
        color: {},
      },
    }] as Array<Model>,
    currency: 9999,
    modelsFormat: null,
    firebase: null,
    userInfo: null as null | firebase.User,
    formHint: '' as string,
    modal: null as null | Modal,
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
        state.modelsData.push(data.model);
      }
    },
    getUserInfo(state, data) {
      const user = firebase.auth().currentUser;
      state.userInfo = data;
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
    login({ commit, state }, data) {
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
              firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                  state.userInfo = user;
                  db.ref(`/users/${user.uid}`).once('value', (snapshot) => {
                    const userData = snapshot.val();
                    console.log(userData);
                    if (!userData) {
                      db.ref(`/users/${user.uid}/mail`).set(user.email);
                      db.ref(`/users/${user.uid}/name`).set(user.displayName);
                      db.ref(`/users/${user.uid}/balance`).set(0);
                    }
                  });
                } else {
                  state.userInfo = null;
                }
                if (state.modal) {
                  state.modal.hide();
                }
              });
            })
            .catch((error) => {
              // Handle Errors here.
              const errorCode = error.code;
              const errorMessage = error.message;
              // The email of the user's account used.
              const { email } = error;
              // The firebase.auth.AuthCredential type that was used.
              const { credential } = error;
              // ...
            });
          break;
        case 'email':
          firebase.auth().signInWithEmailAndPassword(data.email, data.password)
            .then((userCredential) => {
              // Signed in
              firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                  state.userInfo = user;
                  db.ref(`/users/${user.uid}`).once('value', (snapshot) => {
                    const userData = snapshot.val();
                    console.log(userData);
                    if (!userData) {
                      db.ref(`/users/${user.uid}/mail`).set(user.email);
                      db.ref(`/users/${user.uid}/name`).set(user.displayName);
                      db.ref(`/users/${user.uid}/balance`).set(0);
                    }
                  });
                } else {
                  state.userInfo = null;
                }
                if (state.modal) {
                  state.modal.hide();
                }
              });
              if (state.modal) {
                state.modal.hide();
              }
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
    getModelsFormat({ commit, state }) {
      db.ref('/products').once('value', (snapshot) => {
        console.log(snapshot.val());
        state.modelsFormat = snapshot.val();
      });
    },
    register({ commit, dispatch, state }, data) {
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
            firebase.auth().onAuthStateChanged((user) => {
              if (user) {
                state.userInfo = user;
                console.log('使用者資訊更新', user);
                db.ref(`/users/${user.uid}/mail`).set(user.email);
                db.ref(`/users/${user.uid}/name`).set(user.displayName);
                db.ref(`/users/${user.uid}/balance`).set(0);
                if (state.modal) {
                  state.modal.hide();
                }
              } else {
                state.userInfo = null;
              }
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
    buyModel({ commit, state }, data) {
      db.ref(`/users/${state.userInfo?.uid}/toBuy`).set(data);
    },
    signOut({ dispatch, state }) {
      firebase.auth().signOut().then(() => {
        dispatch('updateToast', {
          type: 'success',
          content: '登出成功',
        });
        state.userInfo = null;
      }).catch((err) => {
        dispatch('updateToast', {
          type: 'error',
          content: err,
        });
      });
    },
  },
  modules: {
  },
});
