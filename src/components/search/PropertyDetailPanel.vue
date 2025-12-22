<template>
  <div class="property-detail-panel">
    <div class="detail-panel-content">
      <div class="detail-top-bar">
        <button class="back-button" @click="$emit('close')">
          <ChevronLeft />
        </button>

        <button class="like-button" @click="$emit('toggle-like')">
          <HeartOutline :filled="property.isLiked" class="heart-icon" />
        </button>
      </div>

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

            <!-- 4번째 썸네일(= index 3) 위에 +n -->
            <div
              v-if="index === 3 && remainingCount > 0"
              class="image-more-overlay"
            >
              <span class="more-text">+ {{ remainingCount }}</span>
            </div>
          </div>
        </div>
      </div>

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

      <div class="section-divider">
        <h3 class="section-title">거래 기록</h3>
        <div class="chart-placeholder"><p>시세 그래프</p></div>
      </div>

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
                <span class="listing-price">{{
                  formatListingPrice(item)
                }}</span>
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

      <div class="section-divider">
        <h3 class="section-title">리뷰</h3>
        <div class="reviews-placeholder">
          <p>리뷰 영역</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ChevronLeft from "@/components/icons/ChevronLeft.vue";
import HeartOutline from "@/components/icons/HeartOutline.vue";
import MapPin from "@/components/icons/MapPin.vue";
import Building from "@/components/icons/Building.vue";

export default {
  name: "PropertyDetailPanel",
  components: {
    ChevronLeft,
    HeartOutline,
    MapPin,
    Building,
  },
  props: {
    property: { type: Object, required: true },
  },
  emits: ["close", "toggle-like"],
  computed: {
    allImages() {
      // DTO의 images가 있으면 그걸 우선
      const arr = Array.isArray(this.property?.images)
        ? this.property.images
        : [];

      // fallback(예전 구조)
      const main = this.property?.image ? [this.property.image] : [];
      const subs = Array.isArray(this.property?.subImages)
        ? this.property.subImages
        : [];

      const merged = arr.length ? arr : [...main, ...subs];

      // 중복 제거 + 빈값 제거
      return Array.from(new Set(merged)).filter(Boolean);
    },
    mainImage() {
      return this.allImages[0] || this.property?.image || "";
    },
    // 화면에 보이는 서브 썸네일은 최대 4장
    subThumbs() {
      return this.allImages.slice(1, 5); // 2~5번째(최대 4장)
    },
    remainingCount() {
      // 전체가 5장 초과면 (main 1 + thumbs 4) 이후 개수
      return Math.max(0, this.allImages.length - 5);
    },
  },
  data() {
    return {
      listings: [],
      listingsLoading: false,
      listingsError: "",
    };
  },
  watch: {
    "property.aptSeq": {
      immediate: true,
      handler() {
        this.fetchListings();
      },
    },
  },
  methods: {
    async fetchListings() {
      const aptSeq = this.property?.aptSeq;
      if (!aptSeq) return;

      this.listingsLoading = true;
      this.listingsError = "";
      this.listings = [];

      try {
        const { data } = await axios.get(`/property/${aptSeq}/listings`);
        this.listings = Array.isArray(data) ? data : [];
      } catch (e) {
        console.error(e);
        this.listingsError = "매물 정보를 불러오지 못했어요.";
      } finally {
        this.listingsLoading = false;
      }
    },

    // VARCHAR → number 처리
    toNumber(v) {
      if (v == null) return null;
      const s = String(v).trim();
      if (!s) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    },

    // ㎡ → 평
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
  margin: 0 0 10px 0;
}

.chart-placeholder,
.listings-placeholder,
.reviews-placeholder {
  padding: 20px;
  background: rgba(244, 236, 231, 0.3);
  border-radius: 10px;
  text-align: center;
}

.heart-icon {
  color: var(--tothezip-brown-07);
}

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
</style>
