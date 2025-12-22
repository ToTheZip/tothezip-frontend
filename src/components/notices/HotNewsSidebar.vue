<template>
  <div class="hot-sidebar">
    <div class="hot-news-container">
      <!-- 타이틀 영역 -->
      <div class="hot-header">
        <span class="fire-icon">🔥</span>
        <h2 class="hot-title">지금 핫한 소식</h2>
      </div>

      <!-- HOT 뉴스 목록 -->
      <div class="hot-list">
        <div
          v-for="(news, index) in hotNews"
          :key="news.id"
          class="hot-news-item"
          @click="goDetail(news.id)"
          :title="news.title" 
        >
          <!-- 마우스 올리면 전체 제목이 툴팁으로 뜨도록 title 속성 추가 -->
          
          <!-- 순위 뱃지 -->
          <div class="rank-badge">{{ index + 1 }}</div>

          <div class="news-content">
            <!-- 메타 정보 (타입 | 날짜) -->
            <div class="news-meta">
              <span class="news-type">{{ news.type }}</span>
              <span class="meta-dot">·</span>
              <span class="news-date">{{ news.date }}</span>
            </div>

            <!-- 제목 (한 줄 말줄임 적용) -->
            <h3 class="news-title">{{ news.title }}</h3>
          </div>
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
  methods: {
    goDetail(id) {
      this.$router.push({ name: 'NoticeDetail', params: { noticeId: id } });
    }
  }
};
</script>

<style scoped>
/* ----------- Layout ----------- */
.hot-sidebar {
  width: 100%;
}

.hot-news-container {
  background: var(--tothezip-cream-01);
  border: 1px solid var(--tothezip-beige-03);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(75, 29, 28, 0.04);
  overflow: hidden;
  padding: 24px 20px;
}

/* ----------- Header ----------- */
.hot-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--tothezip-beige-02);
}

.fire-icon {
  font-size: 20px;
}

.hot-title {
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: var(--tothezip-brown-09);
  margin: 0;
}

/* ----------- List ----------- */
.hot-list {
  display: flex;
  flex-direction: column;
  gap: 16px; /* 간격을 조금 더 넓혀서 시원하게 */
}

/* ----------- Item ----------- */
.hot-news-item {
  display: flex;
  gap: 12px;
  align-items: flex-start; /* 상단 정렬 */
  padding: 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: transparent;
}

.hot-news-item:hover {
  background-color: var(--tothezip-beige-01);
  transform: translateX(4px); /* 살짝 오른쪽으로 이동하는 효과 */
}

/* Rank Badge */
.rank-badge {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background-color: var(--tothezip-orange-04);
  color: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  margin-top: 1px; /* 텍스트 높이와 시각적 정렬 맞춤 */
}

/* 4위부터는 색상 변경 */
.hot-news-item:nth-child(n+4) .rank-badge {
  background-color: var(--tothezip-brown-03); /* 베이지보다 조금 더 진한 색으로 가독성 확보 */
}

.news-content {
  flex: 1;
  min-width: 0; /* flex item 내부에서 말줄임표 작동하게 함 */
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Meta */
.news-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--tothezip-brown-05);
  line-height: 1;
}

.news-type {
  font-weight: 700;
  color: var(--tothezip-brown-08); /* 조금 더 진하게 */
}

.meta-dot {
  color: var(--tothezip-beige-04);
  font-weight: 700;
}

.news-date {
  font-family: "Pretendard", sans-serif;
  letter-spacing: -0.01em;
  color: var(--tothezip-brown-04);
}

/* Title - 한 줄 말줄임 적용 */
.news-title {
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--tothezip-brown-09);
  margin: 0;
  line-height: 1.5;
  
  /* 한 줄 말줄임 핵심 속성 */
  white-space: nowrap;      /* 줄바꿈 금지 */
  overflow: hidden;         /* 넘치는 텍스트 숨김 */
  text-overflow: ellipsis;  /* 말줄임표(...) 표시 */
  display: block;           /* 블록 요소로 처리 */
}

/* ----------- Responsive ----------- */
@media (max-width: 1024px) {
  .hot-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .hot-news-container {
    padding: 20px 16px;
    border-radius: 16px;
  }
  
  .hot-list {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>