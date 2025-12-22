import { createRouter, createWebHistory } from "vue-router";

import HomePage from "@/components/HomePage.vue";
import SignupPage from "@/components/SignupPage.vue";
import LoginPage from "@/components/LoginPage.vue";
import NoticeListPage from "@/components/NoticeListPage.vue";
import NoticeDetailPage from "@/components/NoticeDetailPage.vue";
import SearchMapPage from "@/components/SearchMapPage.vue";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
      meta: { requiresAuth: true },
    },
    {
      path: "/search",
      name: "SearchMap",
      component: SearchMapPage,
      meta: { layout: "noFooter" },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const isLoggedIn = !!auth.accessToken;

  if(to.meta.requiresAuth && !isLoggedIn) {
    alert("로그인 후 이용 가능합니다.");
    return next({
      name: "Login",
      query: { redirect: to.fullPath },
    });
  }

  next();
});

export default router;
