<template>
  <div class="property-grid-card" @click="$emit('click')">
    <div class="card-image-area">
      <div class="card-image-box">
        <img
          :src="property.image"
          :alt="property.name"
          class="card-image"
          @error="onImageError"
        />
        <div class="image-overlay"></div>
      </div>

      <div class="rating-badge">
        <Star class="star-icon" />
        <span class="rating-text">{{ property.rating }}</span>
      </div>
    </div>

    <div class="card-content">
      <div class="price-section">
        <p class="price-text">{{ priceLabel }}</p>
      </div>

      <div class="name-section">
        <h3 class="property-name">{{ property.name }}</h3>
      </div>

      <div class="location-section">
        <MapPin class="location-icon" />
        <span class="location-text">{{ property.address }}</span>
      </div>

      <div class="tags-section">
        <span v-for="tag in property.tags" :key="tag" class="property-tag">
          #{{ tag }}
        </span>
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

      if (!t || p == null) return "";

      const formatMoney = (num) => {
        const n = Number(num);
        if (!Number.isFinite(n)) return String(num);

        if (n >= 10000) {
          const eok = Math.floor(n / 10000);
          const rest = n % 10000;
          if (rest === 0) return `${eok}억`;
          return `${eok}억 ${rest}만원`;
        }
        return `${n}만원`;
      };

      if (t === "월세") {
        const dep = d != null ? formatMoney(d) : "0만원";
        const rent = formatMoney(p);
        return `월세 ${dep} / ${rent}`;
      }

      return `${t} ${formatMoney(p)}`;
    },
  },
  methods: {
    goToMap() {
      this.$emit("go-map", this.property.id);
    },
    onImageError(e) {
      e.target.onerror = null;
      e.target.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f4ece7"/%3E%3C/svg%3E';
    },
  },
};
</script>

<style scoped>
.property-grid-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  background: #ffffff;
  border: 1.5px solid var(--tothezip-brown-02);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(75, 29, 28, 0.06);
}

.property-grid-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(75, 29, 28, 0.12);
  border-color: var(--tothezip-orange-04);
}

.property-grid-card:hover .card-image {
  transform: scale(1.1);
}

.property-grid-card:hover .image-overlay {
  opacity: 0.2;
}

.property-grid-card:hover .property-name {
  color: var(--tothezip-orange-05);
}

.card-image-area {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--tothezip-beige-01);
}

.card-image-box {
  width: 100%;
  height: 100%;
  position: relative;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--tothezip-orange-04) 0%,
    var(--tothezip-orange-05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.rating-badge {
  position: absolute;
  left: 10px;
  top: 10px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid var(--tothezip-brown-02);
  border-radius: 20px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 8px rgba(75, 29, 28, 0.15);
  transition: all 0.2s ease;
  z-index: 10;
}

.property-grid-card:hover .rating-badge {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

.star-icon {
  color: var(--tothezip-ruby-06);
  width: 13px;
  height: 13px;
}

.rating-text {
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: var(--tothezip-ruby-06);
  line-height: 1;
}

.card-content {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #ffffff;
}

.price-section {
  margin: 0;
}

.price-text {
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--tothezip-orange-06);
  margin: 0;
  letter-spacing: -0.02em;
}

.name-section {
  margin: 0;
}

.property-name {
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--tothezip-brown-09);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
  letter-spacing: -0.01em;
}

.location-section {
  display: flex;
  align-items: center;
  gap: 5px;
}

.location-icon {
  width: 13px;
  height: 13px;
  color: var(--tothezip-brown-05);
  flex-shrink: 0;
}

.location-text {
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: var(--tothezip-brown-05);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags-section {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.property-tag {
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: var(--tothezip-brown-04);
  background: rgba(244, 236, 231, 0.6);
  border: 1px solid var(--tothezip-brown-02);
  border-radius: 10px;
  padding: 3px 7px;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
}

.property-grid-card:hover .property-tag {
  background: var(--tothezip-orange-01);
  border-color: var(--tothezip-orange-03);
  color: var(--tothezip-orange-06);
}

/* 부모 컨테이너에 이 스타일을 적용하세요 */
.properties-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
}

/* 반응형 */
@media (max-width: 1200px) {
  .properties-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .properties-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .properties-grid {
    grid-template-columns: 1fr;
  }
}
</style>
