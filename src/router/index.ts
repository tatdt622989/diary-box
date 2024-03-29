import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import store from '../store';

const Home = () => import('@/views/Home.vue');
const Welcome = () => import('@/views/Welcome.vue');
const NoteList = () => import('@/views/NoteList.vue');
const TextEditor = () => import('@/views/TextEditor.vue');
const ModelList = () => import('@/views/ModelList.vue');
const SceneEditor = () => import('@/views/SceneEditor.vue');
const ModelEditor = () => import('@/views/ModelEditor.vue');
const NotePreviewer = () => import('@/views/NotePreviewer.vue');
const Privacy = () => import('@/views/Privacy.vue');
const Accounting = () => import('@/views/Accounting.vue');
const DrawingNotes = () => import('@/views/DrawingNotes.vue');
const Canvas = () => import('@/views/Canvas.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: Welcome,
  },
  {
    path: '/',
    name: 'Welcome',
    component: Welcome,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { hasLoading: true, loadingStr: '場景準備中' },
  },
  {
    path: '/note-list',
    name: 'NoteList',
    component: NoteList,
  },
  {
    path: '/text-editor',
    name: 'TextEditor',
    component: TextEditor,
  },
  {
    path: '/model-list',
    name: 'ModelList',
    component: ModelList,
    meta: { hasLoading: true, loadingStr: '模型載入中' },
  },
  {
    path: '/store',
    name: 'Store',
    component: ModelList,
    meta: { hasLoading: true, loadingStr: '模型載入中' },
  },
  {
    path: '/scene-editor',
    name: 'SceneEditor',
    component: SceneEditor,
    meta: { hasLoading: true, loadingStr: '編輯器載入中' },
  },
  {
    path: '/model-editor',
    name: 'ModelEditor',
    component: ModelEditor,
  },
  {
    path: '/note-previewer',
    name: 'NotePreviewer',
    component: NotePreviewer,
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: Privacy,
  },
  {
    path: '/accounting',
    name: 'Accounting',
    component: Accounting,
  },
  {
    path: '/drawing-notes',
    name: 'DrawingNotes',
    component: DrawingNotes,
  },
  {
    path: '/canvas',
    name: 'Canvas',
    component: Canvas,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.NODE_ENV === 'production' ? '/' : '/'),
  routes,
});

// 導航守衛
router.beforeEach((to, from, next) => {
  // console.log(to, from);
  if (to.meta.hasLoading && to.meta.loadingStr) {
    store.dispatch('openModal', {
      type: 'loading',
      loadingStr: to.meta.loadingStr,
    });
  }

  if (to.name !== 'Welcome' && to.name !== 'Privacy' && !store.state.userInfo) {
    next({
      path: '/',
    });
  } else {
    next();
  }
});

export default router;
