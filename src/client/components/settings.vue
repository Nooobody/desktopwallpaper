<template>
  <div class="container">
    <div class="toggleBtn" @click="toggleList">
      <i class="fa fa-bars"></i>
    </div>
    <div class="wrapper" :class="{ show: show }">
      <div class="nav nav-tabs">
        <div class="nav-link mr-1" :style="{cursor: 'pointer'}" :class="{ active: selected === ind, 'bg-dark': selected !== ind}" v-for="(tab, ind) in tabs" @click="select(ind)">{{tab}}</div>
      </div>
      <div class="slot-wrapper" v-for="(tab, ind) in tabs" :class="{hidden: selected !== ind}">
        <slot :name="tab"></slot>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["tabs"],
    data() {
      return {
        show: false,
        selected: 0
      };
    },
    methods: {
      toggleList() {
        this.show = !this.show;
      },
      select(ind) {
        this.selected = ind;
      }
    }
  }
</script>
