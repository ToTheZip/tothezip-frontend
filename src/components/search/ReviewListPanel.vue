<template>
  <div class="property-detail-panel">
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
        <h3 class="section-title">전체 리뷰</h3>

        <div v-if="loading" class="reviews-placeholder">
          <p>불러오는 중...</p>
        </div>
        <div v-else-if="error" class="reviews-placeholder">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="reviews.length === 0" class="reviews-placeholder">
          <p>등록된 리뷰가 없어요.</p>
        </div>

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
                    >★</span
                  >
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
    };
  },
  watch: {
    aptSeq: {
      immediate: true,
      handler() {
        this.fetchFirst();
      },
    },
  },
  methods: {
    async fetchFirst() {
      if (!this.aptSeq) return;

      this.loading = true;
      this.error = "";
      this.reviews = [];
      this.totalCount = 0;
      this.hasMore = false;
      this.offset = 0;

      try {
        const { data } = await axios.get(`/reviews/${this.aptSeq}`, {
          params: { limit: this.limit, offset: this.offset },
        });

        // 백엔드 응답: { totalCount, hasMore, reviews }
        this.totalCount = Number(data?.totalCount || 0);
        this.hasMore = !!data?.hasMore;
        this.reviews = Array.isArray(data?.reviews) ? data.reviews : [];
        this.offset = this.reviews.length;
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
        this.totalCount = Number(data?.totalCount || this.totalCount);
        this.hasMore = !!data?.hasMore;

        this.reviews = [...this.reviews, ...more];
        this.offset = this.reviews.length;
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingMore = false;
      }
    },

    resolveImg(profileImg) {
      // null, 빈 문자열, undefined 전부 기본 이미지로
      return profileImg && profileImg.trim() ? profileImg : defaultProfile;
    },

    onImgError(e) {
      // 이미지 로딩 실패 시에도 기본 이미지
      e.target.src = defaultProfile;
    },

    formatDate(v) {
      if (!v) return "";
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
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
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 2px 4px 4px 0px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  z-index: 210;
}

.detail-panel-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
}

.detail-top-bar {
  width: 100%;
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--tothezip-brown-01);
}

.back-button {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.panel-title {
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #000;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spacer {
  width: 20px;
  height: 20px;
}

.section-divider {
  padding: 15px 10px;
}

.section-title {
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin: 0 0 10px 0;
}

.reviews-placeholder {
  padding: 20px;
  background: rgba(244, 236, 231, 0.3);
  border-radius: 10px;
  text-align: center;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-item {
  display: flex;
  gap: 10px;
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 12px;
  padding: 10px;
  background: #fff;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--tothezip-brown-01);
  flex-shrink: 0;
}

.review-body {
  flex: 1;
  min-width: 0;
}

.review-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.stars {
  display: inline-flex;
  gap: 1px;
  font-size: 11px;
  line-height: 1;
}

.star {
  opacity: 0.25;
  color: #cfc5bf;
}

.star.filled {
  opacity: 1;
  color: var(--tothezip-ruby-06);
}

.date {
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  color: var(--tothezip-gray-04);
}

.content {
  margin-top: 6px;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  color: #000;
  line-height: 1.35;
  word-break: break-word;
}

.more-button {
  margin-top: 6px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--tothezip-brown-01);
  background: #fff;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
}
</style>
