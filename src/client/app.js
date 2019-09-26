
import * as axios from "axios";
import Vue from 'vue';
import store from './store';

Vue.prototype.$http = axios;

import App from './App.vue';

const ipc = require("electron").ipcRenderer;

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  ipc.send("contextmenu");
});

let app = new Vue({
  el: '#app',
  store,
  render: h => h(App)
});
