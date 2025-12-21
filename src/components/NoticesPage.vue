<template>
  <div class="notices-page">
    <!-- 콘텐츠 영역 -->
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
          <NewsCard v-for="news in paginatedNews" :key="news.id" :news="news" />
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination" v-if="totalPages > 1">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="goPage(currentPage - 1)"
          >
            ‹
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            :class="['page-btn', { active: currentPage === page }]"
            @click="goPage(page)"
          >
            {{ page }}
          </button>

          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="goPage(currentPage + 1)"
          >
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
import Footer from "@/components/common/Footer.vue";

export default {
  name: "NoticesPage",
  components: {
    NewsCard,
    HotNewsSidebar,
    Footer,
  },
  data() {
    return {
      selectedFilter: "all",
      currentPage: 1, // 현재 페이지
      pageSize: 15, // 한 페이지당 뉴스 개수
      filters: [
        { id: "all", label: "전체" },
        { id: "subscription", label: "청약" },
        { id: "news", label: "뉴스" },
      ],
      hotNews: [
        {
          id: 1,
          type: "주요 뉴스",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 2,
          type: "주요 뉴스",
          date: "2025.12.10",
          title: "서울 원룸 월세 저렴한 1위는 의외로 '이 동네'... 평균 41만원",
        },
        {
          id: 3,
          type: "주요 뉴스",
          date: "2025.12.10",
          title:
            "잠실 르엘에 장기전세로 살아볼까?... SH '시프트' 1000여 가구 모집",
        },
        {
          id: 4,
          type: "주요 뉴스",
          date: "2025.12.10",
          title:
            '"엄마, 이제 1000에 72가 기본이래 어떡해"... 서울 원룸 평균 월세, 또 올랐다',
        },
        {
          id: 5,
          type: "주요 뉴스",
          date: "2025.12.10",
          title:
            '서울시, 3.4조 투입해 내부순환로, 북부간선도로 지하화... "강북 도시 구조 새롭게 정비"',
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
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 3,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 4,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 5,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 6,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 7,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 8,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 9,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 10,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 11,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 12,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 13,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 14,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 15,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 16,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 17,
          type: "주요 뉴스",
          category: "news",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
      ],
    };
  },

  computed: {
    // 필터링된 전체 데이터
    filteredAllNews() {
      if (this.selectedFilter === "all") return this.allNews;
      return this.allNews.filter(
        (news) => news.category === this.selectedFilter
      );
    },

    // 페이지에 보여줄 데이터
    paginatedNews() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredAllNews.slice(start, end);
    },

    // 총 페이지 수
    totalPages() {
      return Math.ceil(this.filteredAllNews.length / this.pageSize);
    },
  },

  methods: {
    selectFilter(filterId) {
      this.selectedFilter = filterId;
      this.currentPage = 1; // 필터 변경 시 페이지 초기화
    },
    goPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;

      // 페이지 바뀔 때 살짝 위로 스크롤 (UX 좋아짐)
      window.scrollTo({
        top: 80,
        behavior: "smooth",
      });
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

  .search-bar {
    width: 100%;
    max-width: 520px;
  }
}
</style>
