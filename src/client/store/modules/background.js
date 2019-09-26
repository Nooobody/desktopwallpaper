
import moment from 'moment';
import * as booru from "booru";
import { ipcRenderer as ipc } from "electron";

const booruSites = [
  "dan",
  "konan",
  "yand",
  "gel",
  "safe"
];

async function getImage(tag) {
  let site = booruSites[Math.floor(Math.random() * booruSites.length)];
  let resp = await booru.search(site, [tag], {random: true});
  let images = await booru.commonfy(resp);
  return images[0];
}

export default {
  state: {
    preloadBackground: "",
    background: "",
    backgroundPaused: false,
    backgroundRatings: {
      "e": false,
      "q": true,
      "s": true,
      "u": false
    },
    preloadOptions: {},
    rating: 'q',
    noTags: false,
    internetWorking: true,
    tags: [],
    currentImagetags: [],
    currentTag: "",
    favorites: [],
    forcedTag: "",
    tries: 0,
    timerID: undefined,
    nextBackgroundTime: undefined
  },
  mutations: {
    preloadBackground(state, bg) {
      state.preloadBackground = bg;
    },
    setBackground(state, bg) {
      state.background = bg;
    },
    setPreloadOptions(state, opts) {
      state.preloadOptions = opts;
    },
    addFavorite(state) {
      let favs = state.favorites.slice();
      favs.push(state.background);
      state.favorites = favs;
    },
    removeFavorite(state, ind) {
      let favs = state.favorites.slice();
      favs.splice(ind, 1);
      state.favorites = favs;
    },
    addTag(state, tag) {
      let tags = state.tags.slice();
      tags.push(tag);
      state.tags = tags;
      state.forcedTag = "";
      ipc.send("set_tags", state.tags);
    },
    editTag(state, { tag, ind }) {
      let tags = state.tags.slice();
      tags.splice(ind, 1, tag);
      state.tags = tags;
      state.forcedTag = "";
      ipc.send("set_tags", state.tags);
    },
    deleteTag(state, ind) {
      let tags = state.tags.slice();
      tags.splice(ind, 1);
      state.tags = tags;
      state.forcedTag = "";
      ipc.send("set_tags", state.tags);
    },
    addExcludedTag(state, tag) {
      let tags = state.excludedTags.slice();
      tags.push(tag);
      state.excludedTags = tags;
    },
    editExcludedTag(state, { tag, ind }) {
      let tags = state.excludedTags.slice();
      tags.splice(ind, 1, tag);
      state.excludedTags = tags;
    },
    deleteExcludedTag(state, ind) {
      let tags = state.excludedTags.slice();
      tags.splice(ind, 1);
      state.excludedTags = tags;
    },
    setCurrentTags(state, tags) {
      state.currentImagetags = tags;
    },
    currentTag(state, tag) {
      state.currentTag = tag;
    },
    setForcedTag(state, tag) {
      state.forcedTag = tag;
    },
    setBackgroundPause(state, s) {
      state.backgroundPaused = s;
    },
    setNextImageTime(state) {
      state.nextBackgroundTime = moment().add(30, 'seconds');
    },
    removeNextImageTime(state) {
      state.nextBackgroundTime = undefined;
    }
  },
  actions: {
    async nextImage({dispatch, commit, state}) {
      let tags = state.tags;

      if (tags.length === 0) {
        // No tags, cannot continue.
        state.noTags = true;
        return;
      }

      if (state.noTags) {
        state.noTags = false;
      }

      let tag;
      if (state.forcedTag) {
        tag = state.forcedTag;
      }
      else {
        tag = tags[Math.floor(Math.random() * tags.length)];
      }
      console.log(tag);

      let image;
      try {
        image = await getImage(tag);

        if (!image || !image.common) {
          throw "Undefined image";
        }
      }
      catch(e) {
        console.log("Failed to fetch an image!");
        console.log(e);

        // Try again.
        state.tries += 1;

        if (state.tries > 20) {
          // We've tried enough, probably an internet problem.
          state.internetWorking = false;
          return;
        }
        dispatch("nextImage");
        return;
      }

      state.tries = 0;
      if (!state.internetWorking) {
        state.internetWorking = true;
      }

      if (image.common.tags.some(t => state.excludedTags.indexOf(t) > -1)) {
        // An excluded tag, move along!
        dispatch("nextImage");
        return;
      }

      if (!state.backgroundRatings[image.common.rating]) {
        // Rating is too lewd, move along!
        dispatch("nextImage");
        return;
      }

      commit("preloadBackground", image.common.file_url);
      commit("setPreloadOptions", {
        img: image.common.file_url,
        tags: image.common.tags,
        foundWith: tag
      });
    },
    imagePreloaded({commit, dispatch, state}) {
      dispatch("setBackground", state.preloadOptions);
      commit("preloadBackground", "");
      dispatch("toggleBackgroundTimer", true);
    },
    setBackground({commit}, opt) {
      commit("setBackground", opt.img);
      commit("setCurrentTags", opt.tags);
      commit("currentTag", opt.foundWith);
      commit("setPreloadOptions", {});
      ipc.send('bg_image', opt.img, opt.foundWith, opt.tags);
    },
    setRatings({commit, state}, rating) {
      let rats = {
        e: false,
        u: false,
        q: false,
        s: true
      };

      switch(rating) {
        case "e":
          rats.e = true;
          rats.u = true;
        case "q":
          rats.q = true;
        default:
          break;
      }

      state.backgroundRatings = rats;
      state.rating = rating;
    },
    toggleBackgroundTimer({commit, dispatch, state}, reset) {
      let setImage = () => {
        if (state.gaming || state.backgroundPaused) {
          return;
        }

        dispatch("nextImage");
        commit("setNextImageTime");
      }

      if (reset) {
        clearInterval(state.timerID);
        state.timerID = setInterval(setImage, 1000 * 30);
        commit("setNextImageTime");
        return;
      }

      if (state.timerID) {
        clearInterval(state.timerID);
        state.timerID = undefined;
        commit("setBackgroundPause", true);
        commit("removeNextImageTime");
      }
      else {
        state.timerID = setInterval(setImage, 1000 * 30);
        commit("setBackgroundPause", false);
        commit("setNextImageTime");
      }
    },
    forceTag({commit}, tag) {
      commit("setForcedTag", tag);
    },
    stopForcing({commit, state}) {
      commit("setForcedTag", "");
      ipc.send("set_tags", state.tags);
    },
    setBackgroundSettings({dispatch, state}, settings) {
      state.tags = settings.backgroundSettings.tags;
      state.excludedTags = settings.backgroundSettings.tags_exclude;
      state.favorites = settings.favorites;
      dispatch("setRatings", settings.backgroundSettings.rating);
      ipc.send("set_tags", state.tags);
    },
    initBackgroundListeners({commit, dispatch}) {
      ipc.on("forceTag", (event, tag) => {
        dispatch("forceTag", tag);
      });

      ipc.on("contextmenu", (event, cmd) => {
        switch(cmd) {
          case "stopBackground":
            dispatch("toggleBackgroundTimer");
            break;
          case "resumeBackground":
            dispatch("toggleBackgroundTimer");
            dispatch("nextImage");
            break;
          case "stopForcing":
            dispatch("stopForcing");
            break;
          case "nextBackground":
            dispatch("nextImage");
            dispatch("toggleBackgroundTimer", true);
            break;
          case "favorite":
            commit("addFavorite");
            break;
        }
      });
    }
  }
}
