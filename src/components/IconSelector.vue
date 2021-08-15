<template>
  <div
    class="modal fade"
    id="iconSelectorModal"
    tabindex="-1"
    aria-labelledby="iconSelectorModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="iconSelectorModalLabel">請選擇貼圖</h5>
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
          <div class="search-wrap w-100">
            <button class="btn btn-circle">
              <span class="material-icons">search</span>
            </button>
            <input type="search" @input="iconFilter" v-model="keyWord" />
          </div>
          <div class="items-wrap w-100 scroll-bar">
            <button
              class="item"
              v-for="item in displayFontIcon"
              :key="item"
              @click="selectedIcon === item ? selectedIcon = '' : selectedIcon = item"
              :class="{ active : item === selectedIcon }"
            >
              <span class="material-icons">{{ item }}</span>
              <span class="ellipsis">{{ item }}</span>
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            取消
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="$emit('apply-icon', selectedIcon)"
            data-bs-dismiss="modal"
            :disabled="!selectedIcon"
          >
            套用
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  onMounted,
} from 'vue';

export default defineComponent({
  name: 'IconSelector',
  setup() {
    const imgIcon = [];
    const fontIconList = [
      'layers', 'directions_walk', 'local_hospital', 'park', 'pin_drop', 'local_library',
      'celebration', 'lunch_dining', 'local_atm', 'directions_bike', 'delivery_dining',
      'local_activity', 'local_cafe', 'person_pin', 'design_services', 'rate_review',
      'miscellaneous_services', 'directions_car_filled', 'local_grocery_store', 'directions_bus',
      'local_police', 'fastfood', 'local_phone', 'home_repair_service', 'zoom_out_map', 'hotel',
      'flight', 'near_me', 'directions_run', 'handyman', 'restaurant_menu', 'medical_services',
      'directions_car', 'volunteer_activism', 'local_fire_department', 'my_location', 'local_mall',
      'local_shipping', 'place', 'menu_book', 'local_offer', 'map', 'category', 'badge',
      'sensor_window', 'sensor_door', 'bedroom_child', 'living', 'door_sliding', 'restaurant',
      'doorbell', 'camera_outdoor', 'door_back', 'chair_alt', 'bedroom_baby', 'bedroom_parent',
      'bathroom', 'camera_indoor', 'blender', 'coffee_maker', 'flatware', 'dining', 'garage',
      'light', 'door_front', 'window', 'coffee', 'yard', 'shower', 'chair', 'bed', 'manage_search',
      'feed', 'no_backpack', 'no_stroller', 'no_cell', 'no_flash', 'no_drinks', 'stroller', 'dry',
      'no_meeting_room', 'do_not_step', 'escalator', 'tty', 'chalet', 'bento', 'wheelchair_pickup',
      'iron', 'no_food', 'fence', 'houseboat', 'bungalow', 'balcony', 'do_not_touch', 'crib',
      'smoke_free', 'rice_bowl', 'tapas', 'umbrella', 'rv_hookup', 'carpenter', 'baby_changing_station',
      'charging_station', 'soap', 'hot_tub', 'fire_extinguisher', 'water_damage', 'smoking_rooms',
      'elevator', 'cabin', 'countertops', 'no_photography', 'backpack', 'house_siding', 'wash',
      'microwave', 'stairs', 'golf_course', 'night_shelter', 'villa', 'food_bank', 'foundation',
      'bathtub', 'gite', 'child_friendly', 'escalator_warning', 'free_breakfast', 'room_preferences',
      'sports_bar', 'room_service', 'roofing', 'casino', 'holiday_village', 'kitchen', 'pool',
      'beach_access', 'child_care', 'airport_shuttle', 'all_inclusive', 'grass', 'checkroom',
      'other_houses', 'family_restroom', 'ac_unit', 'cottage', 'corporate_fare', 'meeting_room',
      'house', 'spa', 'business_center', 'fitness_center', 'apartment', 'storefront', 'wifi_tethering',
      'hdr_off_select', 'hdr_auto_select', 'nearby_off', 'signal_wifi_statusbar_4_bar', 'data_usage',
      'hdr_on_select', 'signal_cellular_no_sim', 'access_time_filled', 'fmd_bad', 'developer_mode',
      'timer_3_select', 'screen_lock_landscape', 'usb_off', 'flashlight_on', 'network_wifi',
      'timer_10_select', 'edgesensor_low', 'screen_lock_rotation', 'splitscreen', 'mode_night',
      'grid_goldenratio', 'mobile_off', 'rsvp', 'signal_cellular_nodata', 'signal_cellular_null',
      '60fps', 'signal_cellular_off', 'location_disabled', 'airplanemode_active', 'gpp_bad',
      'wifi_tethering_off', '30fps', 'add_alarm', 'battery_alert', 'lens_blur', 'signal_cellular_4_bar',
      'signal_cellular_connected_no_internet_0_bar', 'edgesensor_high', 'system_security_update_warning',
      'security_update_warning', 'signal_wifi_4_bar_lock', 'system_security_update', 'wallpaper',
      'signal_cellular_connected_no_internet_4_bar', 'airplanemode_inactive', 'nearby_error',
      'screen_lock_portrait', 'brightness_auto', 'flashlight_off', 'do_not_disturb_on_total_silence',
      'reset_tv', 'wifi_tethering_error_rounded', 'signal_wifi_statusbar_null', 'sd_storage',
      'flourescent', 'grid_3x3', 'access_alarm', 'gps_off', 'add_to_home_screen', 'airplane_ticket',
      'wifi_lock', 'security_update', 'signal_cellular_0_bar', 'signal_wifi_connected_no_internet_4',
      'wifi_calling_3', 'settings_system_daydream', 'signal_wifi_bad', 'access_alarms', 'aod',
      'battery_unknown', 'security_update_good', 'signal_wifi_off', 'bloodtype', 'battery_std',
      'hdr_auto', 'ad_units', 'brightness_medium', 'grid_4x4', 'radar', 'shortcut', 'cable',
      'data_saver_on', 'brightness_low', 'screenshot', 'mode_standby', 'data_saver_off', 'network_cell',
      'battery_saver', 'play_lesson', 'signal_wifi_0_bar', 'storm', 'brightness_high', 'pattern',
      'system_security_update_good', 'signal_wifi_statusbar_connected_no_internet_4', 'monitor_weight',
      'remember_me', 'gps_not_fixed', 'screen_rotation', 'screen_search_desktop', 'location_searching',
      'sim_card_download', 'mobile_friendly', 'send_to_mobile', 'device_thermostat', 'cameraswitch',
      'gpp_maybe', 'share_location', 'nightlight', 'water', 'dvr', 'sports_score', 'access_time',
      'graphic_eq', 'fmd_good', 'air', 'note_alt', 'reviews', 'tungsten', 'gpp_good', 'devices',
      'battery_charging_full', 'price_change', 'pin', 'medication', 'price_check', 'gps_fixed',
      'credit_score', 'thermostat', 'battery_full', 'storage', 'widgets', 'quiz', 'settings_suggest',
      'signal_cellular_alt', 'sell', 'summarize', 'password', 'task', 'dark_mode', 'restart_alt',
      'light_mode',
    ];
    const displayFontIcon = ref<Array<string>>([]);
    const selectedIcon = ref<string>('');
    const keyWord = ref<string>('');

    function iconFilter() {
      if (keyWord.value) {
        displayFontIcon.value = fontIconList.filter((el) => el.search(keyWord.value) >= 0);
      } else {
        displayFontIcon.value = fontIconList;
      }
    }

    onMounted(() => {
      displayFontIcon.value = fontIconList;
    });

    return {
      fontIconList,
      selectedIcon,
      displayFontIcon,
      iconFilter,
      keyWord,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/mixins/mixins.scss";

#iconSelectorModal {
  .modal-dialog {
    max-width: 600px;
  }
  .modal-body {
    .search-wrap {
      button {
        span {
          color: $secondary;
        }
        background-color: $primary;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 0;
        border-radius: 0 99px 99px 0;
        width: 80px;
      }
      input {
        background: none;
        border-radius: 999px;
        border: 2px solid $primary;
        color: $primary;
        font-size: 24px;
        height: 52px;
        padding: 0 80px 0 16px;
        width: 100%;
      }
      margin-bottom: 16px;
      position: relative;
    }
    .items-wrap {
      &.scroll-bar {
        &::-webkit-scrollbar-button {
          background-color: $secondary;
        }
      }
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      margin: 0 -6px;
      overflow-x: hidden;
      overflow-y: scroll;
    }
    .item {
      &.active {
        background: $primary;
        span, span.material-icons {
          color: #fffaec;
        }
      }
      @include phone {
        width: calc(33.333% - 12px);
      }
      @include tablet {
        width: calc(16.665% - 12px);
      }
      span.material-icons {
        color: $primary;
        font-size: 36px;
        margin-bottom: 12px;
      }
      > span {
        width: 100%;
        font-size: 14px;
        color: $primary;
      }
      // border: 2px solid $primary;
      background: #fffaec;
      border-radius: 10px;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      height: 100px;
      margin: 0 6px;
      margin-bottom: 12px;
      padding: 10px;
    }
    padding-top: 0;
    overflow: hidden;
  }
  .modal-content {
    max-height: 500px;
  }
}
</style>
