<template>
  <div
    class="main-wrap accounting-list-wrap menu-layout"
    :style="{ height }"
    @click="
      isDatePickerOpen = false;
      editorStatus = false;
      selectedAccountingIndex = null;
      editorReset()
    "
  >
    <Navbar></Navbar>
    <div class="header">
      <button class="btn-circle" @click.stop="$router.push('/accounting')">
        <span class="material-icons">arrow_back</span>
      </button>
      <p v-cloak>{{ date }}</p>
      <button
        class="btn-circle"
        @click.stop="isDatePickerOpen = !isDatePickerOpen"
      >
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
      <ul class="accounting-list">
        <li v-for="(item, i) in displayAccountings" :key="'display' + i">
          <div class="icon">
            <span class="material-icons">{{ item.icon }}</span>
          </div>
          <span class="text ellipsis">{{ item.title }}</span>
          <span class="text ellipsis">
            {{ `${item.type === "income" ? "+" : "-"}${item.price}元` }}
          </span>
          <button
            class="btn btn-circle menu-btn"
            :class="{ active: selectedAccountingIndex === i }"
            @click.stop="selectedAccountingIndex = i"
          >
            <span class="material-icons">more_vert</span>
          </button>
          <ul
            class="function-menu"
            v-if="selectedAccountingIndex === i"
            @click.stop
          >
            <li>
              <button
                @click="
                  editorStatus = 'edit';
                "
              >
                編輯
              </button>
            </li>
            <li>
              <button
                @click="
                  $store.dispatch('openModal', {
                    type: 'deleteCheck',
                    asynchronous: false,
                  });
                "
              >
                刪除
              </button>
            </li>
          </ul>
        </li>
      </ul>
      <div class="default" v-if="displayAccountings.length === 0">
        <span class="material-icons"> playlist_add </span>
        <p>這天還沒有收支紀錄喔！</p>
      </div>
    </div>
    <button
      class="btn btn-secondary"
      id="bookkeepingBtn"
      @click.stop="editorStatus = 'add'"
    >
      開始記帳
    </button>
    <div
      class="accounting-editor slide-up-window"
      :class="{ active: editorStatus }"
      @click.stop
    >
      <p>{{ editorStatus === "add" ? "新增收支" : "編輯收支" }}</p>
      <div class="accounting-status">
        <button
          @click="
            editorAccountingStatus = 'income';
            editorTag = '薪資';
            editorIcon = 'attach_money';
          "
          :class="{ active: editorAccountingStatus === 'income' }"
        >
          收入
        </button>
        <button
          @click="
            editorAccountingStatus = 'expenditure';
            editorTag = '娛樂';
            editorIcon = 'sports_esports';
          "
          :class="{ active: editorAccountingStatus === 'expenditure' }"
        >
          支出
        </button>
      </div>
      <hr />
      <div class="tags-group">
        <button
          class="btn btn-circle tag-btn"
          v-for="item in accountingTags[editorAccountingStatus]"
          @click.stop="
            editorTag = item.name;
            editorIcon = item.icon;
          "
          :key="item"
          :class="{ active: editorTag === item.name }"
        >
          <span class="material-icons">{{ item.icon }}</span>
          {{ item.name }}
        </button>
      </div>
      <hr />
      <input type="text" placeholder="名稱" v-model="editorTitle" />
      <div class="money">
        <span>元</span>
        <input type="number" placeholder="金額" v-model.number="editorPrice" />
      </div>
      <hr />
      <div class="btn-group status-group">
        <button class="btn-rectangle cancel-btn" @click="editorReset">
          取消
        </button>
        <button class="btn-rectangle apply-btn" @click="updateAccounting">
          套用
        </button>
      </div>
    </div>
    <DeleteCheck @deleteEvent="deleteAccounting"></DeleteCheck>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
  watch,
} from 'vue';
import Navbar from '@/components/Navbar.vue';
import DeleteCheck from '@/components/DeleteCheck.vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { DatePicker } from 'v-calendar';
import {
  Accounting,
  Accountings,
} from '@/types';

export default defineComponent({
  name: 'AccountingList',
  components: {
    Navbar,
    DatePicker,
    DeleteCheck,
  },
  setup() {
    const date = ref<any>(new Date());
    const isDatePickerOpen = ref(false);
    const route = useRoute();
    const store = useStore();
    const accountingTags = {
      expenditure: [{
        name: '娛樂',
        icon: 'sports_esports',
      }, {
        name: '飲食',
        icon: 'restaurant',
      }, {
        name: '交通',
        icon: 'commute',
      }, {
        name: '生活',
        icon: 'category',
      }, {
        name: '醫療',
        icon: 'local_hospital',
      }, {
        name: '其他',
        icon: 'more',
      }],
      income: [{
        name: '薪資',
        icon: 'attach_money',
      }, {
        name: '理財',
        icon: 'insert_chart_outlined',
      }, {
        name: '其他',
        icon: 'more',
      }],
    };
    const editorStatus = ref<boolean | string>(false);
    const editorAccountingStatus = ref('expenditure');
    const editorIcon = ref('sports_esports');
    const editorTag = ref('娛樂');
    const editorPrice = ref();
    const editorTitle = ref('');
    const accountingData = ref<Accountings>({});
    const displayAccountings = ref<Array<Accounting>>([]);
    const selectedAccountingIndex = ref();
    const openedFunctionMenu = ref<number>();

    function getZero(num: number) {
      if (num < 10) {
        return `0${num}`;
      }
      return num;
    }

    date.value = `${date.value.getFullYear()}年${getZero(date.value.getMonth() + 1)}月${getZero(date.value.getDate())}日`;

    onMounted(async () => {
      if (route.params.status && route.params.status === 'add') {
        editorStatus.value = 'add';
      }
      if (!store.state.userData.accountingData
        || Object.keys(store.state.userData.accountingData).length === 0) {
        await store.dispatch('getAccountingData');
      }
      accountingData.value = store.state.userData.accountingData || null;
      if (!accountingData.value[date.value]) {
        accountingData.value[date.value] = [];
      }
      displayAccountings.value = accountingData.value[date.value] as Array<Accounting> || [];
    });

    watch(date, () => {
      isDatePickerOpen.value = false;
      selectedAccountingIndex.value = null;
      displayAccountings.value = accountingData.value[date.value] as Array<Accounting> || [];
    });

    watch(isDatePickerOpen, (n) => {
      if (n) {
        editorStatus.value = false;
      }
    });

    watch(editorStatus, (n) => {
      if (n === 'edit') {
        const data = accountingData.value[date.value][selectedAccountingIndex.value];
        editorAccountingStatus.value = data.type;
        editorIcon.value = data.icon;
        editorTag.value = data.tag;
        editorTitle.value = data.title;
        editorPrice.value = data.price;
      }
      if (n) {
        isDatePickerOpen.value = false;
      }
    });

    function editorReset() {
      editorStatus.value = false;
      editorAccountingStatus.value = 'expenditure';
      editorTitle.value = '';
      editorTag.value = '娛樂';
      editorPrice.value = null;
      editorIcon.value = 'sports_esports';
      selectedAccountingIndex.value = null;
    }

    async function updateAccounting() {
      if (!editorTitle.value) {
        return store.dispatch('updateToast', {
          type: 'hint',
          content: '請填寫名稱',
        });
      }
      if (!editorPrice.value) {
        return store.dispatch('updateToast', {
          type: 'hint',
          content: '請填寫價格',
        });
      }
      const data: Accounting = {
        type: editorAccountingStatus.value,
        title: editorTitle.value,
        tag: editorTag.value,
        price: editorPrice.value,
        icon: editorIcon.value,
      };
      if (!accountingData.value[date.value]) {
        accountingData.value[date.value] = [];
      }
      if (editorStatus.value === 'add') {
        accountingData.value[date.value].splice(0, 0, data);
      } else if (editorStatus.value === 'edit') {
        accountingData.value[date.value][selectedAccountingIndex.value] = data;
      }
      await store.dispatch('updateAccountingData', {
        key: date.value,
        data: accountingData.value[date.value],
      });
      displayAccountings.value = accountingData.value[date.value] as Array<Accounting> || [];
      editorReset();
      return false;
    }

    async function deleteAccounting() {
      store.commit('closeModal');
      accountingData.value[date.value].splice(selectedAccountingIndex.value, 1);
      const data = accountingData.value[date.value];
      await store.dispatch('updateAccountingData', {
        key: date.value,
        data,
      });
      let times = 0;
      const closeModal = setInterval(() => {
        if (times > 50 || store.state.modalLoaded) {
          store.commit('closeModal');
          store.dispatch('updateToast', {
            type: 'success',
            content: '刪除成功',
          });
          clearInterval(closeModal);
          editorReset();
        }
        times += 1;
      }, 100);
    }

    return {
      accountingData,
      date,
      modelConfig: {
        type: 'string',
        mask: 'YYYY年MM月DD日', // Uses 'iso' if missing
      },
      height: computed(() => store.state.height),
      isDatePickerOpen,
      editorStatus,
      editorAccountingStatus,
      accountingTags,
      editorTag,
      updateAccounting,
      selectedAccountingIndex,
      openedFunctionMenu,
      editorPrice,
      editorTitle,
      displayAccountings,
      editorIcon,
      deleteAccounting,
      editorReset,
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

.content {
  height: 100%;
  overflow: auto;
}
.header {
  p[v-cloak] {
    display: none;
  }
  overflow: visible;
  position: relative;
}
.vc-container {
  position: absolute;
  right: 16px;
  top: 76px;
  z-index: 100;
}
.accounting-editor {
  .accounting-status {
    button {
      &.active {
        background: $primary;
        color: $secondary;
      }
      background: none;
      color: $primary;
      font-size: 20px;
      font-weight: bold;
      flex-grow: 1;
      transition: all 0.2s ease-in-out;
    }
    border: 2px solid $primary;
    border-radius: 999px;
    display: flex;
    height: 52px;
    overflow: hidden;
  }
  .tags-group {
    .tag-btn {
      &.active {
        span {
          color: $secondary;
        }
        background-color: $primary;
        color: $secondary;
      }
      span {
        margin-right: 8px;
      }
      align-items: center;
      background: none;
      border-radius: 6px;
      border: 2px solid $primary;
      color: $primary;
      display: flex;
      font-size: 20px;
      font-weight: bold;
      height: 52px;
      margin-bottom: 12px;
      width: 100px;
      padding: 0;
    }
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: -12px;
  }
  input {
    &:nth-of-type(1) {
      margin-bottom: 12px;
    }
    border-width: 2px;
  }
  .money {
    input {
      appearance: none;
      margin-bottom: 0;
      padding-right: 20px;
    }
    span {
      color: $primary;
      font-size: 24px;
      font-weight: bold;
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
    position: relative;
  }
  .status-group {
    button {
      margin-top: 0;
    }
  }
  &.active {
    bottom: 0;
  }
  bottom: -526px;
  height: 526px;
  z-index: 9999;
}
.default {
  span {
    color: $secondary;
    font-size: 120px;
  }
  p {
    color: $secondary;
    font-size: 20px;
    font-weight: bold;
  }
  display: flex;
  flex-direction: column;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
}
.accounting-list {
  > li {
    .icon {
      span {
        color: $secondary;
        font-size: 32px;
      }
      align-items: center;
      background: none;
      border-radius: 999px;
      display: flex;
      height: 52px;
      justify-content: center;
      border: 1px solid $secondary;
      width: 52px;
    }
    .text {
      &:nth-of-type(1) {
        width: 40%;
        text-align: left;
        padding-left: 12px;
      }
      &:nth-of-type(2) {
        flex-grow: 1;
        text-align: right;
        padding-right: 8px;
      }
      color: $secondary;
      font-size: 20px;
      font-weight: bold;
      overflow: hidden;
    }
    display: flex;
    justify-content: space-between;
    height: 82px;
    border-bottom: 2px solid $secondary;
    align-items: center;
    position: relative;
  }
}
.menu-btn {
  &:hover,
  &:active,
  &.active {
    span {
      color: $primary;
    }
    background-color: $secondary;
  }
  span {
    color: $secondary;
  }
  background-color: $primary;
  position: relative;
}
.main-wrap {
  display: flex;
  flex-direction: column;
}
</style>
