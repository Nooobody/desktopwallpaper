<template>
  <div class="visualizer-wrapper">
    <div ref="canvas"></div>
  </div>
</template>

<script>
  import * as THREE from "three";

  export default {
    props: ["analyser", "settings", "gaming"],
    data() {
      return {
        scene: undefined,
        camera: undefined,
        renderer: undefined,
        cube: undefined,
        lines: [],
        lineAmount: 1024,
        playing: true
      }
    },
    watch: {
      settings(newV, oldV) {
        if (!newV.disabled && !this.playing) {
          this.animate();
          this.playing = true;
        }
      },
      gaming(newV, oldV) {
        if (!newV) {
          this.animate();
          this.playing = true;
        }
      }
    },
    methods: {
      calculatePoint(radius, angle) {
        let radian = angle * (Math.PI / 180);
        return {
          x: Math.sin(radian) * radius,
          y: Math.cos(radian) * radius,
          z: 0
        }
      },
      init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 33, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.$refs.canvas.appendChild(this.renderer.domElement);

        let material = new THREE.LineBasicMaterial({color: 0xffffff, vertexColors: THREE.VertexColors});

        for (let i = 0; i < this.lineAmount; i++) {

          let angle = (360 / this.lineAmount) * i;

          let point = this.calculatePoint(3, angle);
          let secondPoint = this.calculatePoint(3.05, angle);

          let geo = new THREE.Geometry();
          geo.vertices.push(point);
          geo.vertices.push(secondPoint);

          geo.colors.push(new THREE.Color(0x8b14de));
          geo.colors.push(new THREE.Color(0x1d92d4));

          let line = new THREE.Line(geo, material);
          this.lines.push(line);
          this.scene.add(line);
        }
        console.log(this.lines[0]);

        this.camera.position.z = 5;
        this.camera.position.y = -10;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);

        this.animate();
      },
      animate(timestamp) {
        if ((this.settings && this.settings.disabled) || this.gaming) {
          console.log("Stopping!");
          this.renderer.clear();
          this.playing = false;
          return;
        }
        window.requestAnimationFrame(this.animate);

        let waveform = [];
        if (this.analyser) {  // Analyser can be undefined.
          waveform = this.analyser.frequencies();
          if (!waveform) {  // Funky stuff?
            waveform = [];
          }
        }

        for (let i = 0; i < this.lineAmount / 2; i++) {
          let wave = (waveform[i] / 255) * 5;
          {
            let angle = (360 / this.lineAmount) * i;

            //let point = this.calculatePoint(3.05 + wave, angle);

            //this.lines[i].geometry.vertices[1] = point;
            this.lines[i].geometry.vertices[1].z = wave;
            this.lines[i].geometry.verticesNeedUpdate = true;

            // this.lines[i].geometry.colors[0].offsetHSL(0.001, 0, 0);
            // this.lines[i].geometry.colors[1].offsetHSL(-0.001, 0, 0);
            //
            // this.lines[i].geometry.colorsNeedUpdate = true;
          }

          let halfI = this.lineAmount - (i + 1);
          {
            let angle = (360 / this.lineAmount) * halfI;

            //let point = this.calculatePoint(3.05 + wave, angle);

            //this.lines[halfI].geometry.vertices[1] = point;
            this.lines[halfI].geometry.vertices[1].z = wave;
            this.lines[halfI].geometry.verticesNeedUpdate = true;

            // this.lines[halfI].geometry.colors[0].offsetHSL(0.001, 0, 0);
            // this.lines[halfI].geometry.colors[1].offsetHSL(-0.001, 0, 0);
            //
            // this.lines[halfI].geometry.colorsNeedUpdate = true;
          }
        }

        this.renderer.render(this.scene, this.camera);
      }
    },
    mounted() {
      this.init();
    }
  }
</script>
