<template>
  <div class="card">
    <div class="card-header">Favorite Backgrounds</div>
    <div class="card-body">
      <h4>Favorites: {{favorites.length}}</h4>
      <div class="btn btn-success" @click="saveFavorites()">Save files</div>
      <div class="progress mt-2" v-if="progress >= 0">
        <div class="progress-bar" :style="{width: Math.floor((progress / favorites.length) * 100) + '%'}">{{progress}} / {{favorites.length}}</div>
      </div>
      <div class="m-2 bg-dark img-wrapper">
        <virtual-list :size="30" :remain="12" :bench="4" :variable="false">
          <div class="img-container" v-for="(img, index) in sortedFavorites" @click.ctrl.left="setAsBackground(img)" @click.left="copyUrl(img)" :key="index">
            <i class="fa fa-times delete" @click.stop="deleteImg(index)"></i>
            <img :src="img">
          </div>
        </virtual-list>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .img-wrapper {
    width: 520px;
    height: 400px;
    border-radius: 4px;
    padding: 10px;
  }
  .img-container {
    width: 100px;
    height: 100px;
    display: inline-block;
    margin: 10px;
    cursor: pointer;
    position: relative;
  }
  .img-container img {
    width: 100%;
    height: 100%;
  }
  .delete {
    color: red;
    font-size: 16px;
    position: absolute;
    top: 5px;
    right: 5px;
  }
</style>

<script>
  import { clipboard, ipcRenderer } from 'electron';
  import virtualList from 'vue-virtual-scroll-list';

  export default {
    computed: {
      favorites() { return this.$store.state.background.favorites },
      sortedFavorites() {
        return this.sortFavorites(this.favorites);
      }
    },
    components: {
      virtualList
    },
    data() {
      return {
        progress: -1
      }
    },
    methods: {
      deleteImg(index) {
        this.$store.commit("removeFavorite", this.favorites.length - index - 1);
      },
      copyUrl(img) {
        clipboard.writeText(img);
      },
      setAsBackground(img) {
        this.$store.dispatch("setBackground", {
          img: img,
          foundWith: "Favorite",
          tags: []
        });
        this.$store.dispatch("toggleBackgroundTimer", true);
      },
      saveFavorites() {
        ipcRenderer.send("saveFavorites", this.favorites);
      },
      sortFavorites(favs) {
        let sortedFavs = favs.slice();

        sortedFavs = sortedFavs.reverse();

        return sortedFavs;
      }
    },
    created() {
      ipcRenderer.on('favoriteProgress', (_, progress) => {
        this.progress = progress;
      });
    }
  }
</script>
