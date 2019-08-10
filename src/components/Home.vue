<template lang="pug">
  v-flex(xs12 lg4)
    v-container(grid-list-xl)
      v-card
        v-card-title Overview
        v-card-text
          p Welcome to the <a href="https://ozramos.com/Posenet-head-pose">posenet-head-pose</a> project 👋
          p PoseNet Head Pose is a set of tiny models that takes in <a href="https://github.com/tensorflow/tfjs-models/tree/master/posenet">PoseNet keypoints</a> as input and outputs the inferred yaw, pitch, and roll for the users head (and soon arms as well).
          p This project will guide you through the process of training your own models. To begin, lets start by running PoseNet on the 3D scene.
        v-card-actions
          v-spacer
          v-btn.primary(@click='startPoseNet')
            | Start PoseNet
            v-icon(right) chevron_right
</template>

<script>
export default {
  name: "Home",

  methods: {
    startPoseNet() {}
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
