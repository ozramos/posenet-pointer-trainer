<template lang="pug">
  #scene-wrap
    canvas#scene(ref='scene' width=640 height=480)
    canvas#overlay(width=640 height=480)
</template>

<script>
import sceneSetup from "../lib/scene-setup.js";
const BABYLON = window.BABYLON;

export default {
  name: "Scene",

  mounted() {
    this.scene = new sceneSetup(this.$refs.scene);
  }
};
</script>


<style lang="stylus">
canvas {
  width: 100%;
  height: 100%;
  position: relative;
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
