<template>
  <div class="property-result-card" @click="$emit('click')">
    <div class="property-image-area">
      <div class="property-image-box">
        <img
          :src="property.image"
          :alt="property.name"
          class="property-image"
          @error="onImageError"
        />
      </div>

      <div class="rating-badge">
        <Star class="star-icon" />
        <span class="rating-text">{{ property.rating }}</span>
      </div>
    </div>

    <div class="property-info-area">
      <div class="price-info">
        <p class="price-text">{{ priceLabel }}</p>
      </div>

      <div class="property-name-row">
        <p class="property-name">{{ property.name }}</p>
      </div>

      <div class="property-details">
        <div class="location-row">
          <MapPin />
          <span class="location-text">{{ property.address }}</span>
        </div>

        <div class="tags-row">
          <span v-for="tag in property.tags" :key="tag" class="property-tag">
            <span class="tag-hash">#</span>
            <span class="tag-text">{{ tag }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Star from "@/components/icons/Star.vue";
import MapPin from "@/components/icons/MapPin.vue";

export default {
  name: "PropertyCard",
  components: { Star, MapPin },
  props: {
    property: { type: Object, required: true },
  },
  emits: ["click"],
  computed: {
    priceLabel() {
      const t = this.property?.minDealType || "";
      const p = this.property?.minPrice;
      const d = this.property?.minDeposit;

      // 값이 없으면 빈 문자열
      if (!t || p == null) return "";

      // 숫자 포맷 (DB 단위가 만원이라고 가정)
      const formatMoney = (num) => {
        const n = Number(num);
        if (!Number.isFinite(n)) return String(num);

        // 1억 = 10000(만원)
        if (n >= 10000) {
          const eok = Math.floor(n / 10000);
          const rest = n % 10000;
          if (rest === 0) return `${eok}억`;
          // 천 단위(만원) 표현: 5500 -> 5,500만원 느낌 대신 "5천" 등은 취향이라 간단히 만원으로
          return `${eok}억 ${rest}만원`;
        }
        return `${n}만원`;
      };

      if (t === "월세") {
        const dep = d != null ? formatMoney(d) : "0만원";
        const rent = formatMoney(p);
        return `월세 ${dep} / ${rent}`;
      }

      // 전세/매매
      return `${t} ${formatMoney(p)}`;
    },
  },
  methods: {
    onImageError(e) {
      e.target.onerror = null;
      e.target.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f4ece7"/%3E%3C/svg%3E';
    },
  },
};
</script>

<style scoped>
.property-result-card {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  cursor: pointer;
  transition: background 0.2s;
}
.property-result-card:hover {
  background: rgba(244, 236, 231, 0.3);
}
.property-image-area {
  padding: 5px 10px;
  position: relative;
}
.property-image-box {
  width: 100px;
  height: 100px;
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}
.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.star-icon {
  color: var(--tothezip-ruby-06);
}
.rating-badge {
  position: absolute;
  left: 17px;
  top: 12px;
  background: #ffffff;
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 30px;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  gap: 2px;
}
.rating-text {
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: var(--tothezip-ruby-06);
  line-height: 1;
}
.property-info-area {
  flex: 1;
  padding: 5px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.price-info {
  padding: 0 5px;
}
.price-text {
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--tothezip-brown-06);
  margin: 0;
}
.property-name-row {
  padding: 0 5px;
}
.property-name {
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #000000;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.property-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.location-row {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0 5px;
}
.location-text {
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 400;
  color: var(--tothezip-gray-04);
}
.tags-row {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 3px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.property-tag {
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 400;
  color: var(--tothezip-gray-04);
  display: inline-flex;
  padding: 0;
  width: 45px;
}
.tag-hash {
  font-size: 11px;
}
.tag-text {
  font-size: 10px;
}
</style>
