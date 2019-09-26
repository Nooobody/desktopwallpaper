<template>
  <div>
    <div class="wrapper goalWrapper">
      <div class="level">
        Level {{level}}
      </div>
      <div class="levelProgress">
        <div class="header">
          To next level
        </div>
        <div class="progressBar">
          <div class="progressBack"></div>
          <div class="progressFront"></div>
        </div>
      </div>
    </div>
    <div class="wrapper addGoalWrapper" v-if:"addingGoal">

    </div>
  </div>
</template>

<script>
  const levelDivider = 300;

  const DAILY = 1;
  const BIDAILY = 2;
  const WEEKLY = 3;
  const MONTHLY = 4;
  const WEEKDAY = 5;

  const goalTemplate = {
    id: 1,
    name: "Placeholder",
    date: moment(),
    repeating: true,
    repeatingMode: DAILY,
    repeatingFinished: false
  }

  export default {
    data() {
      return {
        points: 1,
        UUID: 0,
        goalsCompleted: 0,
        goalsFailed: 0,
        goalsList: [],
        addingGoal: false
      };
    },
    props: ["goals"],
    watched: {
      goals(newValue) {
        this.points = newValue.points;
        this.UUID = newValue.UUID;
        this.goalsCompleted = newValue.goalsCompleted;
        this.goalsFailed = newValue.goalsFailed;
        this.goalsList = newValue.goalsList;
      }
    },
    computed: {
      level() {
        return Math.floor(this.points / levelDivider);
      },
      currentGoals() {
        return this.checkGoals();
      }
    },
    methods: {
      goalToday(goal, date, today) {
        if (!goal.repeatingFinished) {
          this.goalFailure();
        }
        goal.repeatingFinished = false;
        goal.date = date.day(today);
      },
      checkGoals() {
        let goals = [];
        let deletedGoals = [];

        let today = moment();
        for (let goal of this.goalsList) {
          let date = moment(goal.date);
          if (today.isSame(date, "day")) {
            goals.push(goal);
          }
          else if (goal.repeating) {
            switch(goal.repeatingMode) {
              case DAILY: {
                if (date.add(1, "day").day() === today.day()) {
                  this.goalToday(goal, date, today);
                  goals.push(goal);
                }
                break;
              }
              case BIDAILY: {
                if (date.add(2, "day").day() === today.day()) {
                  this.goalToday(goal, date, today);
                  goals.push(goal);
                }
                break;
              }
              case WEEKDAY: {
                if (date.day() > 0 && date.day() < 6 && date.isBefore(today)) {
                  this.goalToday(goal, date, today);
                  goals.push(goal);
                }
              }
              case WEEKLY: {
                if (date.add(1, "week").day() === today.day()) {
                  this.goalToday(goal, date, today);
                  goals.push(goal);
                }
                break;
              }
              case MONTHLY: {
                if (date.add(1, "month").day() === today.day()) {
                  this.goalToday(goal, date, today);
                  goals.push(goal);
                }
                break;
              }
            }
          }
          else if (today.isAfter(date, "day")) {
            this.goalFailure();
            deletedGoals.push(goal.id);
          }
          else {  // Shouldn't happen.
            console.log("Shouldn't happen, here's the log: ");
            console.log("Today: ", today);
            console.log("Date: ", date);
            console.log(goal);
          }
        }

        this.goalsList = this.goalsList.filter(goal => deletedGoals.indexOf(goal.id) === -1 );
        this.saveGoals();
        return goals;
      },
      finishGoal(goal) {
        this.goalCompleted();
        if (!goal.repeating) {
          this.goalsList = this.goalsList.filter(g => g.id !== goal.id);
        }
        else {
          goal.repeatingFinished = true;
        }

        this.saveGoals();
      },
      newGoal(name, date, repeating=false, repeatingMode=DAILY) {
        let obj = Object.assign({}, goalTemplate);

        obj.id = this.UUID;
        this.UUID += 1;

        obj.name = name;
        obj.date = date;
        obj.repeating = repeating;
        obj.repeatingMode = repeatingMode;

        this.goalsList.push(obj);
      },
      goalCompleted() {
        this.points += Math.floor(Math.random() * 40) + 20;
        this.goalsCompleted += 1;
      },
      goalFailure() {
        // Goals are failed when they're not finished during the same day.
        // However, your level can't degrade.
        let minimumPoints = Math.max(this.level * levelDivider, 1);
        this.points -= Math.floor(Math.random() * 20) + 10;
        if (this.points < minimumPoints) {
          this.points = minimumPoints;
        }
        this.goalsFailed += 1;
      },
      saveGoals() {
        let obj = {
          points: this.points,
          UUID: this.UUID,
          goalsCompleted: this.goalsCompleted,
          goalsFailed: this.goalsFailed,
          goalsList: this.goalsList
        };

        this.$emit("save-goals", obj);
      }
    }
  }
</script>
