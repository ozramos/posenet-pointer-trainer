import Vue from "vue";
import Router from "vue-router";
import Home from "./components/Home";
import CollectData from "./components/CollectData";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home
    },
    {
      path: "/collect-data",
      name: "CollectData",
      component: CollectData
    }
  ]
});
