<template>
  <div class="timer-wrapper">
    <div class="timer" v-for="timer in timers">
      <h2>{{timer.name}}</h2>
      <div class="row">
        <div class="col" v-for="type in relevant" v-if="timer.time[type] > 0">
          <h2>{{timer.time[type]}}</h2>
          <h4>{{type}}</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  export default {
    data() {
      return {
        relevant: [
          'months',
          'days',
          'hours',
          'minutes',
          'seconds'
        ]
      }
    },
    computed: {
      timers() {
        return this.$store.state.timer.realTimers;
      }
    }
  }
</script>

<style scoped>
.timer-wrapper {
  z-index: 100;
  position: absolute;
  top: 2px;
  left: 80%;
  right: 2px;
  font-size: 30px;
  color: white;
  pointer-events: none;
}

.timer {
  background-color: rgba(0, 0, 0, 0.3);
  text-align: center;
}
</style>
