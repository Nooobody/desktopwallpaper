
import Vue from 'vue';
import Vuex from 'vuex';

import background from './modules/background';
import radio from './modules/radio';
import misc from './modules/misc';
import timer from './modules/timer';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    background,
    radio,
    misc,
    timer
  }
});
