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
        v-slider(step=0 v-model='synthetic.z' label='z' :min='0' :max='20')
          template(v-slot:append)
            v-text-field(v-model='synthetic.z' type='number' style='width: 60px')
      v-card-actions
        v-spacer
        v-btn.primary(@click='resetPositions') Reset
  v-snackbar(v-model='snackbar.isVisible') {{snackbar.message}}
</template>

<script>
import sceneSetup from "../assets/js/scene-setup.js";
import * as Posenet from "@tensorflow-models/posenet";
import { mapState } from "vuex";

export default {
  name: "Scene",

  computed: mapState([
    "posenet",
    "Scene",
    "pose",
    "isLoading",
    "isInferring",
    "$inferTarget",
    "$inferCtx"
  ]),

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
      this.Scene.head.position.z = -val;
    },

    /**
     * Always clear the last frame onchange
     */
    isInferring() {
      setTimeout(() => {
        this.$inferCtx.clearRect(
          0,
          0,
          this.$inferTarget.width,
          this.$inferTarget.height
        );
        // @todo this is smelly
      }, 100);
    }
  },

  data: () => ({
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
      z: 0
    }
  }),

  mounted() {
    this.$store.commit("set", ["Scene", new sceneSetup(this.$refs.scene)]);
    this.$store.commit("set", ["$inferTarget", this.$refs.scene]);
    this.$store.commit("set", [
      "$inferCtx",
      this.$refs.overlay.getContext("2d")
    ]);

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
      dimensions.width = this.$refs.overlay.width = this.$inferCtx.width = this.$refs.scene.width;
      dimensions.height = this.$refs.overlay.height = this.$inferCtx.height = this.$refs.scene.height;
      console.log(dimensions.width);
      this.$store.commit("set", ["canvas", dimensions]);

      // Use PoseNet
      this.Scene.use("getPose", async () => {
        if (this.isInferring) {
          const newPose = await this.posenet.estimateSinglePose(
            this.$inferTarget
          );
          this.$store.commit("set", ["pose", newPose]);

          this.$nextTick(() => {
            this.Bus.$emit("newPose", newPose);
          });
          this.drawKeypoints();
        }
      });
    },

    /**
     * Draws the detected keypoints
     */
    drawKeypoints() {
      this.$inferCtx.fillStyle = "#f0f";
      this.$inferCtx.clearRect(
        0,
        0,
        this.$refs.overlay.width,
        this.$refs.overlay.height
      );
      for (let i = 0; i < 5; i++) {
        // @TODO make this configurable
        if (this.pose.keypoints[i].score > 0.7) {
          this.$inferCtx.beginPath();
          this.$inferCtx.arc(
            this.pose.keypoints[i].position.x,
            this.pose.keypoints[i].position.y,
            8,
            0,
            2 * Math.PI
          );
          this.$inferCtx.fill();
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
