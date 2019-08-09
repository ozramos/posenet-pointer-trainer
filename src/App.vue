<template lang="pug">
  #app
    v-app
      v-app-bar(app clipped-right color='blue-grey' dark)
        v-app-bar-nav-icon(@click.stop='sidebarMain = !sidebarMain')
        v-toolbar-title PoseNet Head Pose

      v-navigation-drawer(v-model='sidebarMain' app)
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

export default {
  name: "App",
  components: {
    Home
  },

  data: () => ({
    sidebarMain: true,
    menu: [
      { label: "Data", icon: "memory" },
      { label: "Train", icon: "school" },
      { label: "Use", icon: "android" },
      { label: "Webcam", icon: "videocam" }
    ]
  })
};
</script>