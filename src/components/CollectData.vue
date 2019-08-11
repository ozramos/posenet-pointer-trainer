<template lang="pug">
v-flex(xs12 lg4)
  v-container(grid-list-xl)
    v-layout(row wrap)
      v-flex(:class='gridClasses')
        v-card
          v-card-title Step 1. Collect Synthetic Data
          v-card-text
            v-text-field(label='Number of Samples' v-model='numSamples' filled)
          v-card-actions
            v-btn(:to="{name: 'Home'}")
              v-icon chevron_left
              | About
            v-spacer
            v-btn.primary(v-if='!training.features.length' @click='collectData' v-bind:loading='isBusy')
              | Collect Data
              v-icon.ml-1 assignment
            v-btn.primary(v-else v-bind:to='{name: "Training"}')
              | Training
              v-icon.ml-1 chevron_right

      v-flex(v-if='training.features.length' v-bind:class='gridClasses')
        v-card.mt-3(color='green lighten-3')
          v-card-title (optional) Save Data
          v-card-text
            p You can persist the collected data either locally or as a file. Note that this is just the data, the model will be created in the following steps.
          v-card-actions
            v-btn.primary(@click='downloadJSON') Download
            v-spacer
            v-btn.primary(@click='saveTrainingToLocalStorage') localStorage

        //- Snackbars
        v-snackbar(v-model='snackbar.downloaded') Download complete
        v-snackbar(v-model='snackbar.savedJSON') Saving complete
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "CollectData",

  computed: {
    ...mapState(["posenet", "Scene", "training", "pose"]),
    gridClasses() {
      let classes = "xs12";
      if (this.training.features.length) {
        classes += " sm6 lg12";
      }
      return classes;
    }
  },

  mounted() {
    if (!this.posenet) {
      this.$router.push({ name: "Home" });
    }
  },

  data: () => ({
    isBusy: false,
    numSamples: 500,

    snackbar: {
      downloaded: false,
      savedJSON: false
    }
  }),

  methods: {
    /**
     * Loop numSamples, collecting data with each loop
     */
    collectData() {
      const numSamples = this.numSamples;
      let self = this;
      let curSampleIndex = 0;
      let training = { features: [], labels: [] };
      this.isBusy = true;

      this.Scene.use(function() {
        if (curSampleIndex < numSamples) {
          this.head.rotation.x = Math.asin(Math.random() - 0.5);
          this.head.rotation.y = Math.PI + Math.asin(Math.random() - 0.5);
          this.head.rotation.z = Math.asin((Math.random() - 0.5) / 2);

          this.head.position.x = Math.random() * 2000 - 1000;
          this.head.position.y = Math.random() * 2000 - 1000;
          this.head.position.z = Math.random() * -2000 - 1000;

          // Features [x1, y1...x5, y5]
          training.features.push([
            self.pose.keypoints[0].position.x / this.$canvas.width,
            self.pose.keypoints[0].position.y / this.$canvas.height,
            self.pose.keypoints[1].position.x / this.$canvas.width,
            self.pose.keypoints[1].position.y / this.$canvas.height,
            self.pose.keypoints[2].position.x / this.$canvas.width,
            self.pose.keypoints[2].position.y / this.$canvas.height,
            self.pose.keypoints[3].position.x / this.$canvas.width,
            self.pose.keypoints[3].position.y / this.$canvas.height,
            self.pose.keypoints[4].position.x / this.$canvas.width,
            self.pose.keypoints[4].position.y / this.$canvas.height
          ]);

          // Labels = [Pitch, Yaw, Roll]
          training.labels.push([
            this.head.rotation.x,
            this.head.rotation.y,
            this.head.rotation.z
          ]);
          // Enable save buttons
        } else if (curSampleIndex === numSamples) {
          self.isBusy = false;
          self.$store.commit("set", ["training", training]);
        }
        curSampleIndex++;
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