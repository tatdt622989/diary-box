<template>
  <div
    class="main-wrap accounting-list-wrap menu-layout"
    :style="{ height }"
    @click="isDatePickerOpen = false"
  >
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click.stop="$router.push('/accounting')">
        <span class="material-icons">arrow_back</span>
      </button>
      <p>{{ date }}</p>
      <button class="btn-circle" @click.stop="isDatePickerOpen = !isDatePickerOpen">
        <span class="material-icons">edit_calendar</span>
      </button>
      <DatePicker
        color="green"
        v-model="date"
        :model-config="modelConfig"
        v-if="isDatePickerOpen"
        @click.stop
      >
      </DatePicker>
    </div>
    <div class="content">
      <div class="date"></div>
      <ul class="accounting-list">
        <li>
          <div class="icon">
            <span class="material-icons"></span>
          </div>
          <span></span>
          <span></span>
          <button></button>
          <ul class="menu">
            <li></li>
          </ul>
        </li>
      </ul>
    </div>
    <button class="btn btn-secondary" id="bookkeepingBtn">開始記帳</button>
  </div>
</template>

<script>
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
  watch,
} from 'vue';
import Navbar from '@/components/Navbar.vue';
import { useStore } from 'vuex';
import { DatePicker } from 'v-calendar';

export default defineComponent({
  name: 'AccountingList',
  components: {
    Navbar,
    DatePicker,
  },
  setup() {
    const date = ref(new Date());
    const isDatePickerOpen = ref(false);
    const store = useStore();

    function getZero(num) {
      if (num < 10) {
        return `0${num}`;
      }
      return num;
    }

    date.value = `${date.value.getFullYear()}年${getZero(date.value.getMonth() + 1)}月${getZero(date.value.getDate())}日`;

    watch(date, () => {
      isDatePickerOpen.value = false;
    });

    return {
      date,
      modelConfig: {
        type: 'string',
        mask: 'YYYY年MM月DD日', // Uses 'iso' if missing
      },
      height: computed(() => store.state.height),
      isDatePickerOpen,
    };
  },
});
</script>

<style lang="scss" scoped>
#bookkeepingBtn {
  border-radius: 999px;
  bottom: 23px;
  color: $primary;
  font-size: 20px;
  font-weight: bold;
  height: 52px;
  padding: 0 24px;
  position: fixed;
  right: 16px;
  border: 2px solid $primary;
}
.header {
  overflow: visible;
  position: relative;
}
.vc-container {
  position: absolute;
  right: 16px;
  top: 76px;
}
</style>
