import Vue from "vue";
import App from "./App.vue";
import Vuetify from "vuetify";
import router from "./router";
import store from "./store";

import "vuetify/dist/vuetify.min.css";
import "./assets/styl/main.styl";

Vue.config.productionTip = false;
Vue.use(Vuetify);
Vue.prototype.Bus = new Vue();

window.App = new Vue({
  router,
  store,
  vuetify: new Vuetify({
    icons: { iconfont: "md" }
  }),
  render: h => h(App)
}).$mount("#app");
