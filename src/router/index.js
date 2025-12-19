// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

import SignupPage from "@/components/SignupPage.vue";
import LoginPage from "@/components/LoginPage.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/signup",
    name: "Signup",
    component: SignupPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
