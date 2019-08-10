<template lang="pug">
  #app
    v-app
      v-app-bar(app clipped-right color='indigo' dark)
        v-container
          v-toolbar-title PoseNet Head Pose

      v-content
        v-container(grid-list-xl)
          v-layout(row wrap)
            Scene
            router-view
</template>

<script>
import Scene from "./components/Scene";

export default {
  name: "App",
  components: {
    Scene
  },

  data: () => ({
    sidebarMain: true,
    menu: [
      { label: "About", icon: "info", to: { name: "Home" } },
      {
        label: "Step 1. Collect Data",
        icon: "memory",
        to: { name: "CollectData" }
      },
      { label: "Step 2. Train", icon: "school" },
      { label: "Step 3. Use", icon: "android" }
    ],
    Scene: Scene
  })
};
</script>