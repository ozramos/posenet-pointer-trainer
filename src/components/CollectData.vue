<template lang="pug">
v-container(fluid grid-list-xl)
  v-layout(row wrap)
    v-flex(xs12 md6)
      v-card
        v-card-title Step 1. Collect Synthetic Data
        v-card-text
          p Because we're using <a href="https://github.com/tensorflow/tfjs-models/tree/master/posenet">PoseNet</a> we won't need to worry about a background or even the head - we just need to make sure that PoseNet can detect the model.
        v-card-actions
          v-btn(:to="{name: 'Home'}")
            v-icon chevron_left
            | About
          v-spacer
          v-btn.primary
            | Collect Synthetic Data
            v-icon(right) chevron_right
</template>

<script>
export default {
  name: "CollectData"
};
</script>