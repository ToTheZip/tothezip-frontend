<template>
  <div class="notice-detail-page">
    <div class="content-wrapper">
      <!-- LEFT: HOT News Sidebar -->
      <aside class="sidebar-area">
        <HotNewsSidebar :hotNews="hotNews" />
      </aside>

      <!-- RIGHT: Detail Content -->
      <main class="detail-main">
        <!-- Loading State -->
        <div class="detail-card loading-state" v-if="isLoading">
          <div class="spinner"></div>
          <p class="state-text">공지사항을 불러오는 중이에요...</p>
        </div>

        <!-- Loaded Content -->
        <article class="detail-card" v-else-if="notice">
          <!-- Header -->
          <header class="detail-header">
            <div class="header-top">
              <span class="category-badge">{{ notice.type }}</span>
              <div class="date-box">
                {{ formatDate(notice.registDate) }}
              </div>
            </div>

            <h1 class="detail-title">{{ notice.title }}</h1>

            <div class="meta-row">
              <div class="meta-left">
                <span class="meta-text">조회수 {{ notice.views }}</span>
              </div>

              <!-- 관심 청약 버튼 -->
              <div class="meta-right" v-if="notice.type === '청약'">
                <button
                  class="favorite-btn"
                  :class="{ liked }"
                  @click="toggleFavorite"
                  aria-label="관심 청약"
                >
                  <HeartFill v-if="liked" class="icon" />
                  <HeartOutline v-else class="icon" />
                  <span class="label">{{ liked ? "찜 완료" : "찜하기" }}</span>
                </button>
              </div>
            </div>
          </header>

          <hr class="divider" />

          <!-- Body (Smart Formatted) -->
          <div class="detail-body">
            <!-- 텍스트 분석하여 타입별로 다르게 렌더링 -->
            <template v-for="(block, idx) in formattedContent" :key="idx">
              <!-- 1. 섹션 타이틀 (예: "? 청약 공고 안내") -->
              <h3 v-if="block.type === 'title'" class="body-section-title">
                {{ block.text }}
              </h3>

              <!-- 2. 정보 리스트 아이템 (예: "• 공고명: 자이") -->
              <div v-else-if="block.type === 'list-item'" class="info-row">
                <span class="info-bullet"></span>
                <div class="info-content">
                  <span class="info-label" v-if="block.label">{{
                    block.label
                  }}</span>
                  <span class="info-value">{{ block.value }}</span>
                </div>
              </div>

              <!-- 3. 링크 버튼 (URL이 포함된 줄) -->
              <a
                v-else-if="block.type === 'link'"
                :href="block.url"
                target="_blank"
                class="link-card"
              >
                <span class="link-icon">🔗</span>
                <div class="link-text">
                  <span class="link-label">관련 링크 바로가기</span>
                  <span class="link-url">{{ block.url }}</span>
                </div>
                <span class="link-arrow">→</span>
              </a>

              <!-- 4. 주의사항/참고 (※ 로 시작) -->
              <div v-else-if="block.type === 'note'" class="note-box">
                <span class="note-icon">※</span>
                <p class="note-text">{{ block.text }}</p>
              </div>

              <!-- 5. 일반 텍스트 -->
              <p v-else class="body-text">
                {{ block.text }}
              </p>
            </template>
          </div>

          <hr class="divider" />

          <!-- Footer -->
          <div class="detail-footer">
            <button class="back-btn" @click="goList">
              <span class="arrow">←</span> 목록으로
            </button>
          </div>
        </article>

        <!-- Error -->
        <div class="detail-card error-state" v-else>
          <div class="error-content">
            <h2 class="error-title">공지사항을 찾을 수 없어요 😢</h2>
            <p class="state-text" v-if="errorMsg">{{ errorMsg }}</p>
            <button class="back-btn" @click="goList">목록으로 돌아가기</button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import HeartOutline from "@/components/icons/HeartOutline.vue";
import HeartFill from "@/components/icons/HeartFill.vue";
import HotNewsSidebar from "@/components/notices/HotNewsSidebar.vue";
import { fetchNoticeDetail, fetchNoticeMain } from "@/api/notice";
import { useAuthStore } from "@/stores/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "NoticeDetailPage",
  components: { HotNewsSidebar, HeartOutline, HeartFill },
  props: {
    noticeId: { type: [String, Number], required: true },
  },
  data() {
    return {
      isLoading: false,
      errorMsg: "",
      notice: {},
      liked: false,
      hotNews: [],
    };
  },
  computed: {
    noticeIdNum() {
      const n = Number(this.noticeId);
      return Number.isFinite(n) ? n : null;
    },
    /**
     * 본문 텍스트를 줄 단위로 분석하여 구조화된 데이터로 변환
     */
    formattedContent() {
      const raw = this.notice?.content ?? "";
      const lines = String(raw)
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);

      return lines.map((line) => {
        // 1. URL 감지
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          return { type: "link", url: urlMatch[0], text: line };
        }

        // 2. 섹션 타이틀 감지 (?, ■, [ ] 등으로 시작)
        if (/^[?■\[]/.test(line) && line.length < 40) {
          return { type: "title", text: line.replace(/^[?■]\s*/, "") };
        }

        // 3. 리스트 아이템 감지 (•, -, * 등으로 시작)
        if (/^[•\-*]/.test(line)) {
          const content = line.replace(/^[•\-*]\s*/, "");
          // "항목: 값" 형태 분리
          if (content.includes(":")) {
            const [label, ...rest] = content.split(":");
            return {
              type: "list-item",
              label: label.trim() + ":",
              value: rest.join(":").trim(),
            };
          }
          return { type: "list-item", label: "", value: content };
        }

        // 4. 주의사항/참고 감지 (※)
        if (line.startsWith("※")) {
          return { type: "note", text: line.replace(/^※\s*/, "") };
        }

        // 5. 일반 텍스트
        return { type: "text", text: line };
      });
    },
  },
  async mounted() {
    await this.loadAll();
    await this.checkFavorite();
  },
  watch: {
    noticeId: {
      immediate: false,
      async handler() {
        window.scrollTo({ top: 0, behavior: "smooth" });
        await this.loadDetail();
        await this.checkFavorite();
      },
    },
  },
  methods: {
    async checkFavorite() {
      const auth = useAuthStore();
      if (!auth.accessToken) return;

      try {
        const res = await fetch(`${API_BASE}/favorite?type=청약`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          credentials: "include",
        });
        if (res.ok) {
          const ids = await res.json();
          this.liked = ids.includes(this.notice.noticeId);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async toggleFavorite() {
      const auth = useAuthStore();
      if (!auth.accessToken) {
        alert("로그인 후 이용해주세요");
        this.$router.push("/login");
        return;
      }

      const noticeId = this.notice.noticeId;
      const has = this.liked;

      this.liked = !has;

      try {
        if (has) {
          await fetch(
            `${API_BASE}/favorite?type=청약&referenceId=${noticeId}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${auth.accessToken}` },
              credentials: "include",
            }
          );
        } else {
          await fetch(`${API_BASE}/favorite`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            credentials: "include",
            body: JSON.stringify({ type: "청약", referenceId: noticeId }),
          });
        }
      } catch (e) {
        this.liked = has;
      }
    },
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
      this.$router.push({ name: "NoticeList" });
    },
    formatDate(dateLike) {
      if (!dateLike) return "";
      const s = String(dateLike);
      if (s.includes("-")) return s.replaceAll("-", ".");
      return s;
    },
  },
};
</script>

<style scoped>
/* ----------- Layout ----------- */
.notice-detail-page {
  min-height: 100vh;
  background-color: var(--tothezip-beige-01);
  font-family: "Pretendard", sans-serif;
  color: var(--tothezip-brown-09);
}

.content-wrapper {
  max-width: 1240px;
  margin: 0 auto;
  padding: 60px 24px;
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.sidebar-area {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;
}

.detail-main {
  flex: 1;
  min-width: 0;
}

.detail-card {
  background: var(--tothezip-cream-01);
  border: 1px solid var(--tothezip-beige-03);
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(75, 29, 28, 0.05);
  padding: 56px 64px;
  position: relative;
  overflow: hidden;
}

/* ----------- Header ----------- */
.detail-header {
  margin-bottom: 32px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.category-badge {
  display: inline-block;
  padding: 6px 14px;
  background-color: var(--tothezip-beige-02);
  color: var(--tothezip-brown-08);
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
}

.date-box {
  font-size: 14px;
  color: var(--tothezip-brown-05);
  font-family: "Pretendard", sans-serif;
}

.detail-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--tothezip-brown-10);
  line-height: 1.3;
  margin: 0 0 28px 0;
  letter-spacing: -0.02em;
  word-break: keep-all;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--tothezip-brown-05);
}

.meta-icon {
  opacity: 0.7;
}

.favorite-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 99px;
  border: 1px solid var(--tothezip-beige-04);
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-btn .icon {
  width: 18px;
  height: 18px;
  color: var(--tothezip-brown-04);
  transition: transform 0.2s;
}

.favorite-btn .label {
  font-size: 14px;
  font-weight: 600;
  color: var(--tothezip-brown-07);
}

.favorite-btn:hover {
  background: var(--tothezip-orange-01);
  border-color: var(--tothezip-orange-03);
}

.favorite-btn.liked {
  background: var(--tothezip-orange-04);
  border-color: var(--tothezip-orange-04);
}
.favorite-btn.liked .icon {
  color: #fff;
}
.favorite-btn.liked .label {
  color: #fff;
}

.divider {
  border: none;
  height: 1px;
  background: var(--tothezip-beige-03);
  margin: 0;
}

/* ----------- Smart Body Styling ----------- */
.detail-body {
  padding: 40px 0;
  min-height: 240px;
  color: var(--tothezip-brown-09);
  font-size: 16px;
  line-height: 1.7;
}

/* 1. 섹션 타이틀 */
.body-section-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--tothezip-brown-08);
  margin: 40px 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--tothezip-beige-02);
}
.body-section-title:first-child {
  margin-top: 0;
}

/* 2. 정보 리스트 행 */
.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  padding: 14px 18px;
  background-color: #faf7f5; /* 아주 연한 베이지 */
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.info-row:hover {
  background-color: var(--tothezip-beige-01);
  border-color: var(--tothezip-beige-03);
}

.info-bullet {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  margin-top: 9px;
  border-radius: 50%;
  background-color: var(--tothezip-orange-04);
}

.info-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-label {
  font-weight: 700;
  color: var(--tothezip-brown-07);
  min-width: 60px;
}

.info-value {
  color: var(--tothezip-brown-09);
  word-break: break-all;
}

/* 3. 링크 카드 */
.link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
  padding: 16px 24px;
  background: #fff;
  border: 1px solid var(--tothezip-beige-04);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  border-color: var(--tothezip-orange-04);
}

.link-icon {
  font-size: 20px;
}

.link-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.link-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--tothezip-brown-08);
}

.link-url {
  font-size: 13px;
  color: var(--tothezip-brown-05);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-arrow {
  font-weight: 700;
  color: var(--tothezip-orange-05);
}

/* 4. 주의사항 박스 */
.note-box {
  margin-top: 32px;
  padding: 20px;
  background-color: var(--tothezip-brown-01);
  border-radius: 12px;
  display: flex;
  gap: 10px;
  color: var(--tothezip-brown-06);
  font-size: 14px;
}

.note-icon {
  font-weight: 700;
  color: var(--tothezip-brown-05);
}

/* 5. 일반 텍스트 */
.body-text {
  margin-bottom: 16px;
  white-space: pre-wrap;
  color: var(--tothezip-gray-06);
}

/* ----------- Footer ----------- */
.detail-footer {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 32px;
  border-radius: 99px;
  background: var(--tothezip-brown-01);
  border: 1px solid var(--tothezip-brown-02);
  color: var(--tothezip-brown-07);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--tothezip-brown-02);
  color: var(--tothezip-brown-09);
}

/* ----------- Responsive ----------- */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    padding: 40px 20px;
  }
  .sidebar-area {
    width: 100%;
    position: static;
    margin-bottom: 24px;
  }
  .detail-card {
    padding: 40px 32px;
  }
}

@media (max-width: 768px) {
  .detail-title {
    font-size: 24px;
  }
  .detail-card {
    padding: 32px 20px;
    border-radius: 16px;
  }
  .info-row {
    flex-direction: column;
    gap: 4px;
  }
  .info-label {
    width: 100%;
  }
}
</style>
