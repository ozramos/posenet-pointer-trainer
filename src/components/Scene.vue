<template lang="pug">
v-layout.p0(row wrap)
  v-flex(xs12 md6 lg4)
    v-card
      v-card-title Synthetic Scene
      v-card-text
        #scene-wrap
          canvas#scene(ref='scene' width=640 height=480)
          canvas#overlay(ref='overlay' width=640 height=480)

  v-flex(xs12 md6 lg4)
    v-card
      v-card-title Rotation
      v-card-text
        v-slider(step=0 v-model='synthetic.pitch' label='Pitch' :min='-35' :max='35')
          template(v-slot:append)
            v-text-field(v-model='synthetic.pitch' type='number' style='width: 60px')
        v-slider(step=0 v-model='synthetic.yaw' label='Yaw' :min='-35' :max='35')
          template(v-slot:append)
            v-text-field(v-model='synthetic.yaw' type='number' style='width: 60px')
        v-slider(step=0 v-model='synthetic.roll' label='Roll' :min='-35' :max='35')
          template(v-slot:append)
            v-text-field(v-model='synthetic.roll' type='number' style='width: 60px')
      v-card-actions
        v-spacer
        v-btn.primary(@click='resetRotations') Reset

  v-flex(xs12 md6 lg4)
    v-card
      v-card-title Position
      v-card-text
        v-slider(step=0 v-model='synthetic.x' label='x' :min='-5' :max='5')
          template(v-slot:append)
            v-text-field(v-model='synthetic.x' type='number' style='width: 60px')
        v-slider(step=0 v-model='synthetic.y' label='y' :min='-3' :max='3')
          template(v-slot:append)
            v-text-field(v-model='synthetic.y' type='number' style='width: 60px')
        v-slider(step=0 v-model='synthetic.z' label='z' :min='-11' :max='-1')
          template(v-slot:append)
            v-text-field(v-model='synthetic.z' type='number' style='width: 60px')
      v-card-actions
        v-spacer
        v-btn.primary(@click='resetPositions') Reset
  v-snackbar(v-model='snackbar.isVisible') {{snackbar.message}}
</template>

<script>
import sceneSetup from "../lib/scene-setup.js";
import * as Posenet from "@tensorflow-models/posenet";
import { mapState } from "vuex";

export default {
  name: "Scene",

  computed: mapState(["posenet", "Scene", "pose", "isLoading", "isInferring"]),

  watch: {
    "synthetic.yaw"(val) {
      this.Scene.head.rotation.y = (-val * Math.PI) / 180;
    },
    "synthetic.pitch"(val) {
      this.Scene.head.rotation.x = (-val * Math.PI) / 180;
    },
    "synthetic.roll"(val) {
      this.Scene.head.rotation.z = (-val * Math.PI) / 180;
    },
    "synthetic.x"(val) {
      this.Scene.head.position.x = -val;
    },
    "synthetic.y"(val) {
      this.Scene.head.position.y = val;
    },
    "synthetic.z"(val) {
      this.Scene.head.position.z = val;
    },

    /**
     * Always clear the last frame onchange
     */
    isInferring() {
      setTimeout(() => {
        this.ctx.clearRect(
          0,
          0,
          this.$refs.overlay.width,
          this.$refs.overlay.height
        );
        // @todo this is smelly
      }, 100);
    }
  },

  data: () => ({
    // The drawing context for posenet keypoints
    ctx: null,

    snackbar: {
      message: "",
      isVisible: false
    },

    // Synthetic data
    synthetic: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      x: 0,
      y: 0,
      z: -1
    }
  }),

  mounted() {
    this.ctx = this.$refs.overlay.getContext("2d");
    this.$store.commit("set", ["Scene", new sceneSetup(this.$refs.scene)]);

    // Events
    this.Bus.$on("startPosenet", this.maybeStartPosenet);
  },

  methods: {
    maybeStartPosenet() {
      if (this.posenet) {
        this.$store.commit("set", ["isInferring", true]);
      } else {
        this.startPosenet();
      }
    },

    /**
     * Starts posenet and draws keypoints on every frame
     */
    async startPosenet() {
      let dimensions = { width: 0, height: 0 };
      let hasError = false;

      // Load posenet and bail if no connection
      this.$store.commit("set", ["isLoading.posenet", true]);
      try {
        this.$store.commit("set", ["posenet", await new Posenet.load()]);
      } catch (e) {
        hasError = true;
        this.snackbar.message = `😔 Error loading posenet, please try again => ${e}`;
        this.snackbar.isVisible = true;
        this.Bus.$emit("posenetLoadError");
      }
      this.$store.commit("set", ["isLoading.posenet", false]);
      this.$store.commit("set", ["isInferring", true]);
      if (hasError) return;
      this.Bus.$emit("PoseNetStarted");

      // Make sure overlay's canavas matches babylon's
      dimensions.width = this.$refs.overlay.width = this.$refs.scene.width;
      dimensions.height = this.$refs.overlay.height = this.$refs.scene.height;
      this.$store.commit("set", ["canvas", dimensions]);

      this.Scene.use("getPose", async () => {
        if (this.isInferring) {
          this.$store.commit("set", [
            "pose",
            await this.posenet.estimateSinglePose(this.$refs.scene)
          ]);
          this.drawKeypoints();
        }
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
    },

    resetRotations() {
      this.synthetic.pitch = Math.random();
      this.synthetic.yaw = Math.random();
      this.synthetic.roll = Math.random();
      this.$nextTick(() => {
        this.synthetic.pitch = 0;
        this.synthetic.yaw = 0;
        this.synthetic.roll = 0;
      });
    },
    resetPositions() {
      this.synthetic.x = Math.random();
      this.synthetic.y = Math.random();
      this.synthetic.z = Math.random();
      this.$nextTick(() => {
        this.synthetic.x = 0;
        this.synthetic.y = 0;
        this.synthetic.z = -1;
      });
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
