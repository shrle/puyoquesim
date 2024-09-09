import { createRouter, createWebHistory } from "vue-router";
import MainView from "@/views/MainView.vue";

const routes = [
  {
    path: "/",
    name: "main",
    meta: { title: "ぷよクエ練習シミュレータ - new" },
    component: MainView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

const DEFAULT_TITLE = "puyosim";
router.afterEach((to) => {
  const title = to.meta.title ? to.meta.title : DEFAULT_TITLE;
  document.title = title;
});

export default router;
