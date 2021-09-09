import { createApp, prototype } from "vue";
import store from "@/store/store.js";
import App from "@/App.vue";
import router from "@/router/router.js";
import "./../node_modules/bulma/css/bulma.css";

// https://v3.vuejs.org/guide/migration/filters.html#migration-strategy
// "Filters are removed from Vue 3.0 and no longer supported"
// Vue.filter('currency', currency)

const app = createApp(App).use(store).use(router);

app.mount("#app");
