import apisinus from "@/api/apisinus.js";

// initial state
const state = {
  bokehinlinejs: [],
  datasinus: [],
};

const getters = {
  datasinus: (state) => {
    return state.datasinus;
  },
};

// https://github.com/vuejs/vuex/tree/4.0/examples/composition/shopping-cart

// actions
const actions = {
  GetBokehinlinejs({ commit }) {
    apisinus.apiGetBokehinlinejs((bokehinlinejs) => {
      commit("setBokehinlinejs", bokehinlinejs);
    });
  },
  GetDataSinus({ commit }) {
    apisinus.apiGetDatasinus((datasinus) => {
      commit("setDataSinus", datasinus);
    });
  },
};

// mutations
const mutations = {
  setBokehinlinejs(state, bokehinlinejs) {
    state.bokehinlinejs = bokehinlinejs;
  },
  setDataSinus(state, datasinus) {
    state.datasinus = datasinus;
  },
};

const modprodsinus = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default modprodsinus;
