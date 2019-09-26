<template>
  <div class="radio-wrapper">
    <audio :src="currentRadio" ref="player" preload="none"></audio>
  </div>
</template>

<script>
  const ipc = require("electron").ipcRenderer;

  export default {
    data() {
      return {
        // radios: [
        //   "http://37.59.41.178:8000/touhouradio.mp3?70",
        //   "http://streaming.radionomy.com/RadioVocaloid?lang=en-US%2cen%3bq%3d0.8"
        // ]
      };
    },
    computed: {
      volume() { return this.$store.state.radio.volume },
      currentRadio() { return this.$store.getters.currentRadio },
      playing() { return this.$store.state.radio.radioPlaying },
      gaming() { return this.$store.state.misc.gaming }
    },
    watch: {
      volume(newValue, oldValue) {
        this.setVolume(newValue);
      },
      playing(newV) {
        this.togglePlay();
      },
      currentRadio(newValue, oldValue) {
        console.log("Changing radio to ", newValue);
        window.setTimeout(() => {
          this.play();
        }, 100);
      }
    },
    methods: {
      togglePlay() {
        if (!this.playing) {
          this.stop();
        }
        else {
          this.setVolume(this.volume);
          this.play();
        }
      },
      play() {
        let player = this.$refs.player;

        player.load();
        player.play();
      },
      stop() {
        this.$refs.player.pause();
      },
      setVolume(val) {
        console.log("Current volume: ", val);
        this.playerVolume = val;
        this.$refs.player.volume = val;
      }
    },
    created() {
      this.$store.dispatch("initRadioListeners");
    }
  };
</script>
