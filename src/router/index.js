import { createRouter, createWebHistory } from "vue-router";

import HomePage from "@/components/HomePage.vue";
import SignupPage from "@/components/SignupPage.vue";
import LoginPage from "@/components/LoginPage.vue";
import NoticesPage from "@/components/NoticesPage.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: { layout: "auth" },
  },
  {
    path: "/signup",
    name: "Signup",
    component: SignupPage,
    meta: { layout: "auth" },
  },
  {
    path: "/notices",
    name: "Notices",
    component: NoticesPage,
  },
  // {
  //   path: "/notice/:noticeId",
  //   name: "NoticeDetail",
  //   component: NoticeDetailPage,
  //   props: true ,
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
