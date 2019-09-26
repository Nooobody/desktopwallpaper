
const ipc = require("electron").ipcRenderer;

export default {
  state: {
    volume: 0.2,
    radioPlaying: false,
    selectedRadio: 0,
    radioList: [],
  },
  getters: {
    currentRadio(state) {
      return state.radioList[state.selectedRadio];
    }
  },
  mutations: {
    nextRadio(state) {
      state.selectedRadio += 1;
      if (state.selectedRadio >= state.radioList.length) {
        state.selectedRadio = 0;
      }
    },
    previousRadio(state) {
      state.selectedRadio -= 1;
      if (state.selectedRadio < 0) {
        state.selectedRadio = state.radioList.length - 1;
      }
    },
    toggleRadioPlaying(state) {
      state.radioPlaying = !state.radioPlaying;
    },
    increaseVolume(state) {
      state.volume += 0.05;
      if (state.volume > 1) {
        state.volume = 1;
      }
    },
    decreaseVolume(state) {
      state.volume -= 0.05;
      if (state.volume <= 0) {
        state.volume = 0;
      }
    },
    addRadio(state, radio) {
      let radios = state.radioList.slice();
      radios.push(radio);
      state.radioList = radios;
    },
    removeRadio(state, index) {
      let radios = state.radioList.slice();
      radios.splice(index, 1);
      state.radioList = radios;
    }
  },
  actions: {
    setRadioSettings({state}, settings) {
      state.radioList = settings.radios;
      state.volume = settings.volume;
    },
    initRadioListeners({commit}) {
      ipc.on("shortcut", (event, value) => {
        switch(value) {
          case "mediaSwitchNext": {
            commit("nextRadio");
            break;
          }
          case "mediaSwitchPrevious": {
            commit("previousRadio");
            break;
          }
          case "volumeDown": {
            commit("decreaseVolume");
            break;
          }
          case "volumeUp": {
            commit("increaseVolume");
            break;
          }
          case "mediaPlayPause": {
            commit("toggleRadioPlaying");
            break;
          }
        }
      });
    }

  }
}
