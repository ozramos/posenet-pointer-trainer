import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // The posenet object
    posenet: null
  },

  mutations: {
    /**
     * Helper for quickly mutating a specific set by state[key]
     * @param {*} state
     * @param {*} payload In the form [key, value]
     */
    set(state, payload) {
      this.state[payload[0]] = payload[1];
    }
  }
});
