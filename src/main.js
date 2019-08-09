import "material-design-icons-iconfont/dist/material-design-icons.css";
import "vuetify/dist/vuetify.min.css";

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Vuetify from "vuetify";

Vue.config.productionTip = false;
Vue.use(Vuetify);

new Vue({
  router,
  vuetify: new Vuetify({
    icons: { iconfont: "md" }
  }),
  render: h => h(App)
}).$mount("#app");
