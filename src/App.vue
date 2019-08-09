<template lang="pug">
  #app
    v-app
      v-app-bar(app clipped-right color='indigo' dark)
        v-app-bar-nav-icon(@click.stop='sidebarMain = !sidebarMain')
        v-toolbar-title PoseNet Head Pose

      v-navigation-drawer(v-model='sidebarMain' app)
        Scene
        v-list(dense)
          v-list-item(v-for='(item, id) in menu' v-bind:key='id')
            v-list-item-action
              v-icon {{item.icon}}
            v-list-item-content
              v-list-item-title {{item.label}}
      Home
</template>

<script>
import Home from "./components/Home";
import Scene from "./components/Scene";

export default {
  name: "App",
  components: {
    Home,
    Scene
  },

  data: () => ({
    sidebarMain: true,
    menu: [
      { label: "Data", icon: "memory" },
      { label: "Train", icon: "school" },
      { label: "Use", icon: "android" },
      { label: "Webcam", icon: "videocam" }
    ],
    Scene: Scene
  })
};
</script>