import { defineStore } from "pinia";

export const useUIStore = defineStore("ui", {
  state: () => ({
    showFavoriteCalendar: false,
  }),
  actions: {
    toggleFavoriteCalendar() {
      this.showFavoriteCalendar = !this.showFavoriteCalendar;
    },
    closeFavoriteCalendar() {
      this.showFavoriteCalendar = false;
    },
  },
});
