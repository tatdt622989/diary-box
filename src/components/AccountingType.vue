<template>
  <div
    class="modal fade"
    id="accountingTypeModal"
    tabindex="-1"
    aria-labelledby="accountingTypeModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="accountingTypeModalLabel">{{ title }}</h5>
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
          <ul>
            <li v-for="(obj, i) in data" :key="`t-${i}`">
              <span>{{ obj.title }}</span>
              <span>{{ obj.price }}元</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Accounting } from '@/types';
import {
  ref,
  reactive,
  defineComponent,
  onMounted,
  computed,
  watch,
  onUnmounted,
  nextTick,
  toRefs,
} from 'vue';

export default defineComponent({
  name: 'AccountingType',
  props: ['data', 'month', 'type', 'dateType', 'year'],
  setup(props) {
    const title = computed(() => {
      if (props.dateType === 'month') {
        return `${props.month}月${props.type}明細`;
      }
      return `${props.year}年${props.type}明細`;
    });
    return {
      title,
    };
  },
});
</script>

<style lang="scss">
  #accountingTypeModal {
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
    }
  }
</style>
