<template>
  <div class="card">
    <div class="card-header">Radio list</div>
    <div class="card-body">
      <div class="radioList text-dark">
        <div class="radio" :class="{ 'text-success': currentRadio === index }" v-for="(radio, index) in radioList">
          <i class="text-danger fa fa-minus" @click="removeRadio(index)"></i>
          {{ radio }}
        </div>
      </div>
      <div class="addRadio">
        <i class="text-success fa fa-plus" @click="addClick"></i>
        <input type="text" v-model="newRadio" @keyup.enter="addClick" v-if="showInput">
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        showInput: false,
        newRadio: ""
      }
    },
    computed: {
      radioList() { return this.$store.state.radio.radioList },
      currentRadio() { return this.$store.state.radio.selectedRadio }
    },
    methods: {
      addClick() {
        if (this.showInput) {
          this.addRadio(this.newRadio);
          this.newRadio = "";
          this.showInput = false;
        }
        else {
          this.showInput = true;
        }
      },
      addRadio(radio) {
        if (radio.length === 0) {
          return;
        }

        this.$store.commit("addRadio", radio);
      },
      removeRadio(index) {
        this.$store.commit("removeRadio", index);
      }
    },
  };
</script>
