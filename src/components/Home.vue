<template lang="pug">
  v-container(fluid grid-list-xl)
    v-layout(row wrap)
      v-flex(xs12 md6)
        v-card
          v-card-title About
          v-card-text
            p Welcome to the <a href="https://ozramos.com/Posenet-head-pose">posenet-head-pose</a> project. PoseNet Head Pose is a set of tiny models that takes in <a href="https://github.com/tensorflow/tfjs-models/tree/master/posenet">PoseNet keypoints</a> as input and outputs the inferred head's yaw, pitch, and roll.
</template>

<script>
export default {
  name: "Home"
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
