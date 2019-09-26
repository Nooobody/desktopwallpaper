<template>
  <div class="app" @mousedown.left="click" @mousemove="clickMove" @mouseup.left="releaseClick">
    <div :style="holdStyle" class="selection_rectangle"></div>
    <background></background>
    <radio></radio>
    <!-- <app-notes :notes="data.notes" @save-notes="saveNotes"></app-notes> -->
    <settings :tabs="settingTabs">
      <radio-list slot="Radio"></radio-list>
      <background-settings slot="Background"></background-settings>
      <favorites slot="Favorites"></favorites>
      <timer-settings slot="Timers"></timer-settings>
    </settings>
    <clock></clock>
    <timers></timers>
    <preload-image />
    <!-- <app-goal-track></app-goal-track> -->
      <!-- <div class="play_wrapper" @click="togglePlay()">
        <i class="fa" :class="{ 'fa-play': !playing, 'fa-pause': playing }"></i>
      </div>
      <div class="volume_wrapper">
        <div class="volume_slider"></div>
      </div> -->
  </div>
</template>

<script>
import Background from './components/background';
import BackgroundSettings from './components/background-settings';
import Settings from './components/settings';
import RadioList from './components/radio-list';
import Clock from './components/clock';
import Timers from './components/timers';
import Radio from './components/radio';
import VisualizerSettings from './components/visualizer-settings';
import Favorites from './components/favorites';
import Notes from './components/notes';
import PreloadImage from './components/preload-image';
import TimerSettings from './components/timer-settings';

import { DataStorage } from './storage';

export default {
  components: {
    Background,
    BackgroundSettings,
    Settings,
    RadioList,
    Clock,
    Timers,
    Radio,
    VisualizerSettings,
    Favorites,
    Notes,
    PreloadImage,
    TimerSettings
  },
  data() {
    return {
      dataStorage: {},
      data: {},
      settingTabs: ["Radio", "Background", "Favorites", "Timers"],
      holding: false,
      holdPos: {},
      holdStyle: {},
    }
  },
  created() {
    this.dataStorage = new DataStorage();
    this.data = this.dataStorage.getData();
    this.$store.dispatch("initGamerCheck");
    this.$store.dispatch("setBackgroundSettings", this.data);
    this.$store.dispatch("setRadioSettings", this.data);
    this.$store.dispatch("initTimers", this.data.timers);
  },
  computed: {
    volume() { return this.$store.state.radio.volume },
    favorites() { return this.$store.state.background.favorites },
    radioList() { return this.$store.state.radio.radioList },
    rating() { return this.$store.state.background.rating },
    tags() { return this.$store.state.background.tags },
    excludedTags() { return this.$store.state.background.excludedTags },
    updateTimers() { return this.$store.state.timer.updateTimers }
  },
  watch: {
    volume(newV, oldV) {
      if (newV !== this.data.volume) {
        this.data.volume = newV;
        this.dataStorage.setData(this.data);
      }
    },
    favorites(newV, oldV) {
      if (newV.length !== this.data.favorites.length) {
        this.data.favorites = newV;
        this.dataStorage.setData(this.data);
      }
    },
    radioList(newV, oldV) {
      if (newV.length !== this.data.radios.length) {
        this.data.radios = newV;
        this.dataStorage.setData(this.data);
      }
    },
    rating(newV, oldV) {
      if (newV !== this.data.backgroundSettings.rating) {
        this.data.backgroundSettings.rating = newV;
        this.dataStorage.setData(this.data);
      }
    },
    tags(newV, oldV) {
      if (newV.length !== this.data.backgroundSettings.tags.length) {
        this.data.backgroundSettings.tags = newV;
        this.dataStorage.setData(this.data);
      }
    },
    excludedTags(newV, oldV) {
      if (newV.length !== this.data.backgroundSettings.tags_exclude.length) {
        this.data.backgroundSettings.tags_exclude = newV;
        this.dataStorage.setData(this.data);
      }
    },
    updateTimers(newV, oldV) {
      if (newV) {
        this.data.timers = this.$store.state.timer.timers;
        this.dataStorage.setData(this.data);
        this.$store.commit("timersUpdated");
      }
    }
  },
  methods: {
    calcRect() {
      if (this.holding) {
        let w = Math.abs(this.holdPos.x - this.holdEndPos.x) + "px";
        let h = Math.abs(this.holdPos.y - this.holdEndPos.y) + "px";
        if (this.holdEndPos.x < this.holdPos.x && this.holdEndPos.y < this.holdPos.y) {
          return {
            top: this.holdEndPos.y + "px",
            left: this.holdEndPos.x + "px",
            width: w,
            height: h
          };
        }
        else if (this.holdEndPos.x < this.holdPos.x) {
          return {
            top: this.holdPos.y + "px",
            left: this.holdEndPos.x + "px",
            width: w,
            height: h
          };
        }
        else if (this.holdEndPos.y < this.holdPos.y) {
          return {
            top: this.holdEndPos.y + "px",
            left: this.holdPos.x + "px",
            width: w,
            height: h
          };
        }
        else {
          return {
            top: this.holdPos.y + "px",
            left: this.holdPos.x + "px",
            width: w,
            height: h
          };
        }
      }

      return {border: "0"};
    },
    click(e) {
      let {x, y} = e;
      this.holding = true;
      this.holdPos = {x, y};
      this.holdEndPos = {x, y};
    },
    clickMove(e) {
      if (this.holding) {
        let {x, y} = e;
        this.holdEndPos = {x, y};
        this.holdStyle = this.calcRect();
      }
    },
    releaseClick() {
      this.holding = false;
      this.holdStyle = {
        top: "0px",
        left: "0px",
        width: "0px",
        height: "0px",
        border: "0px"
      };
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Open+Sans');

body, html {
  margin: 0;
  padding: 0;
  font-family: "Open Sans";
  overflow: hidden;
  user-select: none;
}

.selection_rectangle {
  position: fixed;
  z-index: 99;
  background-color: rgba(28, 153, 255, 0.5);
  border: 2px solid rgba(1, 74, 128, 0.5);
  border-radius: 2px;
  width: 0px;
  height: 0px;
  user-select: none;
  pointer-events: none;
}

.toggleBtn {
  z-index: 100;
  position: fixed;
  top: 10px;
  left: 10px;
  font-size: 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.5);
}

.wrapper {
  z-index: 100;
  position: absolute;
  left: -800px;
  top: 40px;
  padding: 20px;
  padding-top: 10px;
  color: #afafaf;
  transition: left 200ms ease-in-out;
  &.show {
    left: 40px;
  }
}

.slot-wrapper.hidden {
  display: none;
}

.bg {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  text-align: center;
  user-select: none;
}

.bg-enter-active, .bg-leave-active {
  transition: opacity 1000ms ease-in-out;
}

.bg-enter, .bg-leave-to {
  opacity: 0;
}

.back_bg, .front_bg {
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center center;
}

.back_bg {
  z-index: 1;
  background-size: cover;
  filter: brightness(0.5);
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}

.front_bg {
  z-index: 20;
  background-size: contain;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}

.card {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.clock-wrapper {
  z-index: 100;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 60px;
  -webkit-text-stroke: 3px black;
  color: white;
  pointer-events: none;
}

.visualizer-wrapper {
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  overflow: hidden;
}

.checkbox-toggle {
  width: 24px;
  height: 24px;
  background-color: #fff;
  border: 1px solid #ced4da;
  float: left;
  border-radius: 50%;
  margin-right: 1rem;
  margin-left: 1rem;
  cursor: pointer;
}

.inner-circle {
  width: 12px;
  height: 12px;
  margin: 5px;
  border-radius: 50%;
}

.checkbox-toggle.active .inner-circle {
  background-color: #090;
}

svg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  pointer-events: none;
}
</style>
