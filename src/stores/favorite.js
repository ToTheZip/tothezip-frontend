import { defineStore } from "pinia";

export const useFavoriteStore = defineStore("favorite", {
  state: () => ({
    favoriteAptSeqs: {}, // 찜한 건물 apt_seq
  }),

  getters: {
    /** 해당 건물에 찜된 매물이 하나라도 있는가 */
    hasFavoriteInApt: (state) => (aptSeq) => {
      const set = state.favoriteDealsByApt[aptSeq];
      return set && set.size > 0;
    },

    /** 특정 매물이 찜 상태인지 */
    isDealFavorite: (state) => (aptSeq, dealId) => {
      return state.favoriteDealsByApt[aptSeq]?.has(dealId);
    },
  },

  actions: {
    /** 서버에서 최초 로딩 */
    setFavorites(list) {
      // list: [{ aptSeq, dealId }, ...]
      this.favoriteDealsByApt = {};

      for (const { aptSeq, dealId } of list) {
        if (!this.favoriteDealsByApt[aptSeq]) {
          this.favoriteDealsByApt[aptSeq] = new Set();
        }
        this.favoriteDealsByApt[aptSeq].add(dealId);
      }
    },

    addFavorite(aptSeq, dealId) {
      if (!this.favoriteDealsByApt[aptSeq]) {
        this.favoriteDealsByApt[aptSeq] = new Set();
      }
      this.favoriteDealsByApt[aptSeq].add(dealId);
    },

    removeFavorite(aptSeq, dealId) {
      const set = this.favoriteDealsByApt[aptSeq];
      if (!set) return;

      set.delete(dealId);

      // 마지막 매물이면 건물 자체 제거
      if (set.size === 0) {
        delete this.favoriteDealsByApt[aptSeq];
      }
    },
  },
});
