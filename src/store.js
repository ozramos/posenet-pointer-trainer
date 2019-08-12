import Vue from "vue";
import Vuex from "vuex";
import { set } from "lodash";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // Different loading states
    isLoading: {
      posenet: false
    },

    // The posenet object
    posenet: null,

    // The last detected pose object
    pose: null,

    // The model
    model: null,

    // The Babylon.js scene class
    Scene: null,

    // Training data
    training: {
      features: [],
      labels: []
    },

    canvas: {
      width: 0,
      height: 0
    }
  },

  mutations: {
    /**
     * Helper for quickly mutating a specific set by state[key]
     * @param {*} state
     * @param {*} payload In the form [key, value]
     */
    set(state, payload) {
      set(state, payload[0], payload[1]);
    }
  }
});
