<template lang="pug">
v-flex(xs12 lg4)
  v-container(grid-list-xl)
    v-card
      v-card-title Use Model
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "UseModel",

  computed: mapState(["model"]),

  /**
   * Autoload model from localstorage if it's not in the store
   */
  mounted() {
    if (!this.model) {
      console.log("need to load from localstorage");
    }
  }
};
</script>