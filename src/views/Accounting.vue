<template>
  <div class="main-wrap accounting-wrap menu-layout" :style="{ height }">
    <Navbar></Navbar>
    <div class="header">
      <div>
        <p>收支狀態</p>
        <div class="hint">
          每天記帳可獲得10~200
          <img src="@/assets/images/currency-reverse.svg" alt="" />
        </div>
      </div>
      <button class="btn-circle" @click="$router.push('/accounting-list')">
        <span class="material-icons">format_list_bulleted</span>
      </button>
    </div>
    <div class="content scroll-bar">
      <div class="timeline">
        <button class="btn" @click="dateChange('prev')">
          <span class="material-icons">west</span>
        </button>
        <input type="text" v-model.number="year" />
        <span>年</span>
        <input type="text" v-model.number="month" />
        <span>月</span>
        <button class="btn" @click="dateChange('next')">
          <span class="material-icons">east</span>
        </button>
      </div>
      <div class="graph-container">
        <div class="graph-status" :class="{ income: type === 'income' }">
          <span>{{ type === "expenditure" ? "支出" : "收入" }}</span>
          <span>{{ amount[type].total }}元</span>
        </div>
        <canvas id="summaryGraph"></canvas>
      </div>
      <div class="graph-type">
        <button @click="type = 'income'" :class="{ active: type === 'income' }">
          收入
        </button>
        <button
          @click="type = 'expenditure'"
          :class="{ active: type === 'expenditure' }"
        >
          支出
        </button>
      </div>
      <ul class="accounting-list w-100">
        <li v-for="item in accrountingTypeData[type]" :key="item">
          <div class="tag">
            <span class="material-icons">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </div>
          <span>{{ amount[type][item.name] }}元</span>
        </li>
      </ul>
      <button
        class="btn btn-secondary"
        id="bookkeepingBtn"
        @click="
          $router.push({ name: 'AccountingList', params: { status: 'add' } })
        "
      >
        開始記帳
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  onUnmounted,
  computed,
  watch,
  nextTick,
} from 'vue';
import Navbar from '@/components/Navbar.vue';
import { useStore } from 'vuex';
import { Chart, registerables } from 'chart.js';
import {
  Accounting,
  Accountings,
  Amount,
} from '@/types';

Chart.register(...registerables);

export default defineComponent({
  name: 'SpendList',
  components: {
    Navbar,
  },
  setup() {
    let chart: Chart<'doughnut', number[], string>|null = null;
    const date = new Date();
    const year = ref(date.getFullYear());
    const month = ref(date.getMonth() + 1);
    const store = useStore();
    const type = ref('expenditure');
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
    const accountingData = ref<Accountings>({});
    const incomeTags = accrountingTypeData.income.map((el) => el.name);
    const expenditureTags = accrountingTypeData.expenditure.map((el) => el.name);
    const incomeAmount = ref<Amount>({
      total: 0,
    });
    const expenditureAmount = ref<Amount>({
      total: 0,
    });

    function getChartData() {
      console.log('chart data');
      let ary: Array<any> = [];
      if (type.value === 'income') {
        incomeTags.forEach((tag) => ary.push(incomeAmount.value[tag]));
      } else {
        expenditureTags.forEach((tag) => ary.push(expenditureAmount.value[tag]));
      }
      let zeroTimes = 0;
      ary = ary.filter((el) => el >= 0);
      ary.forEach((num: number) => {
        if (num === 0) {
          zeroTimes += 1;
        }
      });
      if (ary.length === 0 || zeroTimes === ary.length) {
        ary.push(1);
      }
      console.log(ary);
      return ary;
    }

    function updateChart() {
      if (chart) {
        chart.data.labels = type.value === 'income' ? incomeTags : expenditureTags;
        chart.data.datasets[0].data = getChartData();
        chart.update();
      }
    }

    function updateData() {
      if (accountingData.value) {
        Object.keys(incomeAmount.value).forEach((key) => { incomeAmount.value[key] = 0; });
        Object.keys(expenditureAmount.value).forEach((key) => {
          expenditureAmount.value[key] = 0;
        });
        let keys: Array<string> = Object.keys(accountingData.value);
        keys = keys.filter((str: string) => {
          const strDate = {
            year: Number(str.substr(0, 4)),
            month: Number(str.substr(5, 2)),
          };
          if (year.value === strDate.year && month.value === strDate.month) {
            return true;
          }
          return false;
        });
        incomeTags.forEach((el) => { incomeAmount.value[el] = 0; });
        expenditureTags.forEach(
          (el) => { expenditureAmount.value[el] = 0; },
        );
        keys.forEach((key) => {
          const dayAccounting: Array<Accounting> = accountingData.value[key];
          dayAccounting.forEach((accounting) => {
            if (accounting.type === 'income') {
              incomeAmount.value.total += accounting.price;
              incomeAmount.value[accounting.tag] += accounting.price;
            } else {
              expenditureAmount.value.total += accounting.price;
              expenditureAmount.value[accounting.tag] += accounting.price;
            }
          });
        });
      }
    }

    watch(type, (n, o) => {
      updateChart();
    });

    watch(year, () => {
      updateData();
      updateChart();
    });

    watch(month, () => {
      updateData();
      updateChart();
    });

    onMounted(async () => {
      accountingData.value = await store.dispatch('getAccountingData') || null;
      updateData();
      const data = {
        labels: expenditureTags,
        datasets: [{
          label: 'My First Dataset',
          data: getChartData(),
          backgroundColor: [
            '#FF6759',
            '#F7BB65',
            '#3B3E4A',
            '#93C7C0',
            '#0081BB',
            '#adaaa5',
          ],
          hoverOffset: 0,
          borderColor: '#F8EBCF',
          width: 500,
        }],
      };
      const ctx: HTMLCanvasElement = document.getElementById('summaryGraph') as HTMLCanvasElement;
      chart = new Chart(ctx, {
        type: 'doughnut',
        data,
        options: {
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#F8EBCF',
                padding: 20,
                boxHeight: 24,
                font: {
                  size: 16,
                },
              },
              maxWidth: 400,
            },
          },
        },
      });
    });

    function dateChange(method: string) {
      if (method === 'next') {
        if (month.value >= 12) {
          month.value = 1;
          year.value += 1;
        } else {
          month.value += 1;
        }
      } else if (method === 'prev') {
        if (month.value <= 1) {
          month.value = 12;
          year.value -= 1;
        } else {
          month.value -= 1;
        }
      }
    }

    onUnmounted(() => {
      if (chart) {
        chart.destroy();
      }
    });

    return {
      year,
      month,
      height: computed(() => store.state.height),
      type,
      dateChange,
      accrountingTypeData,
      amount: {
        income: incomeAmount.value,
        expenditure: expenditureAmount.value,
      },
    };
  },
});
</script>

<style lang="scss" scoped>
.accounting-wrap {
  display: flex;
  flex-direction: column;
}
.header {
  img {
    height: 22px;
    width: 22px;
    margin-left: 8px;
  }
  p {
    color: $secondary;
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    text-align: left;
  }
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 24px;
  margin-top: 16px;
  padding: 0 16px;
  width: 100%;
}
.hint {
  font-size: 16px;
  color: $secondary;
  letter-spacing: 2px;
  height: 35px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content {
  .timeline {
    input {
      &:nth-of-type(1) {
        width: 80px;
      }
      &:nth-of-type(2) {
        width: 56px;
      }
      border: 2px solid $primary;
      background: none;
      color: $primary;
      margin: 0 8px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      height: 44px;
    }
    button {
      &:nth-of-type(1) {
        margin-left: 42px;
      }
      &:nth-of-type(2) {
        margin-right: 42px;
      }
      > span {
        color: $primary;
        font-size: 24px;
      }
      align-items: center;
      background: none;
      display: flex;
      justify-content: center;
    }
    > span {
      color: $primary;
      font-size: 20px;
      font-weight: bold;
    }
    align-items: center;
    background-color: $secondary;
    border-radius: 6px;
    display: flex;
    flex-shrink: 0;
    height: 52px;
    justify-content: center;
    margin-bottom: 20px;
    width: 100%;
  }
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 16px;
}
.graph-container {
  max-width: 650px;
  width: 100%;
  position: relative;
}
.graph-status {
  &.income {
    padding-top: 32px;
  }
  span {
    font-size: 28px;
    font-weight: bold;
    color: $secondary;
    line-height: 32px;
  }
  align-items: center;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  margin: auto;
  padding-bottom: 100px;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: all 0.4s ease-in-out;
}
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
  z-index: 99;
}
#summaryGraph {
  position: relative;
  z-index: 2;
}
.graph-type {
  button {
    &.active {
      background: $secondary;
      color: $primary;
    }
    background: none;
    color: $secondary;
    height: 44px;
    font-size: 20px;
    font-weight: bold;
    flex-grow: 1;
    transition: all 0.2s ease-in-out;
  }
  border-radius: 6px;
  border: 2px solid $secondary;
  display: flex;
  margin-top: 20px;
  min-width: 376px;
}
.accounting-list {
  li {
    .tag {
      span:not(.material-icons) {
        font-size: 20px;
        font-weight: bold;
        margin: 0;
      }
      span {
        color: $primary;
        font-size: 28px;
        margin-right: 8px;
      }
      align-items: center;
      background-color: $secondary;
      border-radius: 6px;
      display: flex;
      height: 52px;
      justify-content: center;
      width: 107px;
    }
    > span {
      color: $secondary;
      font-weight: bold;
      font-size: 28px;
    }
    height: 92px;
    border-bottom: 2px solid $secondary;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  max-width: 800px;
}
</style>
