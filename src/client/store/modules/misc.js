
import moment from 'moment';

export default {
  state: {
    time: moment(),
    gaming: false
  },
  actions: {
    initClock({commit, state}) {
      state._timer = setInterval(() => commit('updateClock'), 50);
    },
    initGamerCheck({commit, state}) {
      ipc.on("hidden", (_, isHidden) => {
        if (isHidden !== state.gaming) {
          commit("setGaming", isHidden);
        }
      });
    }
  },
  mutations: {
    updateClock(state) {
      state.time = moment();
    },
    setGaming(state, b) {
      state.gaming = b;
    }
  }
}
