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
        <div v-if="!loading && !error && totalCount > 0" class="review-stats">
          <div class="stats-left">
            <div class="avg-score">{{ avgRating.toFixed(1) }}</div>
            <div class="avg-stars">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= Math.round(avgRating) }"
              >
                ★
              </span>
            </div>
            <div class="stats-total">({{ totalCount }}개)</div>
          </div>

          <div class="stats-right">
            <div v-for="s in [5, 4, 3, 2, 1]" :key="s" class="stat-row">
              <span class="stat-label">{{ s }}점</span>
              <div class="stat-bar">
                <div
                  class="stat-bar-fill"
                  :style="{ width: ratingPercent(s) + '%' }"
                />
              </div>
              <span class="stat-count">{{ ratingCount(s) }}</span>
            </div>
          </div>
        </div>

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
            <div v-for="r in reviews" :key="r.reviewId" class="review-item">
              <img
                class="avatar"
                :src="resolveImg(r.profileImg)"
                alt="profile"
                @error="onImgError"
              />
              <div class="review-body">
                <div class="review-top">
                  <!-- 편집 중 아닐 때만 별점 -->
                  <div v-if="editingId !== r.reviewId" class="stars">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="star"
                      :class="{ filled: i <= (Number(r.reviewRating) || 0) }"
                    >
                      ★
                    </span>
                  </div>

                  <span class="date">{{ formatDate(r.reviewDate) }}</span>
                </div>

                <!-- 편집 모드 -->
                <div v-if="editingId === r.reviewId" class="edit-area">
                  <div class="rating-row small">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="star"
                      :class="{ filled: i <= editRating }"
                      @click="editRating = i"
                    >
                      ★
                    </span>
                  </div>

                  <textarea
                    v-model="editContent"
                    class="content-input"
                    rows="3"
                  />
                  <p v-if="editError" class="submit-error">{{ editError }}</p>

                  <div class="write-actions">
                    <button class="cancel" type="button" @click="cancelEdit">
                      취소
                    </button>
                    <button
                      class="submit"
                      type="button"
                      :disabled="editing"
                      @click="saveEdit"
                    >
                      {{ editing ? "저장 중..." : "저장" }}
                    </button>
                  </div>
                </div>

                <!-- 일반 모드 -->
                <div v-else class="content">{{ r.reviewContent }}</div>

                <!-- 버튼은 아래로 -->
                <div
                  v-if="isMine(r) && editingId !== r.reviewId"
                  class="review-actions-row"
                >
                  <button
                    class="action-btn"
                    type="button"
                    @click.stop="startEdit(r)"
                  >
                    편집
                  </button>
                  <button
                    class="action-btn danger"
                    type="button"
                    @click.stop="deleteReview(r)"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
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
import defaultProfile from "@/assets/images/default_profile.png";
import { useAuthStore } from "@/stores/auth";
import { http } from "@/api/http";

export default {
  name: "ReviewListPanel",
  components: { ChevronLeft },
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
    ratingCount(score) {
      return Number(this.counts?.[score] || 0);
    },
    ratingPercent(score) {
      const total = Number(this.totalCount || 0);
      if (!total) return 0;
      return Math.round((this.ratingCount(score) / total) * 100);
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
      this.editContent = r.reviewContent || "";
      this.editRating = Number(r.reviewRating) || 5;
      this.editError = "";
    },

    cancelEdit() {
      this.editingId = null;
      this.editContent = "";
      this.editRating = 5;
      this.editError = "";
      this.editing = false;
    },

    async saveEdit() {
      const target = this.reviews.find((x) => x.reviewId === this.editingId);
      const prevRating = target ? Number(target.reviewRating) || 0 : 0;

      if (!this.editingId) return;

      const content = this.editContent.trim();
      if (!content) {
        this.editError = "내용을 입력해주세요.";
        return;
      }
      if (this.editRating < 1 || this.editRating > 5) {
        this.editError = "별점은 1~5점이어야 해요.";
        return;
      }

      this.editing = true;
      this.editError = "";

      try {
        await http.put(`/reviews/${this.editingId}`, {
          reviewContent: content,
          reviewRating: this.editRating,
        });

        const target = this.reviews.find((x) => x.reviewId === this.editingId);
        if (target) {
          target.reviewContent = content;
          target.reviewRating = this.editRating;
          // 즉시 통계 반영
          this.recalcStatsFromCurrentList();
        }

        this.cancelEdit();
        // 필요하면 최신화
        // await this.fetchFirst();
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

      const prevRating = Number(r.reviewRating) || 0;

      try {
        await http.delete(`/reviews/${r.reviewId}`);

        this.reviews = this.reviews.filter((x) => x.reviewId !== r.reviewId);
        this.totalCount = Math.max(0, this.totalCount - 1);
        this.hasMore = this.totalCount > this.reviews.length;

        this.recalcStatsFromCurrentList();

        // 편집중인 리뷰 삭제한 경우
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

    resolveImg(profileImg) {
      return profileImg && profileImg.trim() ? profileImg : defaultProfile;
    },
    onImgError(e) {
      e.target.src = defaultProfile;
    },
    formatDate(v) {
      if (!v) return "";
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    },
    showToast() {
      this.showSuccessToast = true;

      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }

      this.toastTimer = setTimeout(() => {
        this.showSuccessToast = false;
      }, 2800); // 1.5초 후 사라짐
    },
    recalcStatsFromCurrentList() {
      // 현재 화면에 들고 있는 reviews(보통 limit개) 기준으로 통계를 즉시 갱신
      // (서버의 전체 통계와 100% 동일하진 않을 수 있지만 "즉시 반영" 목적엔 좋음)

      const list = Array.isArray(this.reviews) ? this.reviews : [];
      const total = Number(this.totalCount || 0);

      // totalCount는 "전체 리뷰 수"이므로 그대로 두고,
      // 현재 리스트에서 rating 분포를 계산할 때는
      // "현재 리스트" 기준으로만 계산해서 보여줄지,
      // 아니면 "전체" 기반을 유지할지 선택이 필요함.
      //
      // 여기서는 UX상 자연스럽게: "현재 리스트(화면)" 기준으로 즉시 보이도록 갱신.
      // (서버 전체 분포가 꼭 필요하면 아래 2번 방법 참고)

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

      // totalCount는 "전체 리뷰 수"라서 그대로 유지하는 편이 일반적
      // 다만 처음 페이지에서만 보는 화면이면 totalCount와 n이 같으니 문제 없음
    },

    // 특정 리뷰 1건의 rating 변경/추가/삭제를 "증분"으로 반영하고 싶으면 이 방식도 가능
    applyRatingDelta({ prevRating = null, nextRating = null }) {
      const counts = { ...this.counts };

      const dec = (v) => {
        const k = Number(v);
        if (k >= 1 && k <= 5)
          counts[k] = Math.max(0, Number(counts[k] || 0) - 1);
      };
      const inc = (v) => {
        const k = Number(v);
        if (k >= 1 && k <= 5) counts[k] = Number(counts[k] || 0) + 1;
      };

      if (prevRating != null) dec(prevRating);
      if (nextRating != null) inc(nextRating);

      this.counts = counts;

      // avgRating도 counts로 다시 계산
      const totalRatings =
        counts[1] + counts[2] + counts[3] + counts[4] + counts[5];
      const sum =
        1 * counts[1] +
        2 * counts[2] +
        3 * counts[3] +
        4 * counts[4] +
        5 * counts[5];

      this.avgRating = totalRatings ? sum / totalRatings : 0;
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

/* 리뷰 리스트(기존) */
.review-item {
  display: flex;
  gap: 10px;
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 8px;
}
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}
/* .review-top {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
} */
.review-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.date {
  font-size: 10px;
  font-weight: 500;
  color: var(--tothezip-gray-04);
  white-space: nowrap;
  line-height: 1;
}

.review-top .right-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.review-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.review-actions-row {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.action-btn {
  border: none;
  background: rgba(255, 237, 219, 0.95);
  color: #f08a3c;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn:hover {
  opacity: 0.85;
}

.action-btn.danger {
  background: rgba(255, 230, 230, 0.95);
  color: #d64b4b;
}

.edit-area {
  margin-top: 8px;
}

.rating-row.small .star {
  font-size: 13px;
}

.content {
  font-size: 11px;
  margin-top: 4px;
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
.review-stats {
  margin-top: 10px;
  padding: 10px 10px;
  border: 1px solid rgba(240, 138, 60, 0.18);
  background: rgba(255, 237, 219, 0.55);
  border-radius: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.stats-left {
  width: 78px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.avg-score {
  font-size: 22px;
  font-weight: 800;
  color: #f08a3c;
  letter-spacing: -0.5px;
  line-height: 1;
}

.avg-stars {
  display: inline-flex;
  gap: 1px;
  line-height: 1;
}

.stats-total {
  font-size: 10px;
  color: var(--tothezip-gray-04);
}

.stats-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: grid;
  grid-template-columns: 28px 1fr 26px;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 10px;
  color: var(--tothezip-gray-05);
  white-space: nowrap;
}

.stat-count {
  font-size: 10px;
  color: var(--tothezip-gray-05);
  text-align: right;
  white-space: nowrap;
}

.stat-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 999px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: rgba(240, 138, 60, 0.85);
}

.stats-divider {
  margin: 10px 2px 12px;
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
}
</style>
