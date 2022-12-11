<template>
  <div class="main-wrap accounting-wrap menu-layout" :style="{ height }">
    <div class="header">
      <div class="btnBox">
        <button class="btn-circle" @click="$router.push('/home')">
          <span class="material-icons">arrow_back</span>
        </button>
        <!-- <button
          class="btn-circle"
          @click.stop="isDatePickerOpen = !isDatePickerOpen"
        >
          <span class="material-icons">edit_calendar</span>
        </button> -->
      </div>
      <p>收支狀態</p>
      <div class="hint">
        每天記帳可獲得10~200
        <img src="@/assets/images/currency-reverse.svg" alt="" />
      </div>
      <div class="tags">
        <button
          :class="{ active: dateType === 'year' }"
          class="btn btn-circle"
          @click="dateType = 'year'"
        >
          年
        </button>
        <button
          :class="{ active: dateType === 'month' }"
          class="btn btn-circle"
          @click="dateType = 'month'"
        >
          月
        </button>
        <button
          :class="{ active: dateType === 'day' }"
          class="btn btn-circle"
          @click="dateType = 'day'"
        >
          日
        </button>
      </div>
      <div class="current-date">
        <!-- <div class="year">
          <input type="text" v-model="year" />
        </div>
        <span v-if="dateType !== 'year'">.</span>
        <div
          class="month"
          :class="{ active: dateType === 'month' || dateType === 'day' }"
        >
          <input type="text" v-model="month" />
        </div>
        <span v-if="dateType === 'day'">.</span>
        <div class="day" :class="{ active: dateType === 'day' }">
          <input type="text" v-model="day" />
        </div> -->
        <Datepicker v-model="currentDate" :locale="zhTW"  />
      </div>
    </div>
    <div class="content">
      <div
        class="graph-container"
        :class="{ year: dateType === 'year', day: dateType === 'day' }"
      >
        <canvas id="summaryGraph"></canvas>
        <div class="graph-status" :class="{ income: type === 'income' }">
          <span>
            {{ type === "expenditure" ? "總支出" : "總收入" }}
            {{ dateType === "year" || dateType === "day" ? "\xa0" : "" }}
          </span>
          <span
            >{{ total }}&nbsp;元</span
          >
        </div>
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
      <ul class="accounting-list w-100 scroll-bar"  :class="{ day: dateType === 'day' }">
        <li
          v-for="(item, i) in dateType === 'day'
            ? accountingInfo[type]
            : accountingTypeData[type]"
          :key="item"
          @click="openAccountingTypeModal(item.name, i)"
        >
          <div class="left">
            <button class="tag">
              <div
                class="circle"
                :style="{
                  backgroundColor:
                    dateType === 'day' ? getColor(item.tag) : item.bgc,
                }"
              >
                <span class="material-icons">
                  {{ item.icon }}
                </span>
              </div>
              <span :style="{ color: item.color }">{{ item.name }}</span>
            </button>
            <span v-if="dateType === 'day'">
              {{ item.title }}
            </span>
          </div>
          <span>
            {{
              type === "expenditure" && dateType !== "day"
                ? expenditureAmount[item.name]
                : incomeAmount[item.name]
            }}
            {{ dateType === "day" ? item.price : "" }}&nbsp;元
            </span>
          <button class="more-btn">
            <span class="material-icons">chevron_right</span>
          </button>
        </li>
      </ul>
      <button
        class="btn btn-secondary"
        id="bookkeepingBtn"
        @click.stop="openEditorModal('add')"
      >
        開始記帳
      </button>
    </div>
    <AccountingType
      :data="modalData"
      :month="month"
      :year="year"
      :dateType="dateType"
      :type="selectedTag"
    ></AccountingType>
    <AccountingCRUD
      :status="editorStatus"
      :selectedIndex="selectedIndex"
      :selectedDate="selectedDate"
      @update="updateData"
    ></AccountingCRUD>
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  computed,
  watch,
  nextTick,
} from 'vue';
import AccountingCRUD from '@/components/AccountingCRUD.vue';
import AccountingType from '@/components/AccountingType.vue';
import { useStore } from 'vuex';
import { Chart, registerables } from 'chart.js';
import Datepicker from 'vue3-datepicker';
import { zhTW } from 'date-fns/locale';

import {
  Accounting,
  Accountings,
  Amount,
} from '@/types';

Chart.register(...registerables);

export default defineComponent({
  name: 'Accounting',
  components: {
    AccountingCRUD,
    AccountingType,
    Datepicker,
  },
  setup() {
    let chart: Chart<'doughnut', number[], string>|Chart<'line', number[], string>|null = null;
    const date = new Date();
    const year = ref(date.getFullYear());
    const month = ref(date.getMonth() + 1);
    const day = ref(date.getDate());
    const store = useStore();
    const type = ref('expenditure');
    const dateType = ref('month');
    const currentDate = ref(date);
    const accountingTypeData = ref<any>({
      expenditure: [{
        name: '娛樂',
        icon: 'sports_esports',
        bgc: '#e8574a',
      }, {
        name: '飲食',
        icon: 'restaurant',
        bgc: '#e49e57',
        // color: '#383838',
      }, {
        name: '交通',
        icon: 'commute',
        bgc: '#3B3E4A',
      }, {
        name: '生活',
        icon: 'category',
        bgc: '#4a5e8c',
        // color: '#383838',
      }, {
        name: '醫療',
        icon: 'local_hospital',
        bgc: '#337ba5',
      }, {
        name: '其他',
        icon: 'more',
        bgc: '#2c8049',
      }],
      income: [{
        name: '薪資',
        icon: 'attach_money',
        bgc: '#e8574a',
      }, {
        name: '理財',
        icon: 'insert_chart_outlined',
        bgc: '#e49e57',
        // color: '#383838',
      }, {
        name: '其他',
        icon: 'more',
        bgc: '#2c8049',
        // color: '#383838',
      }],
    });
    const accountingData = ref<Accountings>({});
    let incomeTags: any;
    let expenditureTags: any;
    const incomeAmount = ref<Amount>({
      total: 0,
    });
    const expenditureAmount = ref<Amount>({
      total: 0,
    });
    const selectedTag = ref<string>();
    const modalData = ref<Array<any>>([]);
    // const isDatePickerOpen = ref(false);
    const accountingInfo = ref<any>({
      expenditure: [],
      income: [],
    });
    const editorStatus = ref<string | boolean>(false);
    const selectedIndex = ref<number | null>(null);
    const selectedDate = ref<string | null>(null);
    const total = ref<number>(0);

    function getChartData() {
      let ary: Array<any> = [];
      if (dateType.value === 'month') {
        if (type.value === 'income') {
          incomeTags.forEach((tag: string) => ary.push(incomeAmount.value[tag]));
        } else {
          expenditureTags.forEach((tag: string) => ary.push(expenditureAmount.value[tag]));
        }
      }
      if (dateType.value === 'year') {
        if (type.value === 'income') {
          Object.keys(incomeAmount.value).forEach((key: string) => {
            ary[Number(key.slice(0, -1))] = incomeAmount.value[key];
          });
        } else {
          Object.keys(expenditureAmount.value).forEach((key, i) => {
            ary[Number(key.slice(0, -1))] = expenditureAmount.value[key];
          });
        }
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
      return ary;
    }

    function getZero(num: number) {
      if (num < 10) {
        return `0${num}`;
      }
      return num;
    }

    function updateData() {
      // console.log('update data');
      if (dateType.value === 'year' || dateType.value === 'month') {
        incomeTags = accountingTypeData.value.income.map((el: any) => el.name);
        expenditureTags = accountingTypeData.value.expenditure.map((el: any) => el.name);
        expenditureAmount.value = {};
        incomeAmount.value = {};
        accountingTypeData.value.income.forEach((el: any) => {
          incomeAmount.value[el.name] = 0;
        });
        accountingTypeData.value.expenditure.forEach((el: any) => {
          expenditureAmount.value[el.name] = 0;
        });
      }
      if (dateType.value === 'year') {
        let i = 0;
        while (i < 12) {
          incomeAmount.value[`${i + 1}月`] = 0;
          expenditureAmount.value[`${i + 1}月`] = 0;
          i += 1;
        }
      }
      if (dateType.value === 'day') {
        accountingInfo.value = {
          expenditure: [],
          income: [],
        };
      }
      if (accountingData.value) {
        const keys: Array<string> = Object.keys(accountingData.value);
        const len = keys.length;
        total.value = 0;
        let i = 0;
        while (i < len) {
          const str = keys[i];
          const strDate = {
            year: Number(str.substr(0, 4)),
            month: Number(str.substr(5, 2)),
            day: Number(str.substr(8, 2)),
          };
          if (dateType.value === 'year' && Number(year.value) === strDate.year) {
            const dayAccounting: Array<Accounting> = accountingData.value[str];
            dayAccounting.forEach((accounting) => {
              if (accounting.type === 'income' && type.value === 'income') {
                total.value += accounting.price;
                incomeAmount.value[`${strDate.month}月`] += accounting.price;
                incomeAmount.value[accounting.tag] += accounting.price;
              }
              if (accounting.type === 'expenditure' && type.value === 'expenditure') {
                total.value += accounting.price;
                expenditureAmount.value[`${strDate.month}月`] += accounting.price;
                expenditureAmount.value[accounting.tag] += accounting.price;
              }
            });
          }
          if (dateType.value === 'month'
            && Number(year.value) === strDate.year
            && Number(month.value) === strDate.month) {
            const dayAccounting: Array<Accounting> = accountingData.value[str];
            dayAccounting.forEach((accounting) => {
              if (accounting.type === 'income' && type.value === 'income') {
                total.value += accounting.price;
                incomeAmount.value[accounting.tag] += accounting.price;
              }
              if (accounting.type === 'expenditure' && type.value === 'expenditure') {
                total.value += accounting.price;
                expenditureAmount.value[accounting.tag] += accounting.price;
              }
            });
          }
          if (dateType.value === 'day') {
            if (Number(year.value) === strDate.year
              && Number(month.value) === strDate.month
              && Number(day.value) === strDate.day) {
              const dayAccounting: Array<Accounting> = accountingData.value[str];
              dayAccounting.forEach((accounting) => {
                accountingInfo.value[accounting.type].push(accounting);
                if (accounting.type === 'income' && type.value === 'income') {
                  total.value += accounting.price;
                }
                if (accounting.type === 'expenditure' && type.value === 'expenditure') {
                  total.value += accounting.price;
                }
              });
              selectedDate.value = str;
              break;
            } else {
              selectedDate.value = null;
            }
          }
          i += 1;
        }
        if (!selectedDate.value) {
          selectedDate.value = `${year.value}年${getZero(month.value)}月${getZero(day.value)}日`;
        }
      }
    }

    function getChart() {
      updateData();
      const ctx: HTMLCanvasElement = document.getElementById('summaryGraph') as HTMLCanvasElement;
      let data: any = {};
      if (dateType.value === 'month') {
        data = {
          labels: type.value === 'income' ? incomeTags : expenditureTags,
          datasets: [{
            data: getChartData(),
            backgroundColor: [
              '#e8574a',
              '#e49e57',
              '#3B3E4A',
              '#4a5e8c',
              '#337ba5',
              '#2c8049',
            ],
            hoverOffset: 0,
            borderColor: '#F8EBCF',
            width: 500,
          }],
        };
        chart = new Chart(ctx, {
          type: 'doughnut',
          data,
          options: {
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      } else if (dateType.value === 'year') {
        data = {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          datasets: [{
            data: getChartData(),
            backgroundColor: '#F8EBCF',
            hoverOffset: 0,
            borderColor: '#F8EBCF',
            width: 500,
            cubicInterpolationMode: 'monotone',
          }],
        };
        Chart.defaults.color = '#F8EBCF';
        chart = new Chart(ctx, {
          type: 'line',
          data,
          options: {
            scales: {
              y: {
                grid: {
                  color: '#f8ebcf5e',
                },
              },
              x: {
                grid: {
                  color: '#f8ebcf5e',
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      }
    }

    watch(type, (n, o) => {
      if (chart) {
        chart.destroy();
        updateData();
        getChart();
      }
    });

    watch(currentDate, (n) => {
      const inputDate = new Date(n);
      year.value = Number(inputDate.getFullYear());
      month.value = Number((inputDate.getMonth() + 1).toString());
      day.value = Number(inputDate.getDate().toString());
      updateData();
      getChartData();
    });

    // watch([year, month, day], () => {
    //   updateData();
    //   getChartData();
    // });

    watch(dateType, () => {
      if (chart) {
        chart.destroy();
        getChart();
      }
    });

    onMounted(async () => {
      if (!store.state.userData.accountingData
        || Object.keys(store.state.userData.accountingData).length === 0) {
        await store.dispatch('getAccountingData');
      }
      accountingData.value = store.state.userData.accountingData || null;
      getChart();
    });

    function openEditorModal(status: string) {
      editorStatus.value = status;
      store.dispatch('openModal', {
        type: 'accountingCRUD',
        asynchronous: false,
      });
    }

    function openAccountingTypeModal(tagName: string, index: number) {
      if (dateType.value === 'day') {
        selectedIndex.value = index;
        openEditorModal('edit');
        return;
      }
      modalData.value = [];
      selectedTag.value = tagName;
      const dates: Array<string> = Object.keys(accountingData.value);
      let i = 0;
      if (dateType.value === 'year') {
        while (i < 12) {
          modalData.value.push({
            price: 0,
            title: `${i + 1}月`,
          });
          i += 1;
        }
      }
      dates.forEach((dateStr: string) => {
        const str = {
          year: Number(dateStr.substr(0, 4)),
          month: Number(dateStr.substr(5, 2)),
          day: Number(dateStr.substr(8, 2)),
        };
        i = 0;
        if (dateType.value === 'month') {
          while (i < accountingData.value[dateStr].length) {
            if (str.month === month.value
              && accountingData.value[dateStr][i].tag === selectedTag.value) {
              modalData.value.push({
                price: accountingData.value[dateStr][i].price,
                title: accountingData.value[dateStr][i].title,
              });
            }
            i += 1;
          }
        }
        if (dateType.value === 'year') {
          if (str.year === year.value) {
            i = 0;
            while (i < accountingData.value[dateStr].length) {
              if (accountingData.value[dateStr][i].tag === selectedTag.value) {
                modalData.value[str.month].price += accountingData.value[dateStr][i].price;
              }
              i += 1;
            }
          }
        }
      });
      store.dispatch('openModal', {
        type: 'accountingType',
        asynchronous: false,
      });
    }

    function getColor(key: string) {
      let res;
      accountingTypeData.value[type.value].forEach((el: any) => {
        if (key === el.name) {
          res = el.bgc;
        }
      });
      return res;
    }

    onBeforeUnmount(() => {
      if (chart) {
        chart.destroy();
      }
    });

    return {
      year,
      month,
      height: computed(() => store.state.height),
      type,
      accountingTypeData,
      incomeAmount,
      expenditureAmount,
      openAccountingTypeModal,
      selectedTag,
      modalData,
      day,
      dateType,
      // isDatePickerOpen,
      currentDate,
      accountingData,
      openEditorModal,
      getColor,
      accountingInfo,
      editorStatus,
      selectedIndex,
      selectedDate,
      total,
      updateData,
      zhTW,
    };
  },
});
</script>

<style lang="scss">

.btnBox {
  display: flex;
  width: 100%;
  justify-content: space-between;
  position: relative;
  .vc-container {
    position: absolute;
    right: 0;
    top: 60px;
    z-index: 999;
  }
}
.accounting-wrap {
  display: flex;
  flex-direction: column;
  padding-top: 0;
  overflow: auto;
}
.header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  flex-direction: column;
  // margin-bottom: 20px;
  margin-top: 16px;
  padding: 0 16px;
  width: 100%;
  img {
    height: 22px;
    width: 22px;
    margin-left: 8px;
  }
  .current-date {
    display: flex;
    font-family: "Poppins", sans-serif;
    justify-content: center;
    width: 100%;
    max-width: 400px;
    color: $secondary;
    margin-bottom: 16px;
    // padding: 0 24px;
    // border-bottom: 2px solid rgba($secondary, 50%);
    // .year {
    //   width: 109px;
    //   // flex-grow: 2;
    //   margin-right: 16px;
    //   flex-shrink: 0;
    //   input {
    //     border-color: $secondary;
    //     color: $secondary;
    //   }
    // }
    // .month {
    //   width: 68px;
    //   // flex-grow: 1;
    //   max-width: 26%;
    //   margin-right: 16px;
    //   flex-shrink: 0;
    //   &.active {
    //     input {
    //       border-color: $secondary;
    //       color: $secondary;
    //     }
    //   }
    // }
    // .day {
    //   width: 68px;
    //   // flex-grow: 1;
    //   max-width: 26%;
    //   flex-shrink: 0;
    //   &.active {
    //     input {
    //       border-color: $secondary;
    //       color: $secondary;
    //     }
    //   }
    // }
    span {
      // font-size: 32px;
      // // width: 12px;
      // padding: 0 8px;
      // flex-shrink: 0;
      // display: none;
    }
    input {
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 1px;
      background: transparent;
      color: rgba($secondary, 50%);
      border-radius: 16px;
      border: 2px solid rgba($secondary, 50%);
      width: 100%;
      text-align: center;
      height: 52px;
    }
    // .active {
    //   input {
    //     background-color: rgba($secondary, .5);
    //     // color: $primary;
    //   }
    // }
  }
  p {
    color: $secondary;
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    text-align: center;
    width: 100%;
  }
  .tags {
    display: flex;
    // width: 100%;
    // max-width: 400px;
    margin: 10px 0;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: 24px;
    margin-bottom: 16px;
    // padding-bottom: 16px;
    // margin-bottom: 14px;
    // &:before {
    //   content: "";
    //   width: 100%;
    //   height: 2px;
    //   background-color: rgba(#f8ebcf, 50%);
    //   position: absolute;
    //   bottom: 0;
    // }
    span {
      color: $secondary;
      font-size: 20px;
      font-weight: bold;
      margin-right: 12px;
    }
    button {
      color: rgba($secondary, 80%);
      font-size: 22px;
      font-weight: bold;
      background-color: rgba($secondary, 30%);
      // border: 2px solid $secondary;
      width: 52px;
      height: 52px;
      margin: 0 8px;
      border-radius: 16px;
      &.active {
        color: $primary;
        background-color: $secondary;
      }
    }
    select {
      width: 148px;
      background: $primary;
      height: 52px;
      border: 2px solid $secondary;
      border-radius: 20px;
      color: $secondary;
      text-align: center;
      font-size: 28px;
      font-weight: bold;
    }
    // .item {
    //   padding: 0 5px;
    //   button {
    //     height: 44px;
    //     padding: 0 20px;
    //     background: none;
    //     border-radius: 999px;
    //     border: 2px solid $secondary;
    //     color: $secondary;
    //     font-size: 20px;
    //     font-weight: bold;
    //     transition: all 0.3 ease-out;
    //     &.active {
    //       background-color: $secondary;
    //       color: $primary;
    //     }
    //   }
    // }
  }
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
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  padding-top: 14px;
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
    border-radius: 26px;
    display: flex;
    flex-shrink: 0;
    height: 52px;
    justify-content: center;
    margin-bottom: 20px;
    width: 100%;
  }
}
.graph-container {
  max-width: 650px;
  width: 100%;
  position: relative;
  &.year,
  &.day {
    flex-direction: column;
    .graph-status {
      position: static;
      flex-direction: row;
      margin-bottom: 14px;
    }
  }
  &.year {
    background-color: rgba($secondary, 30%);
    border-radius: 16px;
    padding: 16px 10px;
    padding-top: 24px;
    .graph-status {
      height: 52px;
      border-radius: 16px;
      width: 100%;
      margin-top: 16px;
      margin-bottom: 0;
      span {
        color: $secondary;
      }
    }
    #summaryGraph {
      // background-color: rgba($secondary, 30%);
      // border-radius: 16px;
      // padding: 10px;
    }
  }
  &.day {
    .graph-status {
      span {
        font-size: 36px;
        line-height: 1.2;
      }
      margin-bottom: 0;
    }
    #summaryGraph {
      display: none;
    }
  }
}
.graph-status {
  span {
    font-size: 28px;
    font-weight: bold;
    color: $secondary;
    line-height: 36px;
    font-family: "Poppins", sans-serif;
    letter-spacing: 0.8px;
  }
  align-items: center;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  margin: auto;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: all 0.4s ease-in-out;
}
#bookkeepingBtn {
  border-radius: 20px;
  bottom: 23px;
  color: $primary;
  font-size: 20px;
  font-weight: bold;
  height: 52px;
  padding: 0 24px;
  position: sticky;
  right: 16px;
  box-shadow: 4px 0px 16px rgba(68, 153, 102, 0.7);
  z-index: 99;
  display: block;
  margin-left: auto;
}
#summaryGraph {
  position: relative;
  z-index: 2;
}
.graph-type {
  border-radius: 16px;
  border: 2px solid $secondary;
  display: flex;
  width: 100%;
  max-width: 400px;
  margin: 32px;
  box-sizing: border-box;
  margin-bottom: 12px;
  button {
    &.active {
      background: $secondary;
      color: $primary;
    }
    background: none;
    color: $secondary;
    height: 48px;
    font-size: 20px;
    font-weight: bold;
    flex-grow: 1;
    transition: all 0.2s ease-in-out;
    border-radius: 14px;
  }
}
.accounting-list {
  .left {
    display: flex;
    align-items: center;
    flex-grow: 1;
    span {
      font-size: 24px;
      color: $secondary;
      // font-weight: bold;
    }
  }
  li {
    position: relative;
    height: 92px;
    border-bottom: 2px solid $secondary;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .tag {
      // border: 1px solid $secondary;
      align-items: center;
      background-color: transparent;
      border-radius: 999px;
      cursor: pointer;
      display: flex;
      height: 44px;
      justify-content: center;
      transition: all 0.3s ease-out;
      .circle {
        height: 48px;
        width: 48px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid $secondary;
        background-color: $secondary;
        margin-right: 16px;
      }
      & + span {
        font-family: "Poppins", sans-serif;
        letter-spacing: 0.8px;
        font-size: 20px;
        flex-grow: 1;
        overflow:hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: left;
      }
      span:not(.material-icons) {
        font-size: 20px;
        font-weight: bold;
        margin: 0;
      }
      span {
        color: $secondary;
        font-size: 28px;
        // margin-right: 8px;
      }
      &:hover,
      &:active {
        // background-color: $tertiary;
      }
    }
    > span {
      color: $secondary;
      font-weight: bold;
      font-size: 24px;
      text-align: right;
    }
    .more-btn {
      width: 44px;
      height: 44px;
      background: none;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        color: $secondary;
      }
    }
  }
  cursor: pointer;
  max-width: 800px;
  padding-bottom: 40px;
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
.v3dp__popout {
  left: 50%;
  transform: translateX(-50%);
}
</style>
