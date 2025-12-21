<template>
  <div class="property-card">
    <div class="property-image-wrapper">
      <!-- 이미지 기준 박스 -->
      <div class="property-image-box">
        <img
          :src="imgSrc"
          :alt="property.name"
          class="property-image"
          loading="lazy"
          @error="onImgError"
        />
        <!-- 실제 이미지 -->
        <!-- <img
          v-if="property.image"
          :src="property.image"
          :alt="property.name"
          class="property-image"
          loading="lazy"
          @error="onImgError"
        />

        이미지 없을 때 placeholder
        <div v-else class="image-placeholder">
          <span class="placeholder-text">이미지 준비중</span>
        </div> -->

        <!-- ⭐ 별점 (이미지 박스 기준) -->
        <div class="rating-badge">
          <StarIcon class="star-icon" />
          <span class="rating-value">{{ Number(property.rating).toFixed(1) }}</span>
        </div>

        <!-- ✅ Hover 오버레이 + 찜 버튼 -->
        <div class="hover-overlay">
          <button
            class="like-button"
            :class="{ bounce: isBouncing }"
            @click.stop="toggleLike"
            aria-label="찜하기"
          >
            <HeartOutline v-if="!liked" class="heart-icon outline" />
            <HeartFill v-else class="heart-icon fill" />
          </button>
        </div>
      </div>
    </div>

    <!-- 매물 정보 -->
    <div class="property-info">
      <div class="info-top">
        <div class="property-name">{{ property.name }}</div>
      </div>

      <div class="info-bottom">
        <div class="location-info">
          <svg
            class="map-icon"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
          >
            <path
              d="M7.5 2C5.567 2 4 3.567 4 5.5C4 8.5 7.5 12.5 7.5 12.5C7.5 12.5 11 8.5 11 5.5C11 3.567 9.433 2 7.5 2Z"
              stroke="#A3978F"
              stroke-width="1"
              fill="none"
            />
            <circle cx="7.5" cy="5.5" r="1" fill="#A3978F" />
          </svg>
          <span class="location-text">{{ property.address }}</span>
        </div>

        <div class="tags-info">
          <span v-for="tag in property.tags" :key="tag" class="tag">
            <span class="tag-hash"># </span>
            <span class="tag-text">{{ tag }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeartOutline from "@/components/icons/HeartOutline.vue";
import HeartFill from "@/components/icons/HeartFill.vue";
import StarIcon from "@/components/icons/Star.vue";

export default {
  name: "PropertyCard",
  components: { HeartOutline, HeartFill, StarIcon },
  props: {
    property: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // ✅ 임시 상태(나중에 서버/스토어로 연결하면 됨)
      liked: false,
      isBouncing: false,
      fallbackImg: new URL("@/assets/images/dozip_logo.png", import.meta.url).href,
      imgSrc: ""
    };
  },
  mounted() {
    // ✅ 백엔드가 imageUrl로 줄 가능성이 높으니 둘 다 대응
    this.imgSrc = this.property.imageUrl || this.property.image || this.fallbackImg;
  },

  watch: {
    // 카드 재사용되면 property가 바뀔 수 있으니 갱신
    property: {
      deep: true,
      handler(newVal) {
        this.imgSrc = newVal.imageUrl || newVal.image || this.fallbackImg;
      },
    },
  },
  methods: {
    onImgError(e) {
      // 이미지 로딩 실패 시 img 숨기고 placeholder 유지
      e.target.style.display = "none";
    },
    toggleLike() {
      this.liked = !this.liked;

      this.isBouncing = false; // 연타 시에도 재시작되게
      this.$nextTick(() => {
        this.isBouncing = true;
        setTimeout(() => {
          this.isBouncing = false;
        }, 260); // 애니메이션 시간과 맞추기
      });

      // 필요하면 부모로 이벤트 올리기
      // this.$emit("toggle-like", { id: this.property.id, liked: this.liked });
    },
  },
};
</script>

<style scoped>
/* 카드 전체 */
.property-card {
  width: 214px;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.property-card:hover {
  transform: translateY(-5px);
}

/* 이미지 래퍼 */
.property-image-wrapper {
  padding: 5px;
  width: 100%;

  display: flex;
  justify-content: center;
}

/* ✅ 이미지 기준 박스 (190x190 고정) */
.property-image-box {
  position: relative; /* ⭐ 별점, 오버레이 기준 */
  width: 190px;
  height: 190px;
  border-radius: 20px;
  border: 1px solid var(--tothezip-brown-01);
  overflow: hidden;
  background: #f6f6f6;
}

/* 실제 이미지 */
.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 이미지 없을 때 placeholder */
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  background-image: linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.04) 25%,
      transparent 25%
    ),
    linear-gradient(-45deg, rgba(0, 0, 0, 0.04) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.04) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.04) 75%);
  background-size: 22px 22px;
  background-position: 0 0, 0 11px, 11px -11px, -11px 0px;
}

.placeholder-text {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: var(--tothezip-gray-04);
}

/* ⭐ 별점 뱃지 */
.rating-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 30px;
  padding: 3px 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  z-index: 3;
}

.star-icon {
  width: 13px;
  height: 13px;
}

.rating-value {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: var(--tothezip-ruby-06);
  line-height: normal;
}

/* ✅ Hover 오버레이 (브라운 톤) */
.hover-overlay {
  position: absolute;
  inset: 0;

  /* 🔥 브라운 기운 도는 어두운 오버레이 */
  background: linear-gradient(rgba(105, 56, 19, 0.25), rgba(105, 56, 19, 0.45));
  backdrop-filter: saturate(0.9);

  display: flex;
  align-items: center;
  justify-content: center;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease;
  z-index: 2;
}

/* hover 시 오버레이 노출 */
.property-image-box:hover .hover-overlay {
  opacity: 1;
  pointer-events: auto;
}

/* 찜 버튼 */
.like-button {
  width: 50px;
  height: 50px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  transform: scale(0.98);
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.property-image-box:hover .like-button {
  transform: scale(1);
}

.like-button:active {
  transform: scale(0.94);
}

.heart-icon {
  width: 70px;
  height: 70px;
}

/* 정보 영역 */
.property-info {
  height: 66px;
  position: relative;
}

.info-top {
  display: flex;
  align-items: center;
  height: 30px;
  padding: 1px 18px;
}

.property-name {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 18px;
  color: black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-bottom {
  height: 36px;
  position: relative;
}

.location-info {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  height: 18px;
  padding: 0 16px;
  max-width: 214px;
}

.map-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.location-text {
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: var(--tothezip-gray-04);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags-info {
  position: absolute;
  top: 18px;
  left: 0;
  display: flex;
  gap: 6px;
  padding: 0 20px;
}

.tag {
  display: flex;
  align-items: center;
  width: 45px;
}

.tag-hash {
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: var(--tothezip-gray-04);
}

.tag-text {
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: var(--tothezip-gray-04);
}

.star-icon {
  width: 13px;
  height: 13px;
  color: var(--tothezip-ruby-06);
}

/* ✅ 클릭 시 통통 */
.like-button.bounce .heart-icon {
  animation: heart-bounce 260ms ease-out;
  transform-origin: center;
}

@keyframes heart-bounce {
  0% {
    transform: scale(1);
  }
  35% {
    transform: scale(1.18);
  }
  65% {
    transform: scale(0.92);
  }
  100% {
    transform: scale(1);
  }
}
</style>
