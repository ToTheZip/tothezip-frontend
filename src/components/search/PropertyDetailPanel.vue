<template>
  <div class="property-detail-panel">
    <div class="detail-panel-content">
      <div class="detail-top-bar">
        <button class="back-button" @click="$emit('close')">
          <ChevronLeft />
        </button>
      </div>

      <!-- 이미지 -->
      <div class="images-area">
        <div class="main-image-wrapper">
          <div class="main-image-box">
            <img :src="mainImage" :alt="property.name" class="main-image" />
          </div>
        </div>

        <div class="sub-images-wrapper">
          <div
            v-for="(img, index) in subThumbs"
            :key="index"
            class="sub-image-box"
          >
            <img
              :src="img"
              :alt="`${property.name} ${index + 2}`"
              class="sub-image"
            />

            <div
              v-if="index === 3 && remainingCount > 0"
              class="image-more-overlay"
            >
              <span class="more-text">+ {{ remainingCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 건물 정보 -->
      <div class="building-info-section">
        <div class="tags-row-detail">
          <span v-for="tag in property.tags" :key="tag" class="detail-tag">
            #{{ tag }}
          </span>
        </div>

        <div class="building-name">
          <h2>{{ property.name }}</h2>
        </div>

        <div class="building-details">
          <div class="detail-row">
            <MapPin :size="15" />
            <span class="detail-text">{{ property.address }}</span>
          </div>

          <div class="detail-row">
            <Building />
            <span class="detail-text">{{ property.buildYear }}</span>
          </div>
        </div>
      </div>

      <!-- 거래 기록 -->
      <div class="section-divider">
        <h3 class="section-title">거래 기록</h3>
        <div class="chart-placeholder"><p>시세 그래프</p></div>
      </div>

      <!-- 매물 -->
      <div class="section-divider">
        <h3 class="section-title">매물</h3>
        <div class="listings-area">
          <div v-if="listingsLoading" class="listings-placeholder">
            <p>불러오는 중...</p>
          </div>

          <div v-else-if="listingsError" class="listings-placeholder">
            <p>{{ listingsError }}</p>
          </div>

          <div v-else-if="listings.length === 0" class="listings-placeholder">
            <p>등록된 매물이 없어요.</p>
          </div>

          <div v-else class="listings-list">
            <div
              v-for="item in listings"
              :key="item.propertyId"
              class="listing-item"
            >
              <div class="listing-top">
                <span class="listing-type">{{ item.type }}</span>
                <div class="listing-right">
                  <span class="listing-price">{{
                    formatListingPrice(item)
                  }}</span>
                  <button
                    class="listing-like-button"
                    type="button"
                    @click.stop="toggleListingLike(item)"
                    aria-label="찜"
                  >
                    <HeartOutline
                      :filled="!!item.isLiked"
                      class="listing-heart-icon"
                    />
                  </button>
                </div>
              </div>

              <div class="listing-bottom">
                <span class="meta">{{ toPyeong(item.area) }}평</span>
                <span class="dot">·</span>
                <span class="meta">{{ item.floor }}층</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 리뷰 -->
      <div class="section-divider">
        <div class="section-title-row">
          <h3 class="section-title">
            리뷰
            <span class="review-count">({{ reviewsTotalCount }})</span>
          </h3>

          <button
            class="reviews-more-button"
            type="button"
            @click="
              $emit('open-reviews', {
                aptSeq: property.aptSeq,
                name: property.name,
              })
            "
            aria-label="전체 리뷰 보기"
          >
            <ChevronRight class="chevron-icon" />
          </button>
        </div>

        <div v-if="reviewsLoading" class="reviews-placeholder">
          <p>불러오는 중...</p>
        </div>

        <div v-else-if="reviewsError" class="reviews-placeholder">
          <p>{{ reviewsError }}</p>
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
              </div>

              <div class="content">{{ r.reviewContent }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ChevronLeft from "@/components/icons/ChevronLeft.vue";
import ChevronRight from "@/components/icons/ChevronRight.vue";
import HeartOutline from "@/components/icons/HeartOutline.vue";
import MapPin from "@/components/icons/MapPin.vue";
import Building from "@/components/icons/Building.vue";
import defaultProfile from "@/assets/images/default_profile.png";

export default {
  name: "PropertyDetailPanel",
  components: {
    ChevronLeft,
    ChevronRight,
    HeartOutline,
    MapPin,
    Building,
  },
  props: {
    property: { type: Object, required: true },
  },
  emits: ["close", "open-all-reviews", "open-reviews"],
  computed: {
    allImages() {
      const arr = Array.isArray(this.property?.images)
        ? this.property.images
        : [];
      const main = this.property?.image ? [this.property.image] : [];
      const subs = Array.isArray(this.property?.subImages)
        ? this.property.subImages
        : [];
      const merged = arr.length ? arr : [...main, ...subs];
      return Array.from(new Set(merged)).filter(Boolean);
    },
    mainImage() {
      return this.allImages[0] || this.property?.image || "";
    },
    subThumbs() {
      return this.allImages.slice(1, 5);
    },
    remainingCount() {
      return Math.max(0, this.allImages.length - 5);
    },

    // 리뷰 5개 이상이면 더보기 버튼
    showReviewMore() {
      return (this.reviewsTotal || 0) >= 5;
    },
  },
  data() {
    return {
      listings: [],
      listingsLoading: false,
      listingsError: "",

      // reviews
      reviews: [],
      reviewsTotalCount: 0,
      reviewsLoading: false,
      reviewsError: "",
    };
  },
  watch: {
    "property.aptSeq": {
      immediate: true,
      handler() {
        this.fetchListings();
        this.fetchReviewsPreview(); // 추가
      },
    },
  },
  methods: {
    toggleListingLike(item) {
      item.isLiked = !item.isLiked;
    },

    async fetchListings() {
      const aptSeq = this.property?.aptSeq;
      if (!aptSeq) return;

      this.listingsLoading = true;
      this.listingsError = "";
      this.listings = [];

      try {
        const { data } = await axios.get(`/property/${aptSeq}/listings`);
        this.listings = Array.isArray(data)
          ? data.map((x) => ({ ...x, isLiked: false }))
          : [];
      } catch (e) {
        console.error(e);
        this.listingsError = "매물 정보를 불러오지 못했어요.";
      } finally {
        this.listingsLoading = false;
      }
    },

    // 리뷰 5개 프리뷰 가져오기
    async fetchReviewsPreview() {
      const aptSeq = this.property?.aptSeq;
      if (!aptSeq) return;

      this.reviewsLoading = true;
      this.reviewsError = "";
      this.reviews = [];
      this.reviewsTotalCount = 0;

      try {
        const { data } = await axios.get(`/reviews/${aptSeq}`, {
          params: { limit: 2, offset: 0 },
        });

        this.reviewsTotalCount = Number(data?.totalCount || 0);
        this.reviews = Array.isArray(data?.reviews) ? data.reviews : [];
      } catch (e) {
        console.error(e);
        this.reviewsError = "리뷰를 불러오지 못했어요.";
      } finally {
        this.reviewsLoading = false;
      }
    },
    resolveImg(profileImg) {
      return profileImg && profileImg.trim() ? profileImg : defaultProfile;
    },
    onImgError(e) {
      e.target.src = defaultProfile;
    },

    openAllReviews() {
      // 부모가 패널 전환하도록 이벤트만 던짐
      this.$emit("open-all-reviews", {
        aptSeq: this.property?.aptSeq,
        aptName: this.property?.name,
      });
    },

    // --- util ---
    toNumber(v) {
      if (v == null) return null;
      const s = String(v).trim();
      if (!s) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    },
    toPyeong(area) {
      const n = Number(area);
      if (!Number.isFinite(n)) return "-";
      return (n / 3.305785).toFixed(1);
    },
    formatMoney(v) {
      const n = this.toNumber(v);
      if (n == null) return "-";
      if (n >= 10000) {
        const eok = Math.floor(n / 10000);
        const rest = n % 10000;
        return rest === 0 ? `${eok}억` : `${eok}억 ${rest}만원`;
      }
      return `${n}만원`;
    },
    formatListingPrice(item) {
      if (item.type === "월세") {
        const dep = item.deposit ? this.formatMoney(item.deposit) : "0만원";
        const rent = this.formatMoney(item.price);
        return `월세 ${dep} / ${rent}`;
      }
      return `${item.type} ${this.formatMoney(item.price)}`;
    },

    // 프로필 이미지 경로 처리 (서버가 /uploads/... 처럼 주는 케이스 대응)
    profileSrc(path) {
      if (!path) return "/images/default_profile.png"; // 너네 기본 이미지로 교체해도 됨
      // 이미 http로 내려오면 그대로
      if (String(path).startsWith("http")) return path;
      return path; // "/uploads/xxx.png" 형태면 그대로 사용
    },

    formatDate(v) {
      if (!v) return "";
      // "2025-12-23 10:11:12" / ISO 둘 다 대충 처리
      const s = String(v).replace(" ", "T");
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return String(v).slice(0, 10);
      return d.toISOString().slice(0, 10);
    },
  },
};
</script>

<style scoped>
/* --- 기존 스타일 그대로 --- */
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
  z-index: 200;
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
}

.back-button,
.like-button {
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

.images-area {
  width: 100%;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.main-image-wrapper {
  width: 100%;
}

.main-image-box {
  width: 100%;
  height: 150px;
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid var(--tothezip-brown-01);
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sub-images-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

.sub-image-box {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--tothezip-brown-01);
}

.sub-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-more-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-text {
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.building-info-section {
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.tags-row-detail {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.detail-tag {
  font-family: "Pretendard", sans-serif;
  font-size: 8px;
  font-weight: 500;
  color: var(--tothezip-gray-04);
  border: 1px solid var(--tothezip-gray-04);
  border-radius: 50px;
  padding: 2px 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.building-name h2 {
  font-family: "Pretendard", sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.building-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.detail-text {
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: var(--tothezip-gray-04);
}

.section-divider {
  padding: 15px 10px;
  border-top: 1px solid var(--tothezip-brown-01);
  flex-shrink: 0;
}

.section-title {
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.chart-placeholder,
.listings-placeholder,
.reviews-placeholder {
  padding: 20px;
  background: rgba(244, 236, 231, 0.3);
  border-radius: 10px;
  text-align: center;
}

/* --- listings 기존 --- */
.listings-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.listings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.listing-item {
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 12px;
  padding: 10px;
  background: #fff;
}

.listing-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.listing-type {
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: var(--tothezip-brown-06);
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 999px;
  padding: 2px 8px;
  flex-shrink: 0;
}

.listing-price {
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #000;
  white-space: nowrap;
}

.listing-bottom {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--tothezip-gray-04);
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
}

.dot {
  opacity: 0.6;
}

.listing-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.listing-like-button {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
}

.listing-heart-icon {
  color: var(--tothezip-brown-07);
}

/* 리뷰 헤더(제목 + 화살표) */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.chevron-right-icon {
  color: var(--tothezip-brown-07);
}

/* 리뷰 리스트 */
.reviews-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.review-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--tothezip-brown-01);
}

.review-body {
  flex: 1;
  min-width: 0;
}

.review-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stars {
  display: inline-flex;
  gap: 2px;
  font-size: 12px;
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

.review-date {
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  color: var(--tothezip-gray-04);
  white-space: nowrap;
}

.review-content {
  margin: 6px 0 0 0;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: #000;
  line-height: 1.35;
  word-break: break-word;
}

.review-count {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--tothezip-gray-04);
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.reviews-more-button {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 16px;
  font-weight: 600;
  color: var(--tothezip-brown-07);
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: var(--tothezip-brown-07);
}

.reviews-more-button:hover .chevron-icon {
  opacity: 0.7;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
}

.star.filled {
  opacity: 1;
}

.content {
  margin-top: 6px;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  color: #000;
  line-height: 1.35;
  word-break: break-word;
}
</style>
