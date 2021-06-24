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
    <button
      class="btn btn-secondary"
      id="bookkeepingBtn"
      @click="editorStatus = 'add'"
    >
      開始記帳
    </button>
    <div
      class="accounting-editor slide-up-window"
      :class="{ active: editorStatus }"
    >
      <p>{{ editorStatus === "add" ? "新增收支" : "編輯收支" }}</p>
      <div class="accounting-status">
        <button
          @click="editorAccountingStatus = 'income'"
          :class="{ active: editorAccountingStatus === 'income' }"
        >
          收入
        </button>
        <button
          @click="editorAccountingStatus = 'expenditure'"
          :class="{ active: editorAccountingStatus === 'expenditure' }"
        >
          支出
        </button>
      </div>
      <hr />
      <div class="type-group">
        <button
          class="btn btn-circle type-btn"
          v-for="item in accrountingTypeData[editorAccountingStatus]"
          @click.stop="editorAccountingType = item.name"
          :key="item"
          :class="{ active : editorAccountingType === item.name }"
        >
          <span class="material-icons">{{ item.icon }}</span>
          {{ item.name }}
        </button>
      </div>
      <hr />
      <input type="text" placeholder="名稱" />
      <div class="money">
        <span>元</span>
        <input type="text" placeholder="金額" />
      </div>
      <hr />
      <div class="btn-group status-group">
        <button class="btn-rectangle cancel-btn" @click="filterReset">
          取消
        </button>
        <button class="btn-rectangle apply-btn" @click="filterApply">
          套用
        </button>
      </div>
    </div>
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
    const editorStatus = ref(false);
    const editorAccountingStatus = ref('expenditure');
    const accrountingTypeData = {
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
    const editorAccountingType = ref('娛樂');

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

    watch(editorAccountingType, () => {
      console.log(editorAccountingType.value);
    });

    return {
      date,
      modelConfig: {
        type: 'string',
        mask: 'YYYY年MM月DD日', // Uses 'iso' if missing
      },
      height: computed(() => store.state.height),
      isDatePickerOpen,
      editorStatus,
      editorAccountingStatus,
      accrountingTypeData,
      editorAccountingType,
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
  .type-group {
    .type-btn {
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
      width: 110px;
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
  bottom: 0;
  height: 526px;
}
</style>
