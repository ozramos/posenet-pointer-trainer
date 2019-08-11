import Vue from "vue";
import Router from "vue-router";
import Home from "./components/Home";
import CollectData from "./components/CollectData";
import Training from "./components/Training";

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
    },
    {
      path: "/training",
      name: "Training",
      component: Training
    }
  ]
});
