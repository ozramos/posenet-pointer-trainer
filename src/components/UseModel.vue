<template lang="pug">
v-card
  v-card-title Use Model
  v-card-text
    h3
      strong.mr-2 Z-Distance:
      span {{predicted.z}}
  v-card-actions
    v-spacer
    v-btn.amber.darken-3(dark v-if='!posenet' @click='startPosenet' :loading='isBusy')
      | Start PoseNet
</template>

<script>
import { mapState } from "vuex";
import { getTrianglePerimeter } from "../lib/helpers";
import * as tf from "@tensorflow/tfjs";

export default {
  name: "UseModel",

  computed: mapState(["model", "posenet", "Scene", "pose", "canvas"]),

  data: () => ({
    isBusy: false,
    inferenceStarted: false,
    isReady: false,

    predicted: { z: 0 }
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

        this.Scene.use("inferPose", () => {
          tf.tidy(() => {
            if (!this.pose) return;

            const perimeter = tf.tensor2d(
              [getTrianglePerimeter(this.pose, [0, 1, 2])],
              [1, 1]
            );

            const z = this.model.predict(perimeter).dataSync();
            this.predicted.z = `${z}`;
          });
        });
      }
    }
  }
};
</script>