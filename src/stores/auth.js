// import { defineStore } from "pinia";

// export const useAuthStore = defineStore("auth", {
//   state: () => ({
//     accessToken: "",
//     user: null,
//   }),
//   actions: {
//     setAccessToken(token) {
//       this.accessToken = token || "";
//     },
//     setUser(user) {
//       this.user = user || null;
//     },
//     clearAuth() {
//       this.accessToken = "";
//       this.user = null;
//     },
//   },
// });
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null,
    user: null,
  }),

  actions: {
    setAuth(token, user) {
      this.accessToken = token;
      this.user = user;

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    clearAuth() {
      this.accessToken = null;
      this.user = null;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },

    hydrate() {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");

      this.accessToken = token || null;
      this.user = userStr ? JSON.parse(userStr) : null;
    },
  },
});