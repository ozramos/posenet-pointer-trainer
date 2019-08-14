<template lang="pug">
  v-app
    v-app-bar(app clipped-right color='indigo' dark)
      v-app-bar-nav-icon(@click='sidebar.main = !sidebar.main')
      v-toolbar-title
        router-link(:to='{name: "Home"}' style="color: #fff; text-decoration: none")
          span.mr-2 PoseNet Pointer
          small(style='font-size: 12px') v{{pkg.version}}
      v-spacer
      v-btn.amber.darken-3(v-if='!posenet || !isInferring' @click='startPosenet' :loading='isLoading.posenet') Start PoseNet
      v-btn.error(v-else @click='stopPosenet') Stop PoseNet

    v-navigation-drawer(app v-model='sidebar.main')
      v-list(dense)
        //- Main Menu
        v-list-group(value='true')
          template(v-slot:activator)
            v-list-item-action
              v-icon memory
            v-list-item-title Build a Model
          v-list-item(v-for='(item, key) in menu.main' :key='key' :to='item.to' :exact='item.exact')
            v-list-item-action
              v-icon {{item.icon}}
            v-list-item-content
              v-list-item-title {{item.label}}

        //- Demos
        v-list-group(value='')
          template(v-slot:activator)
            v-list-item-action
              v-icon videogame_asset
            v-list-item-title Demos
          v-list-item(v-for='(item, key) in menu.demos' :key='key' :to='item.to')
            v-list-item-action
              v-icon {{item.icon}}
            v-list-item-content
              v-list-item-title {{item.label}}

    v-content
      v-container(grid-list-xl)
        router-view
      v-container(grid-list-xl)
        Scene
</template>

<script>
import Scene from "./components/Scene";
import { mapState } from "vuex";
import pkg from "../package.json";

export default {
  name: "App",

  components: {
    Scene
  },

  computed: mapState(["isLoading", "posenet", "isInferring"]),

  // Load collected data if present
  mounted() {
    const data = localStorage.getItem("training");
    if (data) {
      this.$store.commit("set", ["training", JSON.parse(data)]);
    }
  },

  data: () => ({
    pkg,
    sidebar: { main: true },
    menu: {
      main: [
        { label: "About", icon: "info", to: { name: "Home" }, exact: true },
        {
          label: "Step 1. Collect Data",
          icon: "memory",
          to: { name: "CollectData" }
        },
        { label: "Step 2. Train", icon: "school", to: { name: "Training" } },
        {
          label: "Step 3. Check Model",
          icon: "search",
          to: { name: "CheckModel" }
        }
      ],

      demos: [
        {
          label: "Sandbox",
          icon: "beach_access",
          to: { name: "Sandbox" }
        }
      ]
    },
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