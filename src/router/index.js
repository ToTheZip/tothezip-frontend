import { createRouter, createWebHistory } from "vue-router";

import HomePage from "@/components/HomePage.vue";
import SignupPage from "@/components/SignupPage.vue";
import LoginPage from "@/components/LoginPage.vue";
import NoticeListPage from "@/components/NoticeListPage.vue";
import NoticeDetailPage from "@/components/NoticeDetailPage.vue";

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
    path: "/notice",
    name: "NoticeList",
    component: NoticeListPage,
  },
  {
    path: "/notice/:noticeId",
    name: "NoticeDetail",
    component: NoticeDetailPage,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
