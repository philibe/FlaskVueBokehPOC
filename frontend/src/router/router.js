import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import About from "@/pages/About.vue";
import About2Comp from "@/pages/About2Comp.vue";

import prodsinuspage from "@/pages/ProdSinusPage.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/about2",
    name: "About2",
    component: About2Comp,
  },
  {
    path: "/prodsinuspage",
    name: "prodsinuspage",
    component: prodsinuspage,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
