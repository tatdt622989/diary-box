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
        <div class="graph-status">
          <span>{{ type === "expenditure" ? "支出" : "收入" }}</span>
          <span>$99999</span>
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
        <li>
          <div class="tag">
            <span class="material-icons">sports_esports</span>
            <span>娛樂</span>
          </div>
          <span>{{ "-$2000" }}</span>
        </li>
        <li>
          <div class="tag">
            <span class="material-icons">restaurant</span>
            <span>飲食</span>
          </div>
          <span>{{ "-$2000" }}</span>
        </li>
        <li>
          <div class="tag">
            <span class="material-icons">commute</span>
            <span>交通</span>
          </div>
          <span>{{ "-$2000" }}</span>
        </li>
        <li>
          <div class="tag">
            <span class="material-icons">category</span>
            <span>生活</span>
          </div>
          <span>{{ "-$2000" }}</span>
        </li>
        <li>
          <div class="tag">
            <span class="material-icons">local_hospital</span>
            <span>醫療</span>
          </div>
          <span>{{ "-$2000" }}</span>
        </li>
        <li>
          <div class="tag">
            <span class="material-icons">more</span>
            <span>其他</span>
          </div>
          <span>{{ "-$2000" }}</span>
        </li>
      </ul>
      <button class="btn btn-secondary" id="bookkeepingBtn">開始記帳</button>
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
} from 'vue';
import Navbar from '@/components/Navbar.vue';
import { useStore } from 'vuex';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default defineComponent({
  name: 'SpendList',
  components: {
    Navbar,
  },
  setup() {
    const date = new Date();
    const year = ref(date.getFullYear());
    const month = ref(date.getMonth() + 1);
    const store = useStore();
    const type = ref('income');

    onMounted(() => {
      const data = {
        labels: [
          '娛樂',
          '飲食',
          '交通',
          '生活',
          '醫療',
          '其他',
        ],
        datasets: [{
          label: 'My First Dataset',
          data: [300, 50, 100, 70, 30, 60],
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
      const ctx = document.getElementById('summaryGraph');
      const myChart = new Chart(ctx, {
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

    function dateChange(method) {
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

    return {
      year,
      month,
      height: computed(() => store.state.height),
      type,
      dateChange,
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
    >span {
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
