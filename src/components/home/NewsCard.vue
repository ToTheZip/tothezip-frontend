<template>
  <div class="news-card">
    <!-- 상단 포인트 라인 (짧고 얇게) -->
    <div class="top-accent" />

    <div class="news-content">
      <div class="meta-row">
        <span class="news-type">{{ news.type }}</span>
        <span class="meta-divider">|</span>
        <span class="news-date">{{ news.date }}</span>
      </div>

      <div class="news-title">
        {{ news.title }}
      </div>

      <div class="news-bottom">
        <span class="chevrons">»</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NewsCard",
  props: {
    news: { type: Object, required: true },
  },
};
</script>

<style scoped>
.news-card {
  position: relative; /* 이거 없어서 페이지 상단에 붙은 거 */
  overflow: hidden; /* 라인/라운드 밖으로 삐져나오는 거 방지 */

  width: 100%;
  height: 180px;
  background: #ffffff;
  border: 1px solid rgba(163, 151, 143, 0.22);
  border-radius: 22px;
  box-shadow: 0 2px 10px rgba(17, 17, 17, 0.06);

  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.news-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(17, 17, 17, 0.08);
  border-color: rgba(163, 151, 143, 0.3);
}

/* ✅ 상단 갈색 라인: 스샷처럼 얇고 짧게 */
.top-accent {
  position: absolute;
  top: 0; /* 카드 상단에 딱 붙임 */
  left: 50%;
  transform: translateX(-50%);

  width: 68%; /* 카드 대비 길이 */
  height: 6px;

  background: var(--tothezip-brown-06);
  border-radius: 0 0 999px 999px; /* 아래만 둥글게 */

  z-index: 2;
}

.news-content {
  height: 100%;
  padding: 24px 22px 18px; /* 위 padding 살짝 여유 */
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ✅ 메타는 추천 영역 톤처럼 “가볍게” */
.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.news-type {
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #111;
}

.meta-divider {
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: rgba(163, 151, 143, 0.6);
}

.news-date {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: rgba(163, 151, 143, 0.9);
}

/* ✅ 제목: 부담 줄이기(크기/두께 다운 + 줄간격 여유) */
.news-title {
  font-family: "Pretendard", sans-serif;
  font-weight: 500; /* 덜 굵게 */
  font-size: 16px;
  color: #111;
  line-height: 1.48;

  /* ✅ 3줄 기준 높이 확보 */
  min-height: calc(1.48em * 3);

  /* 3줄 제한 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* ✅ 우하단 표시는 작고 연하게 */
.news-bottom {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.chevrons {
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: rgba(163, 151, 143, 0.55);
}
</style>
