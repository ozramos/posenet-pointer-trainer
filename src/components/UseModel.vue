<template lang="pug">
v-flex(xs12 lg4)
  v-container(grid-list-xl)
    v-card
      v-card-title Use Model
      v-card-actions
        v-btn.primary(v-if='!posenet' @click='startPosenet' :loading='isBusy')
          | Start PoseNet
          v-icon chevron_right      
</template>

<script>
import { mapState } from "vuex";
import * as tf from "@tensorflow/tfjs";

export default {
  name: "UseModel",

  computed: mapState(["model", "posenet", "Scene", "pose", "canvas"]),

  data: () => ({
    isBusy: false,
    inferenceStarted: false,
    isReady: false
  }),

  watch: {
    /**
     * Start infering
     */
    isReady(isReady) {
      if (isReady && this.posenet) {
        this.startInference();
      }
    },

    posenet(isReady) {
      if (isReady && this.posenet) {
        this.startInference();
      }
    }
  },

  /**
   * Autoload model from localstorage if it's not in the store
   */
  mounted() {
    this.Bus.$on("PoseNetStarted", this.onPoseNetStarted);

    if (this.model) {
      this.isReady = true;
    } else {
      this.loadFromLocalStorage();
    }
  },

  methods: {
    async loadFromLocalStorage() {
      try {
        const model = await tf.loadLayersModel("localstorage://posenetPointer");
        this.$store.commit("set", ["model", model]);
        this.isReady = true;
      } catch (e) {
        console.log("No model found");
      }
    },

    /**
     * Called when "Start PoseNet" is clicked
     */
    startPosenet() {
      this.isBusy = true;
      this.Bus.$emit("startPosenet");
    },

    /**
     * Navigates to the next vue
     */
    onPoseNetStarted() {
      this.isBusy = false;
    },

    startInference() {
      if (!this.inferenceStarted) {
        this.inferenceStarted = true;

        this.Scene.use(() => {
          tf.tidy(() => {
            if (!this.pose) return;

            const pose = tf.tensor2d(
              [
                this.pose.keypoints[0].position.x / this.canvas.width,
                this.pose.keypoints[0].position.y / this.canvas.height,
                this.pose.keypoints[1].position.x / this.canvas.width,
                this.pose.keypoints[1].position.y / this.canvas.height,
                this.pose.keypoints[2].position.x / this.canvas.width,
                this.pose.keypoints[2].position.y / this.canvas.height,
                this.pose.keypoints[3].position.x / this.canvas.width,
                this.pose.keypoints[3].position.y / this.canvas.height,
                this.pose.keypoints[4].position.x / this.canvas.width,
                this.pose.keypoints[4].position.y / this.canvas.height
              ],
              [1, 10]
            );

            const prediction = this.model.predict(pose);
            console.log("Rotation X", (prediction.dataSync() * 180) / Math.PI);
          });
        });
      }
    }
  }
};
</script>