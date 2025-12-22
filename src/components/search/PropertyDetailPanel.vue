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
            <img
              :src="property.image"
              :alt="property.name"
              class="main-image"
            />
          </div>
        </div>

        <div class="sub-images-wrapper">
          <div
            v-for="(img, index) in property.subImages || []"
            :key="index"
            class="sub-image-box"
          >
            <img
              :src="img"
              :alt="`${property.name} ${index + 1}`"
              class="sub-image"
            />
            <div
              v-if="index === 3 && property.totalImages > 4"
              class="image-more-overlay"
            >
              <span class="more-text">+ {{ property.totalImages - 4 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="building-info-section">
        <div class="tags-row-detail">
          <span v-for="tag in property.tags" :key="tag" class="detail-tag"
            >#{{ tag }}</span
          >
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
        <div class="listings-placeholder">
          <p>매물 리스트 영역</p>
          <ul>
            <li>type(전세, 월세..)</li>
            <li>가격</li>
            <li>보증금</li>
            <li>평수</li>
            <li>층수</li>
            <li>등록일자</li>
          </ul>
        </div>
      </div>

      <div class="section-divider">
        <h3 class="section-title">리뷰</h3>
        <div class="reviews-placeholder">
          <p>리뷰 영역</p>
          <ul>
            <li>사용자 프로필</li>
            <li>리뷰 내용</li>
            <li>별점</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChevronLeft from "@/components/icons/ChevronLeft.vue";
import HeartFill from "@/components/icons/HeartFill.vue";
import HeartOutline from "@/components/icons/HeartOutline.vue";
import MapPin from "@/components/icons/MapPin.vue";
import Building from "@/components/icons/Building.vue";

export default {
  name: "PropertyDetailPanel",
  components: {
    ChevronLeft,
    HeartFill,
    HeartOutline,
    MapPin,
    Building,
  },
  props: {
    property: {
      type: Object,
      required: true,
    },
  },
  emits: ["close", "toggle-like"],
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

.chart-placeholder p,
.listings-placeholder p,
.reviews-placeholder p {
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--tothezip-gray-04);
  margin: 0 0 10px 0;
}

.listings-placeholder ul,
.reviews-placeholder ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.listings-placeholder li,
.reviews-placeholder li {
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  color: var(--tothezip-gray-04);
  padding: 3px 0;
}

.heart-icon {
  color: var(--tothezip-brown-07);
}
</style>
