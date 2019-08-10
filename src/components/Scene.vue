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
                canvas#overlay(width=640 height=480)

            v-card-actions
              v-btn.primary(@click='startPoseNet' :loading='isBusy' v-if='!posenet') Start PoseNet

        v-flex(xs12 sm6)
          v-card
            v-card-title Adjustments
            v-card-text
              v-slider(v-model='yaw' label='Yaw' :max='360')
                template(v-slot:append)
                  v-text-field(v-model='yaw' type='number' style='width: 60px')
              v-slider(v-model='pitch' label='Pitch' :max='360')
                template(v-slot:append)
                  v-text-field(v-model='pitch' type='number' style='width: 60px')
              v-slider(v-model='roll' label='Roll' :max='360')
                template(v-slot:append)
                  v-text-field(v-model='roll' type='number' style='width: 60px')
</template>

<script>
import sceneSetup from "../lib/scene-setup.js";
//import * as tf from '@tensorflow/tfjs'
import * as Posenet from '@tensorflow-models/posenet'

export default {
  name: "Scene",

  data: () => ({
    // Active states
    isBusy: false,

    // Posenet model
    posenet: null,

    // Pose
    yaw: 0,
    pitch: 0,
    roll: 0,

    // The babylon scene class
    Scene: null
  }),

  mounted() {
    this.Scene = new sceneSetup(this.$refs.scene);
  },

  methods: {
    async startPoseNet () {
      this.isBusy = true
      this.posenet = new Posenet.load()
      this.isBusy = false

      this.Scene.use(function () {
        console.log('yo')
      })
    }
  }
};
</script>


<style lang="stylus">
canvas
  width 100%
  height 100%
  position relative


#babylonjsLoadingDiv
  display none !important

#scene-wrap
  position relative

#overlay
  position absolute
  top 0
  left 0
</style>
