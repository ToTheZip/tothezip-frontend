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
            class="write-button"
            type="button"
            @click="showWriteForm ? closeWriteForm() : (showWriteForm = true)"
          >
            리뷰 작성하기
          </button>
        </div>

        <!-- 리뷰 작성 폼 -->
        <div v-if="showWriteForm" class="write-form">
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
            rows="3"
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
          <div v-for="r in reviews" :key="r.reviewId" class="review-item">
            <img
              class="avatar"
              :src="resolveImg(r.profileImg)"
              alt="profile"
              @error="onImgError"
            />

            <div class="review-body">
              <div class="review-top">
                <div class="stars">
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

              <div class="content">{{ r.reviewContent }}</div>
            </div>
          </div>

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
</template>

<script>
import axios from "axios";
import ChevronLeft from "@/components/icons/ChevronLeft.vue";
import defaultProfile from "@/assets/images/default_profile.png";
import { useAuthStore } from "@/stores/auth";

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

      // 작성 관련
      showWriteForm: false,
      newRating: 5,
      newContent: "",
      submitting: false,
      submitError: "",
    };
  },
  computed: {
    isLoggedIn() {
      const auth = useAuthStore();
      return !!auth.accessToken;
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
  methods: {
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

    closeWriteForm() {
      this.showWriteForm = false;
      this.newRating = 5;
      this.newContent = "";
      this.submitError = "";
      this.submitting = false;
    },

    async submitReview() {
      const auth = useAuthStore();
      const token = auth.accessToken;
      if (!token) return;

      const content = this.newContent.trim();
      if (!content) {
        this.submitError = "리뷰 내용을 입력해주세요.";
        return;
      }

      this.submitting = true;
      try {
        await axios.post(
          "/reviews",
          {
            aptSeq: this.aptSeq,
            reviewRating: this.newRating,
            reviewContent: content,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.closeWriteForm();
        await this.fetchFirst();
      } catch (e) {
        console.error(e);
        this.submitError =
          e?.response?.status === 401
            ? "로그인이 필요해요."
            : "리뷰 등록에 실패했어요.";
      } finally {
        this.submitting = false;
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
  },
};
</script>

<style scoped>
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

.write-form {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 12px;
  background: rgba(244, 236, 231, 0.25);
}

.rating-row {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
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

.write-actions button {
  height: 28px;
  border-radius: 8px;
  font-size: 11px;
}

.write-actions .cancel {
  border: 1px solid var(--tothezip-brown-01);
  background: #fff;
}

.write-actions .submit {
  background: var(--tothezip-brown-07);
  color: #fff;
  border: none;
}

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

.review-top {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
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
</style>
