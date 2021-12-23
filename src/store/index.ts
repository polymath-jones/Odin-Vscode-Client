import { Toolspace } from '@/services/toolspace';
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
      "float": undefined,
      "padding": undefined
    },
    currentStyleSource: "",
    currentStyleState: "",
    viewData: {
      panelsVisiblity: {
        left: true,
        right: true,
        hideAll: false
      },
      windowConstriants: {
        min: 0,
        max: 0
      },
      windowContainerSize: 0,
      appState: {
        disabled: false,
        interactive: true,
        message: ""
      },
      windowScale: 1.0
    }
  },
  mutations: {
    setData(state, payload) {
      Object.assign(state.data, payload);
    },
    setWindowConstraints(state, payload) {
      state.viewData.windowConstriants = payload
      if (Toolspace.isInstantiated())
        Toolspace.getInstance().updateUIState(true)
    },
    setContainerSize(state, payload) {
      state.viewData.windowContainerSize = payload
    },
    setPanelsVisibility(state, payload) {
      state.viewData.panelsVisiblity = payload
    },
    setAppState(state, payload) {
      state.viewData.appState = payload
    },
    setWindowScale(state, payload) {
      state.viewData.windowScale = payload
    },
    setStyleSource(state, payload) {
      state.currentStyleSource = payload
    },
    setStyleState(state, payload) {
      state.currentStyleState = payload
    }
  },
  actions: {
  },
  modules: {
  }
})
