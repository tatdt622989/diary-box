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
          <h5 class="modal-title" id="accountingTypeModalLabel">{{ month }}月{{ type }}明細</h5>
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
  props: ['data', 'month', 'type'],
  setup(props) {
    return {
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
