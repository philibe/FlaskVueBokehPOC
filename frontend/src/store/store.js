import { createStore } from "vuex";
import modprodsinus from "./modules/modprodsinus/modprodsinus.js";

// https://www.digitalocean.com/community/tutorials/how-to-build-a-shopping-cart-with-vue-3-and-vuex

export default createStore({
  modules: {
    modprodsinus,
  },
});
