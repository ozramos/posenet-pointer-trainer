<template lang="pug">
  v-flex(xs12 lg8)
    v-container(grid-list-xl)
      v-layout(row wrap)
        v-flex(xs12 sm6)
          v-card
            v-card-title Synthetic Scene
            v-card-text
              #scene-wrap
                canvas#scene(ref='scene' width=640 height=480)
                canvas#overlay(ref='overlay' width=640 height=480)

        v-flex(xs12 sm6)
          v-card
            v-card-title Adjustments
            v-card-text
              v-slider(v-model='synthetic.yaw' label='Yaw' v-bind:max='360')
                template(v-slot:append)
                  v-text-field(v-model='synthetic.yaw' type='number' style='width: 60px')
              v-slider(v-model='synthetic.pitch' label='Pitch' v-bind:max='360')
                template(v-slot:append)
                  v-text-field(v-model='synthetic.pitch' type='number' style='width: 60px')
              v-slider(v-model='synthetic.roll' label='Roll' v-bind:max='360')
                template(v-slot:append)
                  v-text-field(v-model='synthetic.roll' type='number' style='width: 60px')
</template>

<script>
import sceneSetup from "../lib/scene-setup.js";
import * as Posenet from "@tensorflow-models/posenet";
import { mapState } from "vuex";

export default {
  name: "Scene",

  computed: mapState(["posenet", "Scene", "pose"]),

  watch: {
    "synthetic.yaw"(val) {
      this.Scene.head.rotation.y = (-val * Math.PI) / 180;
    },
    "synthetic.pitch"(val) {
      this.Scene.head.rotation.x = (-val * Math.PI) / 180;
    },
    "synthetic.roll"(val) {
      this.Scene.head.rotation.z = (-val * Math.PI) / 180;
    }
  },

  data: () => ({
    // The drawing context for posenet keypoints
    ctx: null,

    // Active states
    isBusy: false,

    // Synthetic data
    synthetic: {
      yaw: 180,
      pitch: 0,
      roll: 0
    }
  }),

  mounted() {
    this.ctx = this.$refs.overlay.getContext("2d");
    this.$store.commit("set", ["Scene", new sceneSetup(this.$refs.scene)]);

    // Events
    this.Bus.$on("startPoseNet", this.startPoseNet);
  },

  methods: {
    /**
     * Starts posenet and draws keypoints on every frame
     */
    async startPoseNet() {
      // Load posenet
      this.isBusy = true;
      this.$store.commit("set", ["posenet", await new Posenet.load()]);
      this.Bus.$emit("PoseNetStarted");
      this.isBusy = false;

      // Make sure overlay's canavas matches babylon's
      this.$refs.overlay.width = this.$refs.scene.width;
      this.$refs.overlay.height = this.$refs.scene.height;

      this.Scene.use(async () => {
        this.$store.commit("set", [
          "pose",
          await this.posenet.estimateSinglePose(this.$refs.scene)
        ]);
        this.drawKeypoints();
      });
    },

    /**
     * Draws the detected keypoints
     */
    drawKeypoints() {
      this.ctx.fillStyle = "#f0f";
      this.ctx.clearRect(
        0,
        0,
        this.$refs.overlay.width,
        this.$refs.overlay.height
      );
      for (let i = 0; i < 5; i++) {
        // @TODO make this configurable
        if (this.pose.keypoints[i].score > 0.7) {
          this.ctx.beginPath();
          this.ctx.arc(
            this.pose.keypoints[i].position.x,
            this.pose.keypoints[i].position.y,
            10,
            0,
            2 * Math.PI
          );
          this.ctx.fill();
        }
      }
    }
  }
};
</script>


<style lang="stylus">
canvas {
  width: 100%;
  height: 100%;
  position: relative;
}

#babylonjsLoadingDiv {
  display: none !important;
}

#scene-wrap {
  position: relative;
}

#overlay {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
