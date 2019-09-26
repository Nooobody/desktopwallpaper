<template>
  <img ref="img" v-show="false" :src="background" alt="Preloading image">
</template>

<script>
  export default {
    computed: {
      background() {
        return this.$store.state.background.preloadBackground;
      }
    },
    mounted() {
      this.$refs.img.onload = () => {
        console.log("Image loaded!");
        this.$store.dispatch("imagePreloaded");
      }
    }
  }
</script>
