import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
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
const AccountingList = () => import('@/views/AccountingList.vue');

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
  },
  {
    path: '/store',
    name: 'Store',
    component: ModelList,
  },
  {
    path: '/scene-editor',
    name: 'SceneEditor',
    component: SceneEditor,
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
    path: '/accounting-list',
    name: 'AccountingList',
    component: AccountingList,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 導航守衛
router.beforeEach((to, from, next) => {
  console.log(to, from);
  if (to.name !== 'Welcome' && to.name !== 'Privacy' && !store.state.userInfo) {
    next({
      path: '/',
    });
  } else {
    next();
  }
});

export default router;
