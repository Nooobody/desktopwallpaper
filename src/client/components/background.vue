<template>
  <transition name="bg" mode="in-out">
    <div v-if="!working" class="bg">
      <div class="front_bg" :style="noInternetObj"></div>
    </div>
    <div v-if="working && noTags" class="bg">
      <div class="front_bg" :style="noTagsObj"></div>
    </div>
    <div v-if="working && !noTags" :key="bgKey" class="bg">
      <div class="front_bg" :style="bgObj"></div>
      <div class="back_bg" :style="bgObj"></div>
    </div>
  </transition>
</template>

<script>
  import * as booru from "booru";
  import { mapState } from 'vuex';

  export default {
    watch: {
      background(newV) {
        this.bgKey = Math.floor(Math.random() * 999);
      }
    },
    data() {
      return {
        bgKey: "123",
        noInternetObj: {
          backgroundImage: "url('./No Internet.png')"
        },
        noTagsObj: {
          backgroundImage: "url('./No tags.png')"
        }
      }
    },
    computed: {
      background() { return this.$store.state.background.background },
      bgObj() { return `backgroundImage: url('${this.background}')` },
      noTags() { return this.$store.state.background.noTags },
      working() { return this.$store.state.background.internetWorking }
    },
    created() {
      this.$store.dispatch("nextImage");
      this.$store.dispatch("toggleBackgroundTimer");
      this.$store.dispatch("initBackgroundListeners");
    }
  }
</script>
