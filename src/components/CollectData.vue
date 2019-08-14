<template lang="pug">
div
  v-card
    v-card-title Step 1. Collect Synthetic Data
    v-card-text
      v-text-field(label='Number of Samples' v-model='numSamples' filled)
    v-card-actions
      v-btn(:to="{name: 'Home'}")
        v-icon chevron_left
        | About
      v-spacer
      v-btn.primary(@click='collectData' :loading='isBusy')
        | Collect Data
        v-icon.ml-1 assignment
      v-btn.primary(v-if='training.features.length' :to='{name: "Training"}')
        | Training
        v-icon.ml-1 chevron_right

  v-card.mt-3(v-if='training.features.length' color='green lighten-3')
    v-card-title (optional) Save Data
    v-card-text
      p You can persist the collected data either locally or as a file. Note that this is just the data, the model will be created in the following steps.
    v-card-actions
      v-btn.primary(@click='downloadJSON')
        v-icon.mr-2 save_alt
        | Download
      v-spacer
      v-btn.primary(@click='saveTrainingToLocalStorage')
        v-icon.mr-2 save
        | localStorage

  //- Snackbars
  v-snackbar(v-model='snackbar.downloaded') Download complete
  v-snackbar(v-model='snackbar.savedJSON') Saving complete
</template>

<script>
import { mapState } from "vuex";
import { getTrianglePerimeter } from "../lib/helpers";

export default {
  name: "CollectData",

  computed: {
    ...mapState(["posenet", "Scene", "training", "isLoading", "pose"]),

    isBusy() {
      return this.isCollecting || this.isLoading.posenet;
    }
  },

  data: () => ({
    isCollecting: false,
    numSamples: 500,

    snackbar: {
      downloaded: false,
      savedJSON: false
    }
  }),

  mounted() {
    this.Bus.$on("posenetLoadError", () => {
      this.isCollecting = false;
    });
  },

  methods: {
    /**
     * Loop numSamples, collecting data with each loop
     * - Clears existing data
     * - Autostarts posenet if it's not already started
     */
    collectData() {
      let self = this;
      let curSampleIndex = 0;
      let training = { features: [], labels: [] };

      localStorage.removeItem("training");
      this.Bus.$emit("startPosenet");
      this.isCollecting = true;

      this.Bus.$on("newPose", pose => {
        if (!this.isCollecting) return;

        if (curSampleIndex < self.numSamples) {
          if (self.hasValidKeypoints(pose)) {
            curSampleIndex++;

            // Normalized features [x1, y1...x5, y5]
            training.features.push([getTrianglePerimeter(pose, [0, 1, 2])]);
            // Labels = distance from screen
            training.labels.push([-this.Scene.head.position.z]);
          }

          this.Scene.head.rotation.x =
            ((Math.random() * 70 - 35) * Math.PI) / 180;
          this.Scene.head.rotation.y =
            ((Math.random() * 70 - 35) * Math.PI) / 180;
          this.Scene.head.rotation.z =
            ((Math.random() * 70 - 35) * Math.PI) / 180;

          this.Scene.head.position.x = Math.random() * -10 + 5;
          this.Scene.head.position.y = Math.random() * -6 + 3;
          this.Scene.head.position.z = Math.random() * -20;

          // Enable save buttons
        } else {
          self.isCollecting = false;
          self.$store.commit("set", ["training", training]);
        }
      });
    },

    /**
     * Saves training data to localStorage
     */
    saveTrainingToLocalStorage() {
      localStorage.setItem("training", JSON.stringify(this.training));
      this.snackbar.savedJSON = true;
    },

    /**
     * Determines if the current pose has at least one keypoint
     */
    hasValidKeypoints(pose) {
      const keypoints = pose.keypoints.slice(0, 5);
      return keypoints.some(point => point.score > 0.7);
    },

    /**
     * Downloads trainining data
     */
    downloadJSON() {
      let $a = document.createElement("a");
      let file = new Blob([JSON.stringify(this.training)], {
        type: "application/json"
      });
      $a.href = URL.createObjectURL(file);
      $a.download = `posenet-cursor-training-${this.training.labels.length}.json`;
      $a.click();
      $a.remove();
      this.snackbar.downloaded = true;
    }
  }
};
</script>