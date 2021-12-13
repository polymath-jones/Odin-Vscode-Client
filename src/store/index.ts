import { createStore } from 'vuex'

export default createStore({
  state: {
    data: {
      "display": undefined,
      "flex-basis": undefined,
      "flex-direction": undefined,
      "flex-grow": undefined,
      "flex-shrink": undefined,
      "flex-wrap": undefined,
      "float": undefined
    },
    viewData: {
      showPanels: true,
      windowBreakpoints: {
        min: 0,
        max: 0
      }
    }
  },
  mutations: {
    setData(state, payload) {
      Object.assign(state.data, payload);
    }
  },
  actions: {
  },
  modules: {
  }
})
