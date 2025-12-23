<template>
  <div
    class="property-detail-panel"
    @click.stop
    @mousedown.stop
    @pointerdown.stop
    @touchstart.stop
  >
    <div class="detail-panel-content">
      <!-- 상단 바 -->
      <div class="detail-top-bar">
        <button class="back-button" @click="$emit('close')">
          <ChevronLeft />
        </button>

        <div class="panel-title">{{ buildingName || "리뷰" }}</div>
        <div class="spacer" />
      </div>

      <div class="section-divider">
        <div class="title-row">
          <h3 class="section-title">전체 리뷰</h3>

          <!-- 로그인 상태에서만 -->
          <button
            v-if="isLoggedIn"
            ref="writeBtn"
            class="write-button"
            type="button"
            @click.stop="toggleWritePopup"
          >
            리뷰 작성하기
          </button>
        </div>

        <!-- 리뷰 통계 -->
        <ReviewStats
          v-if="!loading && !error && totalCount > 0"
          :avg-rating="avgRating"
          :total-count="totalCount"
          :counts="counts"
        />

        <div
          v-if="!loading && !error && totalCount > 0"
          class="stats-divider"
        ></div>

        <!-- 목록 상태 -->
        <div v-if="loading" class="reviews-placeholder">
          <p>불러오는 중...</p>
        </div>

        <div v-else-if="error" class="reviews-placeholder">
          <p>{{ error }}</p>
        </div>

        <div v-else-if="reviews.length === 0" class="reviews-placeholder">
          <p>등록된 리뷰가 없어요.</p>
        </div>

        <!-- 리뷰 리스트 -->
        <div v-else class="reviews-list">
          <transition-group name="review" tag="div" class="reviews-list-inner">
            <ReviewItem
              v-for="r in reviews"
              :key="r.reviewId"
              :review="r"
              :is-mine="isMine(r)"
              :is-editing="editingId === r.reviewId"
              :editing="editing"
              :edit-error="editError"
              @edit="startEdit(r)"
              @delete="deleteReview(r)"
              @save-edit="handleSaveEdit(r, $event)"
              @cancel-edit="cancelEdit"
            />
          </transition-group>

          <button
            v-if="hasMore && !loadingMore"
            class="more-button"
            type="button"
            @click="loadMore"
          >
            더 보기
          </button>

          <div v-if="loadingMore" class="reviews-placeholder">
            <p>더 불러오는 중...</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- body로 빼서 z-index/overflow 영향 제거 -->
  <teleport to="body">
    <transition name="toast">
      <div v-if="showSuccessToast" class="success-toast">리뷰 등록 완료!</div>
    </transition>
    <div
      v-if="showWritePopup"
      class="popup-backdrop"
      @mousedown="closeWriteForm"
      @touchstart="closeWriteForm"
    >
      <div
        class="write-popover"
        :style="popoverStyle"
        @mousedown.stop
        @touchstart.stop
        @click.stop
      >
        <div class="popover-arrow" />

        <div class="popover-title">리뷰 작성</div>

        <div class="rating-row">
          <span
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ filled: i <= newRating }"
            @click="newRating = i"
          >
            ★
          </span>
        </div>

        <textarea
          v-model="newContent"
          class="content-input"
          placeholder="리뷰를 입력해주세요."
          rows="4"
        />

        <p v-if="submitError" class="submit-error">{{ submitError }}</p>

        <div class="write-actions">
          <button class="cancel" type="button" @click="closeWriteForm">
            취소
          </button>
          <button
            class="submit"
            type="button"
            :disabled="submitting"
            @click="submitReview"
          >
            {{ submitting ? "등록 중..." : "등록" }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import axios from "axios";
import ChevronLeft from "@/components/icons/ChevronLeft.vue";
import { useAuthStore } from "@/stores/auth";
import { http } from "@/api/http";
import ReviewItem from "@/components/search/ReviewItem.vue";
import ReviewStats from "@/components/search/ReviewStats.vue";

export default {
  name: "ReviewListPanel",
  components: {
    ChevronLeft,
    ReviewItem,
    ReviewStats,
  },
  props: {
    aptSeq: { type: String, required: true },
    buildingName: { type: String, default: "" },
  },
  emits: ["close"],
  data() {
    return {
      reviews: [],
      totalCount: 0,
      hasMore: false,
      limit: 20,
      offset: 0,
      loading: false,
      loadingMore: false,
      error: "",

      // 작성 팝업
      showWritePopup: false,
      popoverStyle: {
        position: "fixed",
        top: "0px",
        left: "0px",
      },

      newRating: 5,
      newContent: "",
      submitting: false,
      submitError: "",

      showSuccessToast: false,
      toastTimer: null,

      editingId: null,
      editContent: "",
      editRating: 5,
      editing: false,
      editError: "",

      avgRating: 0,
      counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  },
  computed: {
    isLoggedIn() {
      const auth = useAuthStore();
      return auth.isLoggedIn;
    },
    myUserId() {
      const auth = useAuthStore();
      return auth?.user?.userId ?? null;
    },
  },
  watch: {
    aptSeq: {
      immediate: true,
      handler() {
        this.fetchFirst();
        this.closeWriteForm();
      },
    },
  },
  mounted() {
    // 스크롤/리사이즈 시 위치 갱신
    window.addEventListener("scroll", this.repositionPopover, true);
    window.addEventListener("resize", this.repositionPopover);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.repositionPopover, true);
    window.removeEventListener("resize", this.repositionPopover);
  },
  methods: {
    // 버튼 옆에 붙이기: 위치 측정
    repositionPopover() {
      if (!this.showWritePopup) return;

      const btn = this.$refs.writeBtn;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();

      // 버튼 오른쪽에 뜨게 (간격 10px)
      const gap = 10;
      const top = rect.top + rect.height / 2; // 세로 기준점
      const left = rect.right + gap;

      // 팝업이 화면 밖으로 나가면 위/왼쪽으로 보정
      const popupW = 260;
      const popupH = 240;

      let x = left;
      let y = top - 20; // 살짝 위로

      if (x + popupW > window.innerWidth - 8) {
        // 오른쪽 공간 부족하면 왼쪽에 띄우기
        x = rect.left - gap - popupW;
      }
      if (y + popupH > window.innerHeight - 8) {
        y = window.innerHeight - popupH - 8;
      }
      if (y < 8) y = 8;

      this.popoverStyle = {
        position: "fixed",
        left: `${Math.round(x)}px`,
        top: `${Math.round(y)}px`,
      };
    },

    toggleWritePopup() {
      if (this.showWritePopup) {
        this.closeWriteForm();
        return;
      }
      this.showWritePopup = true;
      this.submitError = "";
      this.$nextTick(() => this.repositionPopover());
    },

    closeWriteForm() {
      this.showWritePopup = false;
      this.newRating = 5;
      this.newContent = "";
      this.submitError = "";
      this.submitting = false;
    },

    async fetchFirst() {
      if (!this.aptSeq) return;

      this.loading = true;
      this.error = "";
      this.reviews = [];
      this.offset = 0;
      this.hasMore = false;

      try {
        const { data } = await axios.get(`/reviews/${this.aptSeq}`, {
          params: { limit: this.limit, offset: 0 },
        });

        this.totalCount = Number(data?.totalCount || 0);
        this.reviews = Array.isArray(data?.reviews) ? data.reviews : [];
        this.offset = this.reviews.length;
        this.hasMore = !!data?.hasMore;

        // 통계 반영
        this.avgRating = Number(data?.avgRating || 0);
        this.counts = {
          1: Number(data?.count1 || 0),
          2: Number(data?.count2 || 0),
          3: Number(data?.count3 || 0),
          4: Number(data?.count4 || 0),
          5: Number(data?.count5 || 0),
        };
      } catch (e) {
        console.error(e);
        this.error = "리뷰를 불러오지 못했어요.";
      } finally {
        this.loading = false;
      }
    },

    async loadMore() {
      if (!this.hasMore) return;

      this.loadingMore = true;
      try {
        const { data } = await axios.get(`/reviews/${this.aptSeq}`, {
          params: { limit: this.limit, offset: this.offset },
        });

        const more = Array.isArray(data?.reviews) ? data.reviews : [];
        this.reviews.push(...more);
        this.offset = this.reviews.length;
        this.hasMore = !!data?.hasMore;
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingMore = false;
      }
    },

    async submitReview() {
      const auth = useAuthStore();
      if (!auth.accessToken) return;

      const content = this.newContent.trim();
      if (!content) {
        this.submitError = "리뷰 내용을 입력해주세요.";
        return;
      }

      this.submitting = true;
      try {
        const payload = {
          aptSeq: this.aptSeq,
          reviewRating: this.newRating,
          reviewContent: content,
        };

        // 등록
        await http.post("/reviews", payload);

        this.closeWriteForm();

        const newItem = {
          reviewId: `temp-${Date.now()}`,
          profileImg: auth?.user?.profileImg || "",
          reviewRating: payload.reviewRating,
          reviewContent: payload.reviewContent,
          reviewDate: new Date().toISOString(),
        };

        this.reviews.unshift(newItem);
        // ✅ 즉시 통계 반영 (현재 리스트 기준)
        this.recalcStatsFromCurrentList();
        this.totalCount += 1;

        this.hasMore = this.totalCount > this.reviews.length;

        this.showToast();

        setTimeout(() => {
          this.fetchFirst();
        }, 450);
      } catch (e) {
        console.error(e);
        this.submitError =
          e?.response?.status === 401 || e?.response?.status === 403
            ? "로그인이 필요해요."
            : "리뷰 등록에 실패했어요.";
      } finally {
        this.submitting = false;
      }
    },
    isMine(r) {
      return (
        this.isLoggedIn &&
        this.myUserId != null &&
        Number(r.userId) === Number(this.myUserId)
      );
    },

    startEdit(r) {
      this.editingId = r.reviewId;
      this.editError = "";
    },

    cancelEdit() {
      this.editingId = null;
      this.editError = "";
      this.editing = false;
    },

    async handleSaveEdit(review, { content, rating, error }) {
      if (error) {
        this.editError = error;
        return;
      }

      this.editing = true;
      this.editError = "";

      try {
        await http.put(`/reviews/${review.reviewId}`, {
          reviewContent: content,
          reviewRating: rating,
        });

        review.reviewContent = content;
        review.reviewRating = rating;
        this.recalcStatsFromCurrentList();
        this.cancelEdit();
      } catch (e) {
        console.error(e);
        this.editError =
          e?.response?.status === 403
            ? "본인 리뷰만 수정할 수 있어요."
            : "수정에 실패했어요.";
      } finally {
        this.editing = false;
      }
    },

    async deleteReview(r) {
      if (!confirm("리뷰를 삭제할까요?")) return;

      try {
        await http.delete(`/reviews/${r.reviewId}`);

        this.reviews = this.reviews.filter((x) => x.reviewId !== r.reviewId);
        this.totalCount = Math.max(0, this.totalCount - 1);
        this.hasMore = this.totalCount > this.reviews.length;
        this.recalcStatsFromCurrentList();

        if (this.editingId === r.reviewId) this.cancelEdit();
      } catch (e) {
        console.error(e);
        alert(
          e?.response?.status === 403
            ? "본인 리뷰만 삭제할 수 있어요."
            : "삭제에 실패했어요."
        );
      }
    },

    showToast() {
      this.showSuccessToast = true;

      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }

      this.toastTimer = setTimeout(() => {
        this.showSuccessToast = false;
      }, 2800);
    },
    recalcStatsFromCurrentList() {
      const list = Array.isArray(this.reviews) ? this.reviews : [];
      const total = Number(this.totalCount || 0);

      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sum = 0;
      let n = 0;

      for (const r of list) {
        const rating = Math.min(5, Math.max(1, Number(r.reviewRating) || 0));
        if (!rating) continue;
        counts[rating] += 1;
        sum += rating;
        n += 1;
      }

      this.counts = counts;
      this.avgRating = n ? sum / n : 0;
    },
  },
};
</script>

<style scoped>
/* 기존 패널 */
.property-detail-panel {
  position: absolute;
  left: 277px;
  top: 7px;
  width: 270px;
  height: calc(100% - 14px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 2px 4px 4px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  z-index: 300;
}

.detail-panel-content {
  height: 100%;
  overflow-y: auto;
}

.detail-top-bar {
  height: 43px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-bottom: 1px solid var(--tothezip-brown-01);
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
}

.panel-title {
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
}

.section-divider {
  padding: 15px 10px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.write-button {
  border: 1px solid var(--tothezip-brown-01);
  background: #fff;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  cursor: pointer;
}

/* scoped라서 teleport된 DOM에 안 먹을 수 있음 → :deep()로 처리 */
:deep(.popup-backdrop) {
  position: fixed;
  inset: 0;
  z-index: 9998; /* 지도/패널 위로 */
  background: transparent;
}

:deep(.write-popover) {
  width: 260px;
  padding: 12px 12px 10px;
  background: #fff;
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
  z-index: 9999;
}

:deep(.popover-arrow) {
  position: absolute;
  left: -6px;
  top: 18px;
  width: 12px;
  height: 12px;
  background: #fff;
  border-left: 1px solid var(--tothezip-brown-01);
  border-bottom: 1px solid var(--tothezip-brown-01);
  transform: rotate(45deg);
}

:deep(.popover-title) {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

/* 작성 UI */
.rating-row {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}
/* 조회용 별점 */
.stars {
  display: inline-flex;
  gap: 1px;
  line-height: 1;
}
/* 편집용 별점(작성/편집 공통) */
.rating-row {
  display: flex;
  gap: 1px;
  margin-bottom: 8px;
  line-height: 1;
}
.star {
  font-size: 14px;
  opacity: 0.25;
  cursor: pointer;
}
.star.filled {
  opacity: 1;
  color: var(--tothezip-ruby-06);
}
.content-input {
  width: 100%;
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 8px;
  padding: 6px;
  font-size: 11px;
  box-sizing: border-box;
}
.submit-error {
  margin-top: 6px;
  font-size: 10px;
  color: #d22;
}
.write-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
}
.write-actions .cancel {
  border: 1px solid var(--tothezip-brown-01);
  background: #fff;
  border-radius: 8px;
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}
.write-actions .submit {
  background: var(--tothezip-brown-07);
  color: #fff;
  border: none;
  border-radius: 8px;
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}

.more-button {
  width: 100%;
  height: 32px;
  border-radius: 10px;
  border: 1px solid var(--tothezip-brown-01);
  background: #fff;
}

.success-toast {
  position: fixed;
  left: 50%;
  bottom: 36px;
  transform: translateX(-50%);

  background: rgba(255, 237, 219, 0.95);
  color: #f08a3c;

  padding: 10px 18px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;

  z-index: 20000;

  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);

  border: none;
  letter-spacing: -0.2px;

  backdrop-filter: blur(2px);
}

/* transition */
:deep(.toast-enter-active),
:deep(.toast-leave-active) {
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:deep(.toast-enter-from) {
  opacity: 0;
  transform: translate(-50%, 14px) scale(0.96);
}

:deep(.toast-enter-to) {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

:deep(.toast-leave-from) {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

:deep(.toast-leave-to) {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.98);
}

:deep(.review-enter-active) {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
}
:deep(.review-enter-from) {
  opacity: 0;
  transform: translateX(18px);
}
:deep(.review-enter-to) {
  opacity: 1;
  transform: translateX(0);
}

:deep(.review-move) {
  transition: transform 0.28s ease;
}

.stats-divider {
  margin: 10px 2px 12px;
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
}
</style>
