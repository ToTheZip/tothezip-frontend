<template>
  <div class="notices-page">
    <div class="content-wrapper">
      <!-- HOT 뉴스 사이드바 -->
      <HotNewsSidebar :hotNews="hotNews" />

      <!-- 메인 공지사항 영역 -->
      <div class="notices-main">
        <!-- 필터 옵션 -->
        <div class="filter-section">
          <div class="filter-tags">
            <button
              v-for="filter in filters"
              :key="filter.id"
              :class="['filter-tag', { active: selectedFilter === filter.id }]"
              @click="selectFilter(filter.id)"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <!-- 뉴스 카드 그리드 -->
        <div class="news-grid">
          <NewsCard v-for="news in allNews" :key="news.id" :news="news" @click="goDetail(news.id)" />
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">
            ‹
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-btn', { active: currentPage === page }]"
            @click="goPage(page)"
          >
            {{ page }}
          </button>

          <button class="page-btn" :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)">
            ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NewsCard from "@/components/home/NewsCard.vue";
import HotNewsSidebar from "@/components/notices/HotNewsSidebar.vue";

import { fetchNoticeList, fetchNoticeMain } from "@/api/notice";

export default {
  name: "NoticesPage",
  components: {
    NewsCard,
    HotNewsSidebar,
  },
  data() {
    return {
      // UI 상태
      selectedFilter: "all",
      currentPage: 1,
      pageSize: 15,

      // 서버 데이터
      totalItems: 0,
      allNews: [],
      hotNews: [],

      filters: [
        { id: "all", label: "전체" },
        { id: "subscription", label: "청약" },
        { id: "news", label: "뉴스" },
      ],
    };
  },

  computed: {
    totalPages() {
      const t = Number(this.totalItems || 0);
      return Math.max(1, Math.ceil(t / this.pageSize));
    },

    // 페이지 버튼 5칸
    visiblePages() {
      const total = this.totalPages;
      const cur = this.currentPage;
      const maxButtons = 5;

      if (total <= maxButtons) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      const half = Math.floor(maxButtons / 2);
      let start = cur - half;
      let end = cur + half;

      if (start < 1) {
        start = 1;
        end = start + maxButtons - 1;
      }
      if (end > total) {
        end = total;
        start = end - maxButtons + 1;
      }

      const pages = [];
      for (let p = start; p <= end; p++) pages.push(p);
      return pages;
    },
  },

  async mounted() {
    await Promise.all([this.loadHot(), this.loadList()]);
  },

  methods: {
    // UI 필터 id -> 백엔드 typeFilter 값 매핑
    toTypeFilter(filterId) {
      if (filterId === "subscription") return "청약";
      if (filterId === "news") return "뉴스";
      return "ALL";
    },

    formatDate(dateLike) {
      if (!dateLike) return "";
      const s = String(dateLike);
      return s.includes("-") ? s.replaceAll("-", ".") : s;
    },

    mapSummaryToCard(x) {
      return {
        id: x.noticeId,
        type: x.type,
        date: this.formatDate(x.registDate),
        title: x.title,
      };
    },

    async loadHot() {
      // HOT = /notice/main?sort=hot
      try {
        const res = await fetchNoticeMain({ typeFilter: "ALL", sort: "hot" });

        // pinned + notices 섞여 내려오면 중복 제거해서 5개만
        const merged = [...(res.pinned || []), ...(res.notices || [])];
        const seen = new Set();
        const top5 = [];

        for (const x of merged) {
          if (!x?.noticeId) continue;
          if (seen.has(x.noticeId)) continue;
          seen.add(x.noticeId);
          top5.push(this.mapSummaryToCard(x));
          if (top5.length >= 5) break;
        }

        this.hotNews = top5;
      } catch (e) {
        console.warn("HOT 로딩 실패", e);
        this.hotNews = [];
      }
    },

    async loadList() {
      try {
        const typeFilter = this.toTypeFilter(this.selectedFilter);

        const res = await fetchNoticeList({
          typeFilter,
          sort: "latest",
          page: this.currentPage,
        });

        // totalItems로 totalPages 계산해야 함
        this.totalItems = Number(res.totalItems || 0);

        // 목록은 notices만 그리드에 뿌리자(핫/고정은 사이드바에서 사용)
        this.allNews = (res.notices || []).map(this.mapSummaryToCard);
      } catch (e) {
        console.error("공지 목록 로딩 실패", e);
        this.totalItems = 0;
        this.allNews = [];
      }
    },

    async selectFilter(filterId) {
      this.selectedFilter = filterId;
      this.currentPage = 1;
      await this.loadList();

      window.scrollTo({ top: 80, behavior: "smooth" });
    },

    async goPage(page) {
      const p = Number(page);
      if (!Number.isFinite(p)) return;
      if (p < 1 || p > this.totalPages) return;

      this.currentPage = p;
      await this.loadList();

      window.scrollTo({ top: 80, behavior: "smooth" });
    },

    goDetail(id) {
      this.$router.push({ name: "NoticeDetail", params: { noticeId: id } });
    },
  },
};
</script>

<style scoped>
.notices-page {
  min-height: 100vh;
  background-color: #fff;
}

/* 콘텐츠 영역 */
.content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 42px 46px;
  display: flex;
  gap: clamp(20px, 3vw, 36px);
  align-items: flex-start;
}

/* 메인 공지사항 영역 */
.notices-main {
  flex: 1;
  min-width: 0;
  max-width: 920px;
}

/* 필터 섹션 */
.filter-section {
  margin-bottom: 24px;
}

.filter-tags {
  display: flex;
  gap: 10px;
  padding: 12px 2px;
}

.filter-tag {
  min-width: 68px;
  padding: 5px 8px;
  border-radius: 50px;
  border: 1px solid #a3978f;
  background: transparent;
  color: #a3978f;
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tag.active {
  background-color: #ff9c33;
  border-color: #d37d33;
  color: #fff;
}

.filter-tag:hover {
  opacity: 0.8;
}

/* 뉴스 그리드 */
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 36px;
}

.page-btn {
  min-width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #dcd4cf;
  background: #fff;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #6f3d32;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 156, 51, 0.12);
}

.page-btn.active {
  background: #ff9c33;
  border-color: #d37d33;
  color: #fff;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

/* 반응형 */
@media (max-width: 1100px) {
  .content-wrapper {
    padding: 34px 24px;
  }
  .news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .content-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .notices-main {
    max-width: 100%;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
