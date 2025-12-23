import { defineStore } from "pinia";

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null,
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken,
  },

  actions: {
    setAuth(token, user) {
      this.accessToken = token || null;
      this.user = user || null;

      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);

      if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(USER_KEY);
    },

    setAccessToken(token) {
      this.accessToken = token || null;
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    },

    clearAuth() {
      this.accessToken = null;
      this.user = null;
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    },

    hydrate() {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const userStr = sessionStorage.getItem(USER_KEY);

      this.accessToken = token || null;
      this.user = userStr ? JSON.parse(userStr) : null;
    },
  },
});
