import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import Welcome from '@/views/Welcome.vue';
import NoteList from '@/views/NoteList.vue';
import TextEditor from '@/views/TextEditor.vue';
import ModelList from '@/views/ModelList.vue';
import Store from '@/views/Store.vue';
import ModelSelector from '@/views/ModelSelector.vue';
import ModelEditor from '@/views/ModelEditor.vue';

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
    component: Store,
  },
  {
    path: '/model-selector',
    name: 'ModelSelector',
    component: ModelSelector,
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
