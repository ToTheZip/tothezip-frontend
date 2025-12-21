<template>
  <div class="hot-sidebar">
    <div class="hot-news-container">
      <!-- 타이틀 영역 -->
      <div class="hot-header">
        <div class="fire-icon">🔥</div>
        <span class="hot-title">HOT</span>
      </div>

      <!-- HOT 뉴스 목록 -->
      <div v-for="news in hotNews" :key="news.id" class="hot-news-item">
        <!-- 타입 영역 -->
        <div class="news-header">
          <span class="news-type">{{ news.type }}</span>
          <div class="news-date">
            <span>{{ news.date }}</span>
          </div>
        </div>

        <!-- 뉴스 제목 영역 -->
        <div class="news-title-container">
          <p class="news-title">{{ news.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HotNewsSidebar",
  props: {
    hotNews: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
.hot-sidebar {
  position: sticky;
  top: 100px; /* navbar (80px) + search bar (80px) + padding (20px) */
  padding: 30px 0;
}

.hot-news-container {
  width: 247px;
  background: #fff;
  border: 0.5px solid #f4ece7;
  border-radius: 20px;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2);
  padding: 8px 5px;
  overflow: hidden;
}

/* HOT 헤더 */
.hot-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
}

.fire-icon {
  width: 25px;
  height: 25px;
  font-size: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hot-title {
  font-family: "Pretendard Variable", "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #000;
}

/* HOT 뉴스 아이템 */
.hot-news-item {
  height: 90px;
  border-top: 0.5px solid #f4ece7;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.hot-news-item:hover {
  background-color: rgba(244, 236, 231, 0.3);
}

.news-header {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 6px 10px;
  margin-top: 2.5px;
}

.news-type {
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #000;
  white-space: nowrap;
}

.news-date {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-left: 1px solid #c0b6ae;
}

.news-date span {
  font-family: "Pretendard", sans-serif;
  font-size: 6px;
  font-weight: 500;
  color: #a3978f;
  white-space: nowrap;
}

.news-title-container {
  display: flex;
  align-items: flex-start;
  padding: 0 10px;
  margin-top: 4px;
}

.news-title {
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #000;
  line-height: 1.4;
  max-width: 225px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
}

/* 모바일에서는 sticky 해제 */
@media (max-width: 760px) {
  .hot-sidebar {
    position: static !important;
    top: auto !important;
    height: auto !important;
    z-index: auto !important;
    width: 100% !important;

    padding: 12px 0 20px;
  }

  .hot-news-container {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    padding: 10px 8px;
  }

  .news-title {
    max-width: 100%;
  }
}
</style>
