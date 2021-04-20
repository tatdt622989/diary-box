<template>
  <router-view/>
  <Toast></Toast>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  computed,
  onMounted,
} from 'vue';
import Toast from '@/components/Toast.vue';
import { useStore } from 'vuex';
import firebase from 'firebase/app';
import 'firebase/analytics';

export default defineComponent({
  name: 'app',
  components: {
    Toast,
  },
  setup() {
    const store = useStore();

    onMounted(() => {
      const firebaseConfig = {
        apiKey: 'AIzaSyBVfhvIehRON11kf0m3NLb6ctDtcUFP5Uo',
        authDomain: 'paste-life.firebaseapp.com',
        projectId: 'paste-life',
        storageBucket: 'paste-life.appspot.com',
        messagingSenderId: '300124649542',
        appId: '1:300124649542:web:2423b74d9012c564ba7247',
        measurementId: 'G-R6PQS5M49V',
      };
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      firebase.analytics();
      try {
        if (localStorage.getItem('note-data')) {
          store.commit('getNoteData', JSON.parse(localStorage.getItem('note-data') as string));
        }
      } catch (e) {
        localStorage.settItem('note-data', []);
        store.commit('getNoteData', []);
      }
    });
    return {
    };
  },
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
@import '~@/assets/scss/app.scss';

@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: local('Material Icons'),
       local('MaterialIcons-Regular'),
       url(~@/assets/fonts/MaterialIcons-Regular.ttf) format('truetype'),
       url(~@/assets/fonts/MaterialIcons-Regular.woff2) format('woff2'),
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;  /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;

  /* Support for all WebKit browsers. */
  -webkit-font-smoothing: antialiased;
  /* Support for Safari and Chrome. */
  text-rendering: optimizeLegibility;

  /* Support for Firefox. */
  -moz-osx-font-smoothing: grayscale;

  /* Support for IE. */
  font-feature-settings: 'liga';
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  background-color: $primary !important;
}
</style>
