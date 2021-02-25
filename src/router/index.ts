import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import NoteList from '@/views/NoteList.vue';
import TextEditor from '@/views/TextEditor.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
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
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
