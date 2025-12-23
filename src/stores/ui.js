import { defineStore } from "pinia";

export const useUIStore = defineStore("ui", {
  state: () => ({
    searchMode: "ALL",
    showFavoriteCalendar: false,
  }),
  actions: {
    setSearchMode(mode) {
      this.searchMode = mode;
    },
    toggleFavoriteCalendar() {
      this.showFavoriteCalendar = !this.showFavoriteCalendar;
    },
    closeFavoriteCalendar() {
      this.showFavoriteCalendar = false;
    },
  },
});
