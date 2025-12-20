import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: "",
    user: null,
  }),
  actions: {
    setAccessToken(token) {
      this.accessToken = token || "";
    },
    setUser(user) {
      this.user = user || null;
    },
    clearAuth() {
      this.accessToken = "";
      this.user = null;
    },
  },
});
