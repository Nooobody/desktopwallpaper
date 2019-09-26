
import moment from 'moment';

function processTimer(timer) {
  if (timer.editing) {
    return timer;
  }

  if (timer.repeating) {
    let dateTime;
    if (timer.startsAt === "now") {
      dateTime = moment();
    }
    else {
      dateTime = moment(timer.startsAt);
    }
    const split = timer.duration.split(" ");
    const duration = moment.duration(parseInt(split[0], 10), split[1]);
    while (dateTime.clone().add(duration).isBefore(moment())) {
      dateTime.add(duration);
    }
    timer.endsIn = dateTime.clone().add(duration).toISOString(true);
    timer.startsAt = dateTime.toISOString(true);
  }
  else {
    if (!timer.hasDuration) {
      timer.endsIn = moment(timer.endsIn).toISOString(true);
    }
    else {
      const split = timer.duration.split(" ");
      const duration = moment.duration(parseInt(split[0], 10), split[1]);
      let dateTime;
      if (!timer.startsAt) {
        dateTime = moment().add(duration);
        timer.startsAt = moment().toISOString(true);
      }
      else {
        dateTime = moment(timer.startsAt).add(duration);
      }
      timer.endsIn = dateTime.toISOString(true);
    }
  }
  return timer;
}

export default {
  state: {
    timers: [],
    realTimers: [],
    updateTimers: false
  },
  actions: {
    addTimer({commit}) {
      commit("addTimer");
    },
    deleteTimer({commit}, index) {
      commit("deleteTimer", index);
    },
    editTimer({commit}, payload) {
      if (!payload.timer.repeating && payload.timer.type === "fromNow") {
        delete payload.timer.startsAt;
      }
      payload.timer.editing = false;
      payload.timer = processTimer(payload.timer);
      commit("editTimer", payload);
    },
    setTimerType({state}, {index, type}) {
      state.timers[index] = Object.assign({}, state.timers[index], {type});
      console.log(state.timers[index]);
    },
    initTimers({commit, dispatch, state}, timers) {
      for (let timer of timers) {
        timer = processTimer(timer);
      }
      commit("setTimers", timers);

      const checkTimers = () => {
        const realTimers = [];
        state.timers.forEach((timer, index) => {
          if (!timer.endsIn || timer.editing) {
            return;
          }

          const diff = moment.duration(moment(timer.endsIn).diff(moment()));
          realTimers.push({
            name: timer.name,
            time: diff._data
          });

          const fiveMinutes = 1000 * 60 * 5;
          const fifteenMinutes = fiveMinutes * 3;
          const oneDay = 1000 * 60 * 60 * 24;

          if (diff._milliseconds > oneDay - 500 && diff._milliseconds < oneDay + 500) {
            dispatch("timerInOneDay", timer);
          }

          if (diff._milliseconds > fiveMinutes - 500 && diff.milliseconds < fiveMinutes + 500) {
            dispatch("timerInFiveMinutes", timer);
          }

          if (diff._milliseconds > fifteenMinutes - 500 && diff._milliseconds < fifteenMinutes + 500) {
            dispatch("timerInFifteenMinutes", timer);
          }

          if (diff._milliseconds < 1000) {
            dispatch("timerUp", { timer, index });
          }
        })
        commit("setRealTimers", realTimers);
      }

      state._timer = setInterval(checkTimers, 1000);
    },
    timerInOneDay({}, timer) {
      new Notification("Timer up tomorrow!", { body: timer.name });
    },
    timerInFifteenMinutes({}, timer) {
      new Notification("Timer up in 15 minutes!", { body: timer.name });
    },
    timerInFiveMinutes({}, timer) {
      new Notification("Timer up in 5 minutes!", { body: timer.name });
    },
    timerUp({commit, state}, { timer, index }) {
      new Notification("Timer's up!", { body: timer.name });
      if (timer.repeating) {
        timer = processTimer(timer);
        commit("editTimer", index, timer);
      }
      else {
        commit("deleteTimer", index);
      }
    }
  },
  mutations: {
    setRealTimers(state, realTimers) {
      state.realTimers = realTimers;
    },
    addTimer(state) {
      state.timers.push({editing: true});
      state.updateTimers = true;
    },
    startEditingTimer(state, index) {
      state.timers[index].editing = true;
    },
    editTimer(state, {index, timer}) {
      state.timers[index] = timer;
      state.updateTimers = true;
    },
    deleteTimer(state, index) {
      state.timers.splice(index, 1);
      state.updateTimers = true;
    },
    setTimers(state, timers) {
      state.timers = timers;
      console.log(timers);
    },
    timersUpdated(state) {
      console.log("Timers updated!");
      state.updateTimers = false;
    }
  }
}
