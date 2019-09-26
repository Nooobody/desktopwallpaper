<template>
  <div class="card">
    <div class="card-header">Timers</div>
    <div class="card-body">
      <div class="btn btn-secondary" @click="addTimer">Add a timer</div>
      <div v-for="(timer, index) in timers" class="my-2">
        <div v-if="!timer.editing" @click="startEditing(index)">
          <h4 class="text-dark"><span><i class="fa fa-chevron-right float-left"></i></span> {{timer.name}}</h4>
        </div>
        <div v-else="timer.editing" class="bg-dark timer p-2">
          <i class="fa fa-times text-danger float-right" @click="deleteTimer(index)"></i>
          <div class="form-group">
            <label>Timer Name</label>
            <input class="form-control" type="text" v-model="timer.name"></input>
          </div>
          <div class="form-check mb-4">
            <input type="checkbox" class="form-check-input" v-model="timer.repeating">
            <label class="form-check-label">Repeating?</label>
          </div>
          <div v-if="timer.repeating">
            <div class="form-group">
              <label>Occurrence</label>
              <input type="text" id="occurrence" class="form-control" v-model="timer.duration">
            </div>
            <div class="form-group">
              <label>Starts at</label>
              <input type="text" class="form-control" v-model="timer.startsAt">
            </div>
          </div>
          <div v-else>
            <div class="form-check mb-4">
              <input type="checkbox" class="form-check-input" v-model="timer.hasDuration">
              <label class="form-check-label">Has Duration</label>
            </div>
            <div class="form-group" v-if="timer.hasDuration">
              <label>Duration</label>
              <input type="text" class="form-control" v-model="timer.duration">
            </div>
            <div class="form-group" v-else>
              <label>Ends At</label>
              <input type="text" class="form-control" v-model="timer.endsIn">
            </div>
          </div>
          <div class="btn btn-primary mt-4" @click="editTimer(index, timer)">Update</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        timeTypes: [
          "seconds",
          "minutes",
          "hours",
          "days",
          "weeks",
          "months"
        ]
      }
    },
    computed: {
      timers() {
        return this.$store.state.timer.timers;
      }
    },
    methods: {
      addTimer() {
        this.$store.dispatch("addTimer");
      },
      startEditing(index) {
        this.$store.commit("startEditingTimer", index);
      },
      editTimer(index, timer) {
        this.$store.dispatch("editTimer", {index, timer});
      },
      deleteTimer(index) {
        this.$store.dispatch("deleteTimer", index);
      },
      setTimerType(index, type) {
        this.$store.dispatch("setTimerType", {index, type});
      }
    }
  }
</script>

<style scoped>
.timer {
  border-radius: 4px;
}

.fa-times {
  cursor: pointer;
}
</style>
