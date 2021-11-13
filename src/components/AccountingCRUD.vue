<template>
  <div
    class="modal fade"
    id="accountingCRUDModal"
    tabindex="-1"
    aria-labelledby="accountingCRUDModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="accountingCRUDModalLabel">
            {{ status === "add" ? "新增收支" : "編輯收支" }}
          </h5>
          <button
            type="button"
            class="btn btn-circle"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div
            class="accounting-editor"
            :class="{ active: status }"
            @click.stop
          >
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
              <input
                type="number"
                placeholder="金額"
                v-model.number="editorPrice"
              />
            </div>
            <hr />
            <div class="btn-group status-group" v-if="!delChecker">
              <button class="btn-rectangle cancel-btn" @click="delChecker = true;">
                刪除
              </button>
              <button class="btn-rectangle apply-btn" @click="updateAccounting">
                套用
              </button>
            </div>
          </div>
        </div>
        <div class="del-check" v-if="delChecker">
          <p>是否真的要刪除？</p>
          <div class="btn-group">
            <button class="btn-rectangle" @click="delChecker = false;">
              算了
            </button>
            <button class="btn-rectangle" @click="deleteAccounting">
              刪都刪
            </button>
          </div>
        </div>
      </div>
    </div>
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
  toRefs,
} from 'vue';
import { useStore } from 'vuex';
import {
  Accounting,
  Accountings,
} from '@/types';

export default defineComponent({
  name: 'AccountingCRUD',
  props: ['status', 'selectedIndex', 'selectedDate'],
  emits: ['update'],
  setup(props, context) {
    const date = ref<any>(new Date());
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
    const editorAccountingStatus = ref('expenditure');
    const editorIcon = ref('sports_esports');
    const editorTag = ref('娛樂');
    const editorPrice = ref();
    const editorTitle = ref('');
    const accountingData = ref<Accountings>({});
    const dayAccountings = ref<Array<Accounting>>([]);
    const openedFunctionMenu = ref<number>();
    const refPorps = toRefs(props);
    const { selectedIndex } = refPorps;
    const { status } = refPorps;
    const { selectedDate } = refPorps;
    const delChecker = ref<boolean>(false);

    function getDayAccountings() {
      dayAccountings.value = accountingData.value[selectedDate.value] as Array<Accounting>
        || [];
    }

    onMounted(async () => {
      if (!store.state.userData.accountingData
        || Object.keys(store.state.userData.accountingData).length === 0) {
        await store.dispatch('getAccountingData');
      }
      accountingData.value = store.state.userData.accountingData || null;
      if (!accountingData.value[selectedDate.value]) {
        accountingData.value[selectedDate.value] = [];
      }
      getDayAccountings();
    });

    watch(selectedDate, () => {
      getDayAccountings();
    });

    watch(selectedIndex, (newVal: number) => {
      console.log(selectedDate.value, newVal);
      const data = accountingData.value[selectedDate.value][newVal];
      editorAccountingStatus.value = data.type;
      editorIcon.value = data.icon;
      editorTag.value = data.tag;
      editorTitle.value = data.title;
      editorPrice.value = data.price;
    });

    function editorReset() {
      editorAccountingStatus.value = 'expenditure';
      editorTitle.value = '';
      editorTag.value = '娛樂';
      editorPrice.value = null;
      editorIcon.value = 'sports_esports';
    }

    async function closeCheck() {
      // 確認視窗是否關閉，才往下執行
      let times = 0;
      await new Promise((resolve) => {
        const timer = setInterval(() => {
          if (times > 100 || store.state.modalClosed || !store.state.modal) {
            resolve(null);
            clearInterval(timer);
          }
          times += 1;
        }, 1);
      });
      return true;
    }

    watch(status, (newVal: string) => {
      if (newVal === 'add') {
        editorReset();
      }
    });

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
      if (!accountingData.value[selectedDate.value]) {
        accountingData.value[selectedDate.value] = [];
      }
      if (status.value === 'add') {
        accountingData.value[selectedDate.value].splice(0, 0, data);
      } else if (status.value === 'edit') {
        accountingData.value[selectedDate.value][selectedIndex.value] = data;
      }
      store.dispatch('closeModal');
      await closeCheck();
      await store.dispatch('updateAccountingData', {
        key: selectedDate.value,
        data: accountingData.value[selectedDate.value],
      });
      getDayAccountings();
      await store.dispatch('getAccountingData');
      // editorReset();
      return false;
    }

    async function deleteAccounting() {
      store.commit('closeModal');
      await closeCheck();
      accountingData.value[selectedDate.value].splice(selectedIndex.value, 1);
      const data = accountingData.value[selectedDate.value];
      await store.dispatch('updateAccountingData', {
        key: selectedDate.value,
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
      editorAccountingStatus,
      accountingTags,
      editorTag,
      updateAccounting,
      openedFunctionMenu,
      editorPrice,
      editorTitle,
      dayAccountings,
      editorIcon,
      deleteAccounting,
      editorReset,
      delChecker,
    };
  },
});
</script>

<style lang="scss" scoped>
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
.accounting-editor {
  width: 100%;
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
#accountingCRUDModal {
  .modal-body {
    ul {
      width: 100%;
      li {
        display: flex;
        justify-content: space-between;
        font-size: 20px;
        font-weight: 500;
        color: $primary;
        padding: 16px 0;
        border-bottom: 1px solid $primary;
        span {
          &:last-of-type {
            font-weight: bold;
          }
        }
      }
    }
    input {
      height: 52px;
      width: 100%;
      border-radius: 999px;
      border: 2px solid $primary;
      background: transparent;
      text-indent: 20px;
      font-size: 20px;
      font-weight: bold;
      color: $primary;
    }
    .btn-group {
      button {
        &.active {
          background: $primary;
          color: $secondary;
        }

        &:first-child {
          margin-right: 20px;
        }

        width: 170px;
      }

      .cancel-btn {
        &:hover {
          background-color: darken(#9f9684, 10%);
        }

        background-image: linear-gradient();
        background-color: #9f9684;
        color: $secondary;
        border: 0;
        margin-top: 20px;
      }

      .apply-btn {
        &:hover {
          background-position: 0 0;
        }

        background: linear-gradient(
            90deg,
            $primary 0%,
            $primary 50%,
            $secondary 110%
          )
          100% 0 / 200%;
        border: 0;
        color: $secondary;
        margin-top: 20px;
      }

      display: flex;
      justify-content: flex-start;
    }
  }
}
.del-check {
  background-color: $primary;
  width: 100%;
  border-radius: 0 0 20px 20px;
  padding: 20px;
  p {
    color: $secondary;
    font-size: 20px;
  }
  .btn-group {
    width: 100%;
    display: flex;
    button {
      background-color: $secondary;
      width: 50%;
      &:first-child {
        margin-right: 10px;
      }
      &:last-child {
        margin-left: 10px;
      }
    }
  }
}
</style>
