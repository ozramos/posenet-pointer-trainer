<template lang="pug">
v-layout.p0(row wrap)
  v-flex(xs12 md6 lg4)
    v-card
      v-card-title Webcam
      v-card-text
        #webcam-wrap
          video#webcam(ref='webcam' width=640 height=480)
          canvas#webca-overlay(ref='overlay' width=640 height=480)
      v-card-actions
        v-spacer
        v-btn.primary(v-if='!isWebcamOn' :loading='isLoading.posenet' @click='startWebcam')
          v-icon.mr-2 videocam
          | Start Webcam
        v-btn.error(v-else @click='stopWebcam') Stop Webcam
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Sandbox",

  computed: mapState(["isWebcamOn", "isLoading", "$inferTarget"]),

  methods: {
    /**
     * Starts a new media stream
     */
    startWebcam() {
      window.navigator.mediaDevices
        .getUserMedia({
          video: {
            width: 640,
            height: 480
          }
        })
        .then(stream => {
          this.$refs.webcam.srcObject = stream;
          this.$refs.webcam.play();
          this.$store.commit("set", ["$inferTarget", this.$refs.webcam]);
          this.$store.commit("set", [
            "$inferCtx",
            this.$refs.overlay.getContext("2d")
          ]);
          this.$store.commit("set", ["isWebcamOn", true]);
        });

      this.Bus.$emit("startPosenet");
    },

    /**
     * Kills the media stream
     */
    stopWebcam() {
      this.debug.$webcam.srcObject.getTracks().forEach(track => track.stop());
      this.$store.commit("set", ["isWebcamOn", false]);
    }
  }
};
</script>

<style lang="stylus">
video, canvas {
  width: 100%;
  height: 100%;
  position: relative;
  transform: scale(-1, 1);
}

#webcam-wrap {
  position: relative;
}

#webca-overlay {
  position: absolute;
  top: 0;
  left: 0;
}
</style>