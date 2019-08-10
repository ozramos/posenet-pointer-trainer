<template lang="pug">
v-flex(xs12 lg4)
  v-container(grid-list-xl)
    v-card
      v-card-title Step 1. Collect Synthetic Data
      v-card-text
        v-text-field(label='Number of Samples' :value='numSamples' filled)
      v-card-actions
        v-btn(:to="{name: 'Home'}")
          v-icon chevron_left
          | About
        v-spacer
        v-btn.primary(v-if='!training.features.length' @click='collectData' :loading='isBusy')
          | Collect Data
          v-icon.ml-1 assignment
        v-btn.primary(v-else)
          | Training
          v-icon.ml-1 chevron_right
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "CollectData",

  computed: mapState(["posenet", "Scene", "training", "pose"]),

  mounted() {
    if (!this.posenet) {
      this.$router.push({ name: "Home" });
    }
  },

  data: () => ({
    isBusy: false,
    numSamples: 500
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
    }
  }
};
</script>