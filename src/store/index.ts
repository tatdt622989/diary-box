import {
  Accountings,
  CanvasNote,
  Model,
  Note,
  Products,
  ToastMSG,
  UserData,
  ResPoint,
  Res,
  ResEditorModel,
  ResBuyModel,
  PointInfo,
} from '@/types';
import { createStore, Store } from 'vuex';
import { Modal } from 'bootstrap';
import { TierResult } from 'detect-gpu';
import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithRedirect, signInWithEmailAndPassword, onAuthStateChanged,
  NextOrObserver, User, signInAnonymously, createUserWithEmailAndPassword, updateProfile,
  getRedirectResult,
  signOut,
} from 'firebase/auth';
import {
  getDatabase, ref, onValue, query, limitToLast, set,
} from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import {
  getStorage, uploadString, ref as storageRef, getDownloadURL,
} from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCiHUhT44nI3fCnNlE_M7CkU9cDBkec1F8',
  authDomain: 'diary-box-asia.firebaseapp.com',
  databaseURL: 'https://diary-box-asia-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'diary-box-asia',
  storageBucket: 'diary-box-asia.appspot.com',
  messagingSenderId: '399180834464',
  appId: '1:399180834464:web:551d110d53f629db31cbc5',
  measurementId: 'G-B1NYQDZZSH',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
const functions = getFunctions(app);

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
    userInfo: null as null | User,
    formHint: '' as string,
    modal: null as null | Modal,
    userData: {
      modelData: [],
      noteData: [] as Array<Note>,
      canvasData: [] as Array<CanvasNote>,
      name: '',
      pointInfo: {
        balance: 0,
        lastGet: '',
        pointCounter: 0,
      },
      email: '',
      accountingData: {} as Accountings,
    } as UserData,
    dataLoaded: false,
    getPoint: null,
    loading: false,
    loadingStr: '',
    quality: null,
    gpuTier: null as null | TierResult,
    isDebug: false,
    modalLoaded: false,
    functionMenuOpen: false,
    modalClosed: false,
  },
  mutations: {
    menuToggler(state, data) {
      state.isMenuOpen = data;
    },
    functionMenuToggler(state, data) {
      state.functionMenuOpen = data;
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
      state.loading = false;
      if (state.modal) {
        state.modal.hide();
      }
    },
    resetUserData(state) {
      state.userData = null!;
      state.userData = {
        accountingData: {},
        modelData: [],
        noteData: [],
        canvasData: [],
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
    updateLoading(state, data) {
      state.loading = data;
    },
    updateFormHint(state, data) {
      state.formHint = data;
    },
    updateDataLoadStatus(state, data) {
      state.dataLoaded = data;
    },
    updateNoteData(state, data) {
      if (data.type === 'text') {
        state.userData.noteData = data.data;
      }
      if (data.type === 'canvas') {
        state.userData.canvasData = data.data;
      }
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
      const keys = Object.keys(data);
      keys.forEach((key: string) => {
        state.userData[key] = data[key] ? data[key] : null;
      });
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
    updateModalClosed(state, data) {
      state.modalClosed = data;
    },
  },
  actions: {
    login({ dispatch, commit, state }, data) {
      dispatch('openModal', {
        type: 'loading',
        loadingStr: '登入中',
      });
      const googleProvider = new GoogleAuthProvider();
      // const facebookProvider = new firebase.auth.FacebookAuthProvider();
      switch (data.type) {
        case 'google':
          sessionStorage.setItem('pending', '1');
          // googleProvider.setCustomParameters({ prompt: 'select_account' });
          signInWithRedirect(auth, googleProvider);
          break;
        case 'email':
          signInWithEmailAndPassword(auth, data.email, data.password)
            .then((userCredential) => {
              // Signed in
              dispatch('updateUserInfo');
            })
            .catch((error) => {
              let times = 0;
              const closeModal = setInterval(() => {
                if (times > 50 || state.modalLoaded || !state.modal) {
                  commit('closeModal');
                  clearInterval(closeModal);
                }
                times += 1;
              }, 100);
              const errorCode = error.code;
              const errorMessage = error.message;
              // console.log(errorCode, errorMessage);
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
          signInAnonymously(auth)
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
        // case 'facebook':
        //   facebookProvider.addScope('public_profile');
        //   firebase.auth().languageCode = 'zh-tw';
        //   facebookProvider.setCustomParameters({
        //     display: 'popup',
        //   });
        //   firebase
        //     .auth()
        //     .signInWithPopup(facebookProvider)
        //     .then((result) => {
        //       /** @type {firebase.auth.OAuthCredential} */
        //       const { credential } = result;
        //       // The signed-in user info.
        //       const { user } = result;
        //       const { accessToken }: any = credential;
        //       console.log(credential, user, accessToken);
        //     })
        //     .catch((error) => {
        //       // Handle Errors here.
        //       const errorCode = error.code;
        //       const errorMessage = error.message;
        //       // The email of the user's account used.
        //       const { email } = error;
        //       // The firebase.auth.AuthCredential type that was used.
        //       const { credential } = error;
        //     });
        //   break;
        default:
          break;
      }
    },
    async register({ dispatch, state }, data) {
      createUserWithEmailAndPassword(auth, data.email, data.password).then((result) => {
        state.formHint = '';
        if (auth.currentUser) {
          updateProfile(auth.currentUser, {
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
      dispatch('openModal', {
        type: 'loading',
        loadingStr: '購買中',
      });
      const buyModel = httpsCallable(functions, 'buyModel');
      const result: Res = await buyModel({ buyingModel: data })
        .then((res) => res as Res)
        .catch((err) => {
          dispatch('updateToast', {
            type: 'error',
            content: err,
          });
          return {
            data: {
              msg: err,
              status: 'error',
            },
          };
        });
      const resData = result.data as ResBuyModel;
      if (result) {
        if (resData.status === 'ok') {
          if (resData.msg === '購買成功') {
            await dispatch('getModelData');
            await dispatch('getBalance');
            dispatch('updateToast', {
              type: 'success',
              content: resData.msg,
            });
            return true;
          }
          if (resData.msg === '餘額不足，購買失敗') {
            dispatch('updateToast', {
              type: 'hint',
              content: resData.msg,
            });
            let times = 0;
            const closeModal = setInterval(() => {
              if (times > 50 || state.modalLoaded) {
                commit('closeModal');
                clearInterval(closeModal);
              }
              times += 1;
            }, 100);
            return null;
          }
        } else {
          dispatch('updateToast', {
            type: 'error',
            content: resData.msg,
          });
        }
      }
      return null;
    },
    signOut({ dispatch, commit, state }) {
      signOut(auth).then(() => {
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
      onValue(ref(db, '/products'), (snap) => {
        state.modelFormat = snap.val();
      }, { onlyOnce: true });
    },
    getPoint({ dispatch, commit, state }, data) {
      const getPoint = httpsCallable(functions, 'getPoint');
      getPoint({ type: data.type }).then((res: Res) => {
        let times = 0;
        const closeModal = setInterval(() => {
          if (times > 50 || state.modalLoaded) {
            commit('closeModal');
            clearInterval(closeModal);
            const resData: ResPoint = res.data as ResPoint;
            if (resData && resData.status === 'ok') {
              if (resData.point > 0) {
                dispatch('openModal', {
                  type: 'pointNotification',
                  asynchronous: false,
                });
                commit('updateGetPoint', resData.point);
                dispatch('getBalance');
              } else {
                // dispatch('updateToast', {
                //   type: 'hint',
                //   content: res.data.msg,
                // });
              }
            }
          }
          times += 1;
        }, 100);
      }).catch((err) => {
        dispatch('updateToast', {
          type: 'error',
          content: err,
        });
      });
    },
    async getHomeData({ dispatch, commit, state }) {
      if (state.userInfo) {
        let userData = {
          pointInfo: {
            balance: 0,
            lastGet: '',
            pointCounter: 0,
          },
          email: '',
          name: '',
          modelData: [] as any,
          noteData: [] as any,
          canvasData: [] as any,
        };
        const name: string = await new Promise((resolve) => {
          onValue(ref(db, `/users/${state.userInfo?.uid}/name`), (snapshot) => resolve(snapshot.val()), { onlyOnce: true });
        });
        if (!name) {
          let displayName;
          if (state.userInfo?.isAnonymous) {
            displayName = '訪客';
          } else {
            displayName = state.userInfo?.displayName;
          }
          const newUserFormat = httpsCallable(functions, 'newUserFormat');
          await newUserFormat({ displayName }).then((res: Res) => {
            const resData: UserData = res.data as UserData;
            if (resData) {
              userData = resData;
            }
          });
        } else {
          const pointInfo: PointInfo = await new Promise((resolve) => {
            onValue(ref(db, `/users/${state.userInfo?.uid}/pointInfo`), (snapshot) => resolve(snapshot.val()), { onlyOnce: true });
          });
          const modelData: Array<Model> = await new Promise((resolve) => {
            onValue(ref(db, `/users/${state.userInfo?.uid}/modelData`), (snapshot) => resolve(snapshot.val()), { onlyOnce: true });
          });
          console.log(modelData);
          const noteData = await new Promise((resolve) => {
            onValue(query(ref(db, `/users/${state.userInfo?.uid}/noteData`), limitToLast(1)), (snapshot) => {
              const obj = snapshot.val() ? snapshot.val() : {};
              return resolve(Object.values(obj));
            }, { onlyOnce: true });
          });
          userData = {
            pointInfo,
            modelData,
            noteData,
            canvasData: [],
            name,
            email: state.userInfo.email as string,
          };
        }
        commit('updateUserData', userData);
        commit('menuToggler', false);
        let times = 0;
        const closeModal = setInterval(() => {
          if (times > 50 || state.modalLoaded || !state.modal) {
            commit('closeModal');
            clearInterval(closeModal);
            let guideState;
            try {
              guideState = Number(localStorage.getItem('guideState'));
            } catch (e) {
              localStorage.removeItem('guideState');
            }
            // if (!guideState) {
            //   dispatch('openModal', {
            //     type: 'guide',
            //     asynchronous: false,
            //   });
            // }
          }
          times += 1;
        }, 100);
      }
      return false;
    },
    async getBalance({ commit, state }) {
      if (state.userInfo) {
        const balance = await new Promise((resolve) => {
          onValue(ref(db, `/users/${state.userInfo?.uid}/pointInfo/balance`), (snap) => resolve(snap.val()), { onlyOnce: true });
        });
        commit('updateBalance', balance);
      }
    },
    async getNoteData({ commit, state }, data) {
      if (state.userInfo) {
        let noteData: any;
        if (data.type === 'text') {
          noteData = await new Promise((resolve) => {
            onValue(ref(db, `/users/${state.userInfo?.uid}/noteData`), (snap) => resolve(snap.val()), { onlyOnce: true });
          });
          noteData = noteData ? noteData.filter((obj: any) => obj) : [];
          commit('updateUserData', { noteData });
        }
        if (data.type === 'canvas') {
          noteData = await new Promise((resolve) => {
            onValue(ref(db, `/users/${state.userInfo?.uid}/canvasData`), (snap) => resolve(snap.val()), { onlyOnce: true });
          });
          noteData = noteData ? noteData.filter((obj: any) => obj) : [];
          commit('updateUserData', { canvasData: noteData });
        }
      }
    },
    async getModelData({ commit, state }) {
      if (state.userInfo) {
        const modelData = await new Promise((resolve) => {
          onValue(ref(db, `/users/${state.userInfo?.uid}/modelData`), (snapshot) => resolve(snapshot.val()), { onlyOnce: true });
        });
        commit('updateModelData', modelData);
      }
    },
    async getAccountingData({ commit, state }) {
      if (state.userInfo) {
        const data = await new Promise((resolve) => {
          onValue(ref(db, `/users/${state.userInfo?.uid}/accountingData`), (snapshot) => resolve(snapshot.val()), { onlyOnce: true });
        });
        commit('updateUserData', { accountingData: data });
      }
    },
    updateToast({ commit }, data) {
      commit('addToast', data);
      setTimeout(() => {
        commit('removeToast');
      }, 3000);
    },
    async updateUserInfo({ dispatch, state, commit }) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          state.userInfo = user as User;
          dispatch('getHomeData').then(() => {
            state.dataLoaded = true;
          });
        } else {
          commit('resetUserData');
          state.userInfo = null;
        }
      });
    },
    async updateModelData({ dispatch, commit, state }, data) {
      const editModel = httpsCallable(functions, 'editModel');
      let isSuccess = false;
      await editModel(data).then((res) => {
        const resData = res.data as ResEditorModel;
        if (resData.status === 'ok' && resData.modelData) {
          commit('updateModelData', resData.modelData);
          isSuccess = true;
        }
      });
      return isSuccess;
    },
    async updateNoteData({ dispatch, commit, state }, data) {
      let allData: any = data.type === 'text' ? state.userData.noteData : state.userData.canvasData;
      if (!allData) { allData = []; }
      let index = null;
      const note = data.data;
      dispatch('openModal', {
        type: 'loading',
        loadingStr: '資料上傳中',
      });
      if (state.userInfo) {
        switch (data.status) {
          case 'add':
            index = allData.length;
            break;
          case 'edit':
            allData.forEach((el: Note | CanvasNote, i: number) => {
              if (el.id === data.data.id) {
                index = i;
              }
            });
            break;
          case 'delete':
            allData = allData.filter((el: Note | CanvasNote) => el.id! !== data.id);
            break;
          default:
            break;
        }
        if (data.status === 'delete') {
          if (data.type === 'text') {
            await set(ref(db, `/users/${state.userInfo.uid}/noteData`), allData);
          }
          if (data.type === 'canvas') {
            await set(ref(db, `/users/${state.userInfo.uid}/canvasData`), allData);
          }
        } else {
          if (data.type === 'text') {
            await set(ref(db, `/users/${state.userInfo.uid}/noteData/${index}`), note);
          }
          if (data.type === 'canvas') {
            await set(ref(db, `/users/${state.userInfo.uid}/canvasData/${index}`), note);
          }
        }
        await dispatch('getNoteData', { type: data.type });
        if (data.status === 'edit') {
          dispatch('updateToast', {
            type: 'success',
            content: '編輯成功',
          });
        } else if (data.status === 'delete') {
          dispatch('updateToast', {
            type: 'success',
            content: '刪除成功',
          });
        }
      }
    },
    async updateAccountingData({ dispatch, commit, state }, data) {
      dispatch('openModal', {
        type: 'loading',
        loadingStr: '資料上傳中',
      });
      if (state.userInfo) {
        await set(ref(db, `/users/${state.userInfo.uid}/accountingData/${data.key}`), data.data);
        dispatch('getPoint', { type: 'accounting' });
      }
    },
    openModal({ commit, state }, data) {
      state.formHint = '';
      const el = document.getElementById(`${data.type}Modal`);
      const backdrop: boolean | 'static' | undefined = true;
      commit('updateModalLoaded', false);
      if (data.type === 'loading' && data.loadingStr) {
        commit('updateLoading', true);
        commit('updateLoadingStr', data.loadingStr);
        return;
      }
      if (el) {
        if (data.asynchronous) {
          el.addEventListener('shown.bs.modal', () => {
            commit('updateModalLoaded', true);
          });
          el.addEventListener('hidden.bs.modal', () => {
            commit('updateModalClosed', true);
          });
        }
        state.modal = new Modal(el, {
          backdrop,
        });
        state.modal.show();
      }
    },
    closeModal({ commit, state }) {
      commit('updateLoading', false);
      if (state.modal) {
        state.modal.hide();
      }
    },
    async getRedirectRes({ dispatch, commit, state }) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const { user } = result;
            // The signed-in user info.
            if (user) {
              state.userInfo = user;
              dispatch('getHomeData').then(() => {
                state.dataLoaded = true;
              });
            }
            sessionStorage.removeItem('pending');
          }
        }).catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          dispatch('updateToast', {
            type: 'error',
            content: errorMessage,
          });
        });
    },
    async uploadImg({ state }, data) {
      if (state.userInfo) {
        const canvasRef = storageRef(storage, `/canvas/${state.userInfo.uid}/${data.id}`);
        await uploadString(canvasRef, data.data, 'data_url');
      }
    },
    async getImgURL({ state }, data) {
      if (state.userInfo) {
        const canvasRef = storageRef(storage, `/canvas/${state.userInfo.uid}/${data.id}`);
        const res = await getDownloadURL(canvasRef).then((URL) => URL);
        return res;
      }
      return null;
    },
  },
  modules: {
  },
});
