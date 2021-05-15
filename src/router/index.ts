import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

const Home = () => import('@/views/Home.vue');
const Welcome = () => import('@/views/Welcome.vue');
const NoteList = () => import('@/views/NoteList.vue');
const TextEditor = () => import('@/views/TextEditor.vue');
const ModelList = () => import('@/views/ModelList.vue');
const ModelSelector = () => import('@/views/ModelSelector.vue');
const SceneEditor = () => import('@/views/SceneEditor.vue');
const ModelEditor = () => import('@/views/ModelEditor.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: Welcome,
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
    path: '/model-selector',
    name: 'ModelSelector',
    component: ModelSelector,
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
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
