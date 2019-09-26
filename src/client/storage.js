
const electron = require('electron');
const path = require('path');
const fs = require('fs');

const defaults = {
  radios: [],
  notes: [],
  volume: 0.2,
  visualizerSettings: {},
  backgroundSettings: {
    tags: [],
    tags_exclude: [],
    rating: "q"
  },
  favorites: [],
  timers: []
};

export class DataStorage {
  constructor() {
    let userpath = electron.remote.app.getPath('userData');
    this.path = userpath + "\\desktop_wallpaper_user_config.json";

    this.data = this.readData();
  }

  setData(obj) {
    this.data = obj;
    this.writeData();
  }

  getData() {
    return this.data;
  }

  readData() {
    let data = defaults;
    try {
      let file = fs.readFileSync(this.path, "utf8");
      data = Object.assign({}, data, JSON.parse(file));
    }
    catch(e) {
      console.log("Error reading data file...");
      console.log(e);
      console.log("Falling back to defaults.");
    }
    return data;
  }

  writeData() {
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}
