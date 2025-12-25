<template>
  <div class="news-section">
    <div class="section-header">
      <div class="left">
        <div class="section-title">
          집중! 두집이가 <span class="highlight">부동산 소식</span>을 가져왔어요
        </div>

        <div class="section-tags">
          <button
            v-for="category in categories"
            :key="category"
            class="tag-button"
            :class="{ active: selectedCategory === category }"
            @click="handleCategoryClick(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <div class="more-button" @click="handleMoreClick">
        <span class="more-text">더보기</span>
        <svg
          class="arrow-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="#A3978F"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>

    <div class="news-grid">
      <NewsCard
        v-for="newsItem in news"
        :key="newsItem.id"
        :news="newsItem"
        @click="handleNewsClick(newsItem.id)"
      />
    </div>
  </div>
</template>

<script>
import NewsCard from "./NewsCard.vue";

export default {
  name: "NewsSection",
  components: { NewsCard },
  props: {
    categories: { type: Array, default: () => ["전체", "청약", "뉴스"] },
    news: { type: Array, required: true },
  },
  data() {
    return {
      selectedCategory: "전체",
    };
  },
  methods: {
    handleCategoryClick(category) {
      this.selectedCategory = category;
      this.$emit("category-click", category);
    },
    handleNewsClick(newsId) {
      this.$emit("news-click", newsId);
    },
    handleMoreClick() {
      this.$emit("more-click");
    },
  },
};
</script>

<style scoped>
/* ✅ 피그마 “채우기 없음” 전제: 배경색 넣지 않음 */
.news-section {
  width: 1070px;
  margin: 0 auto;
  padding: 34px 0 34px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 4px 13px;
  margin-bottom: 14px;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ✅ 추천 매물 섹션과 톤 맞춤 */
.section-title {
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: black;
}

.highlight {
  font-weight: 800;
  color: var(--tothezip-orange-06);
}

/* ✅ 탭도 “부담 없이” */
.section-tags {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tag-button {
  border: 1px solid rgba(163, 151, 143, 0.35);
  border-radius: 999px;
  padding: 7px 14px;
  min-width: 70px;

  background: rgba(255, 255, 255, 0.6); /* 투명 배경에서 떠보이게 */
  backdrop-filter: blur(2px);

  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: var(--tothezip-gray-04);
  cursor: pointer;

  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.tag-button:hover {
  border-color: rgba(255, 140, 0, 0.5);
  color: var(--tothezip-orange-06);
}

/* ✅ 선택 상태도 은은하게 */
.tag-button.active {
  background: rgba(255, 140, 0, 0.09);
  border-color: rgba(255, 140, 0, 0.35);
  color: var(--tothezip-orange-06);
}

.more-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 10px;
  cursor: pointer;
  user-select: none;
}

.more-text {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: var(--tothezip-gray-04);
}

.arrow-icon {
  opacity: 0.9;
}

.news-grid {
  display: flex;
  gap: 18px;
  align-items: stretch;
  flex-wrap: nowrap;
  padding: 0 8px;
}
</style>
