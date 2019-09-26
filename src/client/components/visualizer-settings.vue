<template>
  <div class="card">
    <div class="card-header">Visualizer Settings</div>
    <div class="card-body">
      <div class="text-left">
        <input id="visualizer_disabled" class="d-none" type="checkbox" v-model="actualSettings.disabled" @change="toggleVisualizer()">
        <label for="visualizer_disabled" class="checkbox-toggle" :class="{active: actualSettings.disabled}">
          <div class="inner-circle"></div>
        </label>
        <label for="visualizer_disabled" :style="{cursor: 'pointer'}">Disable</label>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["settings"],
    data() {
      return {
        actualSettings: {
          disabled: false
        }
      }
    },
    mounted() {
      this.actualSettings = this.settings;
    },
    watch: {
      settings(newV, oldV) {
        this.actualSettings = newV;
      }
    },
    methods: {
      updateSettings() {
        this.$emit("update-settings", this.actualSettings);
      },
      toggleVisualizer() {
        this.updateSettings();
      }
    }
  }
</script>
