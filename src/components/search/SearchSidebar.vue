<template>
  <div class="search-results-sidebar">
    <!-- 전체 | 추천 토글 -->
    <div class="mode-toggle">
      <button
        class="mode-btn"
        :class="[
          { active: tabMode === 'ALL' },
          { faded: entryMode === 'FAVORITE' },
        ]"
        @click="$emit('change-mode', 'ALL')"
      >
        전체
      </button>

      <button
        class="mode-btn"
        :class="[
          { active: tabMode === 'RECO' },
          { faded: entryMode === 'FAVORITE' },
        ]"
        @click="$emit('change-mode', 'RECO')"
      >
        추천
      </button>
    </div>

    <!-- TAGS -->
    <div class="filter-tags-section">
      <FilterTag v-if="entryMode === 'FAVORITE'" label="❤️ 찜한 매물" />
      <template v-else>
        <FilterTag
          v-for="tag in filterTags"
          :key="tag.id"
          :label="tag.label"
          :removable="entryMode !== 'RECO'"
          @remove="$emit('remove-tag', tag)"
        />
      </template>
    </div>

    <!-- LIST -->
    <div class="results-list" ref="listRef">
      <div v-if="properties.length === 0 && !loading" class="no-results">
        {{ errorMessage || "검색 결과가 없습니다." }}
      </div>

      <PropertyCard
        v-for="property in properties"
        :key="property.id"
        :property="property"
        :selected="String(property.aptSeq) === String(selectedAptSeq)"
        @go-map="onGoMap"
        @click="$emit('select-property', property)"
      />
    </div>
  </div>
</template>

<script>
import FilterTag from "@/components/search/FilterTag.vue";
import PropertyCard from "@/components/search/PropertyCard.vue";

export default {
  name: "SearchSidebar",
  components: {
    FilterTag,
    PropertyCard,
  },
  props: {
    entryMode: {
      type: String,
      default: "ALL", // ALL | RECO | FAVORITE
    },
    tabMode: {
      type: String,
      default: "ALL", // ALL | RECO | NONE
    },
    filterTags: {
      type: Array,
      default: () => [],
    },
    properties: {
      type: Array,
      default: () => [],
    },
    selectedAptSeq: {
      type: [String, Number],
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: "",
    },
  },
  emits: ["change-mode", "select-property", "go-map", "remove-tag"],
  methods: {
    onGoMap(payload) {
      this.$emit("go-map", payload);
    },
    scrollToCard(aptSeq) {
      if (!aptSeq) return;

      this.$nextTick(() => {
        const listEl = this.$refs.listRef;
        if (!listEl) return;

        const cardEl = listEl.querySelector(
          `[data-aptseq="${String(aptSeq)}"]`
        );
        if (!cardEl) return;

        cardEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    },
  },
};
</script>

<style scoped>
.search-results-sidebar {
  position: absolute;
  left: 0;
  top: 0;
  width: 270px;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  z-index: 100;
  border-right: 1px solid rgba(163, 151, 143, 0.22);
  overflow: hidden;
}

.mode-toggle {
  display: flex;
  gap: 8px;
  padding: 10px 13px;
  border-bottom: 1px solid rgba(163, 151, 143, 0.22);
  background: #fff;
}

.mode-btn {
  flex: 1;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--tothezip-brown-01);
  background: #fff;
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: var(--tothezip-gray-05);
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-btn.active {
  background: var(--tothezip-beige-02);
  color: #111;
}

.mode-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.filter-tags-section {
  flex: 0 0 auto;
  width: 100%;
  min-height: 71px;
  padding: 10px 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid var(--tothezip-brown-01);
}

.results-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.results-list::after {
  content: "";
  display: block;
  height: 32px;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 14px;
}

.mode-btn.faded {
  opacity: 0.55; /* 색 빠진 느낌 */
  background: #fff;
  color: var(--tothezip-gray-05);
  border-color: rgba(163, 151, 143, 0.35);
}

/* 찜 상태에서 active여도 강조를 약하게 하고 싶으면 */
.mode-btn.faded.active {
  opacity: 0.75;
  background: #fff; /* active 배경 제거 */
  color: #111; /* 글씨만 살짝 */
}
</style>
