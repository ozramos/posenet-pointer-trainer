<template lang="pug">
  #app
    v-app
      v-app-bar(app clipped-right color='indigo' dark)
        v-app-bar-nav-icon(@click.stop='sidebarMain = !sidebarMain')
        v-toolbar-title PoseNet Head Pose

      v-navigation-drawer(v-model='sidebarMain' app)
        Scene
        v-list(dense)
          v-list-item(v-for='(item, id) in menu' v-bind:key='id' v-bind:to='item.to')
            v-list-item-action
              v-icon {{item.icon}}
            v-list-item-content
              v-list-item-title {{item.label}}

      v-content
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