<template>
  <div>
    <div class="clock-wrapper text-center">
      {{clock}}
    </div>
    <svg :viewBox="viewBox" preserveAspectRatio="xMinYMin meet" transform="rotate(180)" v-if="!gaming">
      <defs>
        <filter width="500%" height="500%" x="-100%" y="-100%" v-for="(color, name) in colors" :id="name + 'Glow'">
          <feMorphology operator="dilate" radius="6" in="SourceAlpha" :result="name + 'Thicken'" />
          <feGaussianBlur :in="name + 'Thicken'" stdDeviation="5" :result="name + 'Blurred'" />
          <feFlood :flood-color="color" :result="name + 'Color'" />
          <feComposite :in="name + 'Color'" :in2="name + 'Blurred'" operator="in" :result="name + 'Glow_colored'" />
          <feMerge>
            <feMergeNode :in="name + 'Glow_colored'"/>
          </feMerge>
        </filter>
      </defs>
      <path :d="'M 200 160 Q ' + (width / 2) + ' 50 ' + (width - 200) + ' 160'" filter="url(#lineGlow)" stroke="black" fill="transparent" />

      <g :transform="'translate(' + secondsPos + ') rotate(' + secondsAngle + ')'">
        <polygon :points="seconds_points" filter="url(#secondsGlow)"/>
        <text
        :fill="colors.seconds"
        transform="translate(0 85) rotate(180)"
        stroke="black"
        style="font-size: 24px; stroke-width: 0.5px;"
        text-anchor="middle"
        dominant-baseline="central"
        >
          {{seconds}}
        </text>
      </g>

      <g :transform="'translate(' + minutesPos + ') rotate(' + minutesAngle + ')'">
        <polygon :points="minutes_points" filter="url(#minutesGlow)"/>
        <text
        :fill="colors.minutes"
        transform="translate(0 65) rotate(180)"
        stroke="black"
        style="font-size: 24px; stroke-width: 0.5px;"
        text-anchor="middle"
        dominant-baseline="central"
        >
          {{minutes}}
        </text>
      </g>

      <g :transform="'translate(' + hoursPos + ') rotate(' + hoursAngle + ')'">
        <polygon :points="hours_points" filter="url(#hoursGlow)"/>
        <text
        :fill="colors.hours"
        transform="translate(0 45) rotate(180)"
        stroke="black"
        style="font-size: 30px; stroke-width: 0.5px;"
        text-anchor="middle"
        dominant-baseline="central"
        >
          {{hours}}
        </text>
      </g>

      <g :transform="`translate(${nextBackgroundPos}) rotate(${nextBackgroundAngle})`" v-if="!hideNextBackground">
        <polygon :points="seconds_points" filter="url(#nextBackgroundGlow)"/>
      </g>
    </svg>
  </div>
</template>

<script>
  import moment from "moment";

  export default {
    data() {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        viewBox: `0 0 ${window.innerWidth} ${window.innerHeight}`,
        hideNextBackground: true,

        colors: {
          line: "rgb(0,186,255)",
          seconds: "hsl(0, 100%, 50%)",
          minutes: "hsl(60, 100%, 50%)",
          hours: "hsl(120, 100%, 50%)",
          nextBackground: "hsl(0, 0%, 50%)"
        },

        seconds_points: "0 0, -10 60, 10 60",
        minutes_points: "0 0, -10 40, 10 40",
        hours_points: "0 0, -10 20, 10 20",
      };
    },
    created() {
      this.$store.dispatch("initClock");
      let secondsT = 1 - ((this.seconds + (this.time.milliseconds() / 1000)) / 60);
      this.setPolygon(secondsT, "seconds");
      let minutesT = 1 - ((this.minutes + this.seconds / 60) / 60);
      this.setPolygon(minutesT, "minutes");
      let hoursT = 1 - ((this.hours + this.minutes / 60) / 24);
      this.setPolygon(hoursT, "hours");
    },
    computed: {
      time() {
        return this.$store.state.misc.time;
      },
      clock() {
        return this.time.format('MMMM Do YYYY, HH:mm:ss');
      },
      gaming() { return this.$store.state.misc.gaming },
      hours() { return this.time.hour() },
      minutes() { return this.time.minute() },
      seconds() { return this.time.seconds() },
      nextBackground() {
        return this.$store.state.background.nextBackgroundTime;
      }
    },
    watch: {
      time(newV, oldV) {
        let secondsT = 1 - ((this.seconds + (newV.milliseconds() / 1000)) / 60);
        this.setPolygon(secondsT, "seconds");
      },
      seconds(newV, oldV) {
        let minutesT = 1 - ((this.minutes + this.seconds / 60) / 60);
        this.setPolygon(minutesT, "minutes");

        if (this.time > this.nextBackground) {
          this.hideNextBackground = true;
        }
      },
      minutes(newV, oldV) {
        let hoursT = 1 - ((this.hours + this.minutes / 60) / 24);
        this.setPolygon(hoursT, "hours");
      },
      nextBackground(newV) {
        if (newV) {
          let nextBackgroundT = 1 - (newV.seconds() / 60);
          this.setPolygon(nextBackgroundT, "nextBackground");
          this.hideNextBackground = false;
        }
        else {
          this.hideNextBackground = true;
        }
      }
    },
    methods: {
      bezierPosition(t) {
        let start = [200, 160];
        let end = [this.width - 200, 160];
        let ctrl = [this.width / 2, 50];

        let u = 1 - t;
        let x = u * u * start[0] + 2 * u * t * ctrl[0] + t * t * end[0];
        let y = u * u * start[1] + 2 * u * t * ctrl[1] + t * t * end[1];

        return [x, y];
      },
      bezierAngle(t) {
        let start = [200, 160];
        let end = [this.width - 200, 160];
        let ctrl = [this.width / 2, 50];

        let u = 1 - t;
        let x = (u * ctrl[0] + t * end[0]) - (u * start[0] + t * ctrl[0]);
        let y = (u * ctrl[1] + t * end[1]) - (u * start[1] + t * ctrl[1]);

        return 180 * Math.atan2(y, x) / Math.PI;
      },
      setPolygon(t, name) {
        let pos = this.bezierPosition(t);
        let angle = this.bezierAngle(t);

        this[name + "Pos"] = `${pos[0]} ${pos[1]}`;
        this[name + "Angle"] = angle;
      }
    }
  }
</script>
