<template lang="pug">
  v-app
    v-app-bar(app clipped-right color='indigo' dark)
      v-app-bar-nav-icon(@click='sidebar.main = !sidebar.main')
      v-toolbar-title PoseNet Pointer
      v-spacer
      v-btn.amber.darken-3(v-if='!posenet || !isInferring' @click='startPosenet' :loading='isLoading.posenet') Start PoseNet
      v-btn.error(v-else @click='stopPosenet') Stop PoseNet

    v-navigation-drawer(app v-model='sidebar.main')
      v-list(dense)
        v-list-item(v-for='(item, key) in menu' :key='key' :to='item.to')
          v-list-item-action
            v-icon {{item.icon}}
          v-list-item-content
            v-list-item-title {{item.label}}

    v-content
      v-container(grid-list-xl)
        v-layout(row wrap)
          Scene
          v-flex(xs12 sm6 lg8)
            v-container(grid-list-xl)
              router-view
</template>

<script>
import Scene from "./components/Scene";
import { mapState } from "vuex";

export default {
  name: "App",

  components: {
    Scene
  },

  computed: mapState(["isLoading", "posenet", "isInferring"]),

  data: () => ({
    sidebar: { main: true },
    menu: [
      { label: "About", icon: "info", to: { name: "Home" } },
      {
        label: "Step 1. Collect Data",
        icon: "memory",
        to: { name: "CollectData" }
      },
      { label: "Step 2. Train", icon: "school", to: { name: "Training" } },
      { label: "Step 3. Use Model", icon: "android", to: { name: "UseModel" } }
    ],
    Scene: Scene
  }),

  methods: {
    startPosenet() {
      this.Bus.$emit("startPosenet");
    },

    stopPosenet() {
      this.$store.commit("set", ["isInferring", false]);
    }
  }
};
</script>