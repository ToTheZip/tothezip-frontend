<template>
  <div
    class="detail-shell"
    @click.stop
    @mousedown.stop
    @pointerdown.stop
    @touchstart.stop
  >
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
              <img
                :src="mainImage"
                :alt="property.name"
                class="main-image"
                @click.stop="
                  console.log('main clicked');
                  openGallery(0);
                "
              />
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
                @click="openGallery(index + 1)"
              />

              <div
                v-if="index === 3 && remainingCount > 0"
                class="image-more-overlay"
                @click.stop="openGallery(index + 1)"
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
          <!-- 계약서 인증 버튼 추가 -->
          <div class="contract-verify-section">
            <button class="contract-verify-button" @click="openContractPanel">
              <FileText :size="16" />
              <span>계약서 인증</span>
            </button>
          </div>
        </div>

        <!-- 거래 기록 -->
        <div class="section-divider">
          <div class="section-title-row">
            <h3 class="section-title">거래 기록</h3>

            <!-- 옵션(선택): 평균/중앙값 토글 -->
            <button
              class="tiny-toggle"
              type="button"
              @click="priceMode = priceMode === 'median' ? 'avg' : 'median'"
            >
              {{ priceMode === "median" ? "중앙값" : "평균" }}
            </button>
          </div>

          <div v-if="priceLoading" class="chart-placeholder">
            <p>불러오는 중...</p>
          </div>
          <div v-else-if="priceError" class="chart-placeholder">
            <p>{{ priceError }}</p>
          </div>
          <div v-else-if="priceSeries.length === 0" class="chart-placeholder">
            <p>최근 5년 거래 데이터가 없어요.</p>
          </div>
          <PriceChart v-else :points="priceSeries" :mode="priceMode" />
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
              <ListingItem
                v-for="item in listings"
                :key="item.propertyId"
                :listing="item"
                @toggle-like="toggleListingLike"
              />
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
              @click.stop.prevent="
                $emit('open-reviews', {
                  aptSeq: property.aptSeq,
                  name: property.name,
                })
              "
              @mousedown.stop
              @pointerdown.stop
              @touchstart.stop
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
            <ReviewItem v-for="r in reviews" :key="r.reviewId" :review="r" />
          </div>
        </div>
      </div>
    </div>
    <!-- 계약서 인증 패널 -->
    <ContractVerificationPanel
      :is-open="contractPanelOpen"
      :property="property"
      @close="closeContractPanel"
      @submit="handleContractSubmit"
    />
  </div>

  <ImageGallery
    :is-open="galleryOpen"
    :images="allImages"
    :current-index="galleryIndex"
    :alt-text="property.name"
    @close="closeGallery"
    @prev="prevImage"
    @next="nextImage"
  />
</template>

<script>
import axios from "axios";
import ChevronLeft from "@/components/icons/ChevronLeft.vue";
import ChevronRight from "@/components/icons/ChevronRight.vue";
import MapPin from "@/components/icons/MapPin.vue";
import Building from "@/components/icons/Building.vue";
import { useAuthStore } from "@/stores/auth";
import ListingItem from "@/components/search/ListingItem.vue";
import ReviewItem from "@/components/search/ReviewItem.vue";
import ImageGallery from "@/components/search/ImageGallery.vue";
import PriceChart from "@/components/search/PriceChart.vue";
import FileText from "@/components/icons/FileText.vue";
import ContractVerificationPanel from "@/components/search/ContractVerificationPanel.vue";

const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "PropertyDetailPanel",
  components: {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Building,
    FileText,
    ListingItem,
    ReviewItem,
    ImageGallery,
    PriceChart,
    ContractVerificationPanel,
  },
  props: {
    property: { type: Object, required: true },
  },
  emits: ["close", "open-all-reviews", "open-reviews", "favorite-empty"],
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
      return this.allImages.slice(1, 5);
    },
    remainingCount() {
      return Math.max(0, this.allImages.length - 5);
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

      galleryOpen: false,
      galleryIndex: 0,

      priceSeries: [],
      priceLoading: false,
      priceError: "",
      priceMode: "avg", // or "avg"

      contractPanelOpen: false,
    };
  },
  watch: {
    "property.aptSeq": {
      immediate: true,
      handler() {
        this.fetchListings();
        this.fetchReviewsPreview();
        this.fetchPriceSeries();
      },
    },
  },

  methods: {
    /* =========================
        계약서 인증 패널
      ========================= */
    openContractPanel() {
      this.contractPanelOpen = true;
    },

    closeContractPanel() {
      this.contractPanelOpen = false;
    },

    async handleContractSubmit(formData) {
      const auth = useAuthStore();
      if (!auth.accessToken) {
        alert("로그인 후 이용해주세요");
        this.$router.push("/login");
        return;
      }

      try {
        const response = await axios.post(
          `${API_BASE}/contract/verify`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        alert("계약서 인증이 요청되었습니다. 검토 후 승인됩니다.");
        this.closeContractPanel();
      } catch (e) {
        console.error(e);
        alert("계약서 인증에 실패했습니다.");
      }
    },
    /* =========================
        매물 찜 토글
      ========================= */
    async toggleListingLike(item) {
      const auth = useAuthStore();
      if (!auth.accessToken) {
        alert("로그인 후 이용해주세요");
        this.$router.push("/login");
        return;
      }

      const hadLiked = !!item.isLiked;
      item.isLiked = !hadLiked;

      try {
        if (hadLiked) {
          // 찜 해제
          await axios.delete(`${API_BASE}/favorite`, {
            params: {
              type: "매물",
              referenceId: item.propertyId,
            },
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
            withCredentials: true,
          });
        } else {
          // 찜 추가
          await axios.post(
            `${API_BASE}/favorite`,
            {
              type: "매물",
              referenceId: item.propertyId,
            },
            {
              headers: {
                Authorization: `Bearer ${auth.accessToken}`,
              },
              withCredentials: true,
            }
          );
        }

        // 여기서 "이 건물에 찜된 매물이 남아있는지" 확인
        const stillLiked = this.listings.some((l) => l.isLiked);

        if (!stillLiked) {
          // 이 aptSeq는 이제 찜 매물 0개
          this.$emit("favorite-empty", this.property.aptSeq);
        }
      } catch (e) {
        console.error(e);
        item.isLiked = hadLiked; // 롤백
        alert("찜 처리에 실패했어요.");
      }
    },
    /* =========================
        매물 목록 + 찜 상태 로딩
      ========================= */
    async fetchListings() {
      const aptSeq = this.property?.aptSeq;
      if (!aptSeq) return;

      this.listingsLoading = true;
      this.listingsError = "";
      this.listings = [];

      try {
        const auth = useAuthStore();

        const [listRes, favRes] = await Promise.all([
          axios.get(`${API_BASE}/property/${aptSeq}/listings`),
          auth.accessToken
            ? axios.get(`${API_BASE}/favorite`, {
                params: { type: "매물" },
                headers: {
                  Authorization: `Bearer ${auth.accessToken}`,
                },
                withCredentials: true,
              })
            : Promise.resolve({ data: [] }),
        ]);

        const likedIds = new Set(favRes.data || []);

        this.listings = (listRes.data || []).map((x) => ({
          ...x,
          isLiked: likedIds.has(x.propertyId),
        }));
        console.log("favRes.data", favRes.data);
      } catch (e) {
        console.error(e);
        this.listingsError = "매물 정보를 불러오지 못했어요.";
      } finally {
        this.listingsLoading = false;
      }
    },

    // 리뷰 2개 프리뷰 가져오기
    async fetchReviewsPreview() {
      const aptSeq = this.property?.aptSeq;
      if (!aptSeq) return;

      this.reviewsLoading = true;
      this.reviewsError = "";
      this.reviews = [];
      this.reviewsTotalCount = 0;

      try {
        const { data } = await axios.get(`${API_BASE}/reviews/${aptSeq}`, {
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
    openGallery(startIndex = 0) {
      if (!this.allImages.length) return;
      this.galleryIndex = Math.min(
        Math.max(0, Number(startIndex) || 0),
        this.allImages.length - 1
      );
      this.galleryOpen = true;
    },

    closeGallery() {
      this.galleryOpen = false;
    },

    prevImage() {
      if (!this.allImages.length) return;
      this.galleryIndex =
        (this.galleryIndex - 1 + this.allImages.length) % this.allImages.length;
    },

    nextImage() {
      if (!this.allImages.length) return;
      this.galleryIndex = (this.galleryIndex + 1) % this.allImages.length;
    },
    async fetchPriceSeries() {
      const aptSeq = this.property?.aptSeq;
      if (!aptSeq) return;

      this.priceLoading = true;
      this.priceError = "";
      this.priceSeries = [];

      try {
        const { data } = await axios.get(
          `${API_BASE}/property/${aptSeq}/price-series`,
          {
            params: { period: "month" }, // or quarter
          }
        );
        this.priceSeries = data?.points || [];
      } catch (e) {
        console.error(e);
        this.priceError = "시세 정보를 불러오지 못했어요.";
      } finally {
        this.priceLoading = false;
      }
    },
  },
};
</script>

<style scoped>
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

/* 리뷰 섹션 */
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

.tiny-toggle {
  border: 1px solid var(--tothezip-brown-01);
  background: #fff;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10px;
  cursor: pointer;
}

.detail-shell {
  position: absolute;
  left: calc(var(--sidebar-w) + var(--panel-gap));
  top: 7px;
  width: 270px;
  height: calc(100% - 14px);
  z-index: 200;
  overflow: visible;
}

.property-detail-panel {
  position: relative;
  width: 270px;
  height: 100%;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 2px 4px 4px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
</style>
