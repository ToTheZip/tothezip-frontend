<template>
  <div class="notice-detail-page">
    <div class="content-wrapper">
      <!-- LEFT: HOT -->
      <HotNewsSidebar :hotNews="hotNews" />

      <!-- RIGHT: Detail -->
      <div class="detail-main">
        <div class="detail-card" v-if="notice">
          <div class="detail-header">
            <div class="meta-row">
              <span class="news-type">{{ notice.type }}</span>
              <span class="meta-divider">|</span>
              <span class="news-date">{{ notice.date }}</span>
            </div>

            <h1 class="detail-title">{{ notice.title }}</h1>
          </div>

          <div class="detail-body">
            <!-- 실제 API 붙이면 notice.content로 바꾸면 됨 -->
            <p v-for="(p, idx) in paragraphs" :key="idx" class="paragraph">
              {{ p }}
            </p>
          </div>

          <div class="detail-footer">
            <button class="back-btn" @click="goList">목록</button>
          </div>
        </div>

        <!-- not found -->
        <div class="detail-card" v-else>
          <div class="detail-header">
            <h1 class="detail-title">해당 공지를 찾을 수 없어요.</h1>
          </div>
          <div class="detail-footer">
            <button class="back-btn" @click="goList">목록</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HotNewsSidebar from "@/components/notices/HotNewsSidebar.vue";

export default {
  name: "NoticeDetailPage",
  components: { HotNewsSidebar },
  props: {
    noticeId: { type: [String, Number], required: true },
  },
  data() {
    return {
      // 실제로는 API에서 가져오면 됨 (지금은 NoticesPage랑 동일 더미)
      hotNews: [
        {
          id: 1,
          type: "주요 뉴스",
          date: "2025.12.10",
          title: "‘침수 피해’ 대림1구역…",
        },
        {
          id: 2,
          type: "주요 뉴스",
          date: "2025.12.10",
          title: "서울 원룸 월세 저렴한 1위는…",
        },
        {
          id: 3,
          type: "주요 뉴스",
          date: "2025.12.10",
          title: "잠실 르엘에 장기전세로…",
        },
        {
          id: 4,
          type: "주요 뉴스",
          date: "2025.12.10",
          title: "“엄마, 이제 1000에 72가…”",
        },
        {
          id: 5,
          type: "주요 뉴스",
          date: "2025.12.10",
          title: "서울시, 3.4조 투입해…",
        },
      ],
      allNews: [
        {
          id: 1,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 2,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title: "서울 원룸 월세 저렴한 1위는 의외로 '이 동네'... 평균 41만원",
        },
        {
          id: 3,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "잠실 르엘에 장기전세로 살아볼까?... SH '시프트' 1000여 가구 모집",
        },
        // ... 실제 데이터로 교체
      ],
    };
  },
  computed: {
    idNum() {
      return Number(this.noticeId);
    },
    notice() {
      return this.allNews.find((n) => n.id === this.idNum) || null;
    },
    paragraphs() {
      /* 동일 */
    },
  },
  methods: {
    goList() {
      this.$router.push({ name: "NoticeList" });
    },
  },
  watch: {
    noticeId() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
  methods: {
    goList() {
      this.$router.push({ name: "NoticeList" });
    },
  },
  watch: {
    // 상세 이동 시 같은 컴포넌트 재사용되면 스크롤 상단으로
    "$route.params.noticeId"() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
};
</script>

<style scoped>
.notice-detail-page {
  min-height: 100vh;
  background: #fff;
}

/* NoticesPage랑 동일한 wrapper 톤 유지 */
.content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 42px 46px;
  display: flex;
  gap: clamp(20px, 3vw, 36px);
  align-items: flex-start;
}

/* 오른쪽 상세 영역 */
.detail-main {
  flex: 1;
  min-width: 0;
  max-width: 920px;
}

.detail-card {
  width: 100%;
  background: #fff;
  border: 1px solid rgba(163, 151, 143, 0.22);
  border-radius: 22px;
  box-shadow: 0 2px 10px rgba(17, 17, 17, 0.06);
  padding: 28px 28px 22px;
}

.detail-header {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(220, 212, 207, 0.7);
  margin-bottom: 18px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
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

.detail-title {
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1.5;
  color: #111;
  margin: 0;
}

.detail-body {
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  line-height: 1.85;
  color: rgba(17, 17, 17, 0.9);
}

.paragraph {
  margin: 0 0 14px;
}

.detail-footer {
  display: flex;
  justify-content: center;
  padding-top: 18px;
}

.back-btn {
  min-width: 96px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--tothezip-beige-08);
  background: var(--tothezip-beige-07);
  color: var(--tothezip-beige-01);
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.back-btn:hover {
  opacity: 0.9;
}

/* 반응형 */
@media (max-width: 1100px) {
  .content-wrapper {
    padding: 34px 24px;
  }
}

@media (max-width: 760px) {
  .content-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .detail-main {
    max-width: 100%;
  }

  .detail-card {
    padding: 22px 18px 18px;
  }
}
</style>
