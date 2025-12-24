import { defineStore } from "pinia";

export const useUIStore = defineStore("ui", {
  state: () => ({
    searchMode: "SEARCH", // SEARCH | FAVORITE
    showFavoriteCalendar: false,
    showProfileMenu: false,
    showPreferenceEdit: false,
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
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    closeProfileMenu() {
      this.showProfileMenu = false;
    },
    openPreferenceEdit() {
      this.showProfileMenu = false;
      this.showPreferenceEdit = true;
    },
    closePreferenceEdit() {
      this.showPreferenceEdit = false;
    },
  },
});
