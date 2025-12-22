<template>
  <div class="notice-detail-page">
    <div class="content-wrapper">
      <!-- LEFT: HOT -->
      <HotNewsSidebar :hotNews="hotNews" />

      <!-- RIGHT: Detail -->
      <div class="detail-main">
        <!-- loading -->
        <div class="detail-card" v-if="isLoading">
          <div class="detail-header">
            <h1 class="detail-title">불러오는 중...</h1>
          </div>
        </div>

        <!-- loaded -->
        <div class="detail-card" v-else-if="notice">
          <div class="detail-header">
            <div class="meta-row">
              <span class="news-type">{{ notice.type }}</span>
              <span class="meta-divider">|</span>
              <span class="news-date">{{ formatDate(notice.registDate) }}</span>
              <span class="meta-divider">|</span>
              <span class="news-views">조회수 {{ notice.views }}</span>
            </div>

            <h1 class="detail-title">{{ notice.title }}</h1>
          </div>

          <div class="detail-body">
            <p v-for="(p, idx) in paragraphs" :key="idx" class="paragraph">
              {{ p }}
            </p>
          </div>

          <div class="detail-footer">
            <button class="back-btn" @click="goList">목록</button>
          </div>
        </div>

        <!-- not found / error -->
        <div class="detail-card" v-else>
          <div class="detail-header">
            <h1 class="detail-title">해당 공지를 찾을 수 없어요.</h1>
            <p class="error-text" v-if="errorMsg">{{ errorMsg }}</p>
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
import { fetchNoticeDetail, fetchNoticeMain } from "@/api/notice";

export default {
  name: "NoticeDetailPage",
  components: { HotNewsSidebar },
  props: {
    noticeId: { type: [String, Number], required: true },
  },
  data() {
    return {
      isLoading: false,
      errorMsg: "",
      notice: null,
      hotNews: [],
    };
  },
  computed: {
    noticeIdNum() {
      const n = Number(this.noticeId);
      return Number.isFinite(n) ? n : null;
    },
    paragraphs() {
      const raw = this.notice?.content ?? "";
      // 줄바꿈 기반 문단
      return String(raw)
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    },
  },
  async mounted() {
    await this.loadAll();
  },
  watch: {
    // 같은 컴포넌트 재사용되는 경우(라우트 param만 변할 때)
    noticeId: {
      immediate: false,
      async handler() {
        window.scrollTo({ top: 0, behavior: "smooth" });
        await this.loadDetail();
      },
    },
  },
  methods: {
    async loadAll() {
      await Promise.all([this.loadHot(), this.loadDetail()]);
    },
    async loadHot() {
      try {
        const data = await fetchNoticeMain({ typeFilter: "ALL", sort: "hot" });
        const pinned = data?.pinned || [];
        const notices = data?.notices || [];
        const merged = [...pinned, ...notices].slice(0, 5);

        this.hotNews = merged.map((x) => ({
          id: x.noticeId,
          type: x.type,
          date: this.formatDate(x.registDate),
          title: x.title,
        }));
      } catch (e) {
        console.warn("HOT 로딩 실패:", e);
        this.hotNews = [];
      }
    },
    async loadDetail() {
      if (!this.noticeIdNum) {
        this.notice = null;
        this.errorMsg = "잘못된 noticeId 입니다.";
        return;
      }

      this.isLoading = true;
      this.errorMsg = "";
      try {
        const data = await fetchNoticeDetail(this.noticeIdNum);
        // NoticeDto.Detail: {noticeId,type,title,content,views,registDate,writer}
        this.notice = data || null;
      } catch (e) {
        console.error("상세 로딩 실패:", e);
        this.notice = null;
        this.errorMsg = String(e?.message || "상세 로딩 실패");
      } finally {
        this.isLoading = false;
      }
    },
    goList() {
      // 목록으로 돌아가기 (query 유지하고 싶으면 여기서 query 붙이면 됨)
      this.$router.push({ name: "NoticeList" });
    },
    formatDate(dateLike) {
      if (!dateLike) return "";
      const s = String(dateLike);
      // "2025-12-10" -> "2025.12.10"
      if (s.includes("-")) return s.replaceAll("-", ".");
      return s;
    },
  },
};
</script>

<style scoped>
.notice-detail-page {
  min-height: 100vh;
  background: #fff;
}

.content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 42px 46px;
  display: flex;
  gap: clamp(20px, 3vw, 36px);
  align-items: flex-start;
}

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
  flex-wrap: wrap;
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
.news-date,
.news-views {
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
  white-space: pre-wrap;
}

.error-text {
  margin-top: 10px;
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  color: rgba(220, 53, 69, 0.9);
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
