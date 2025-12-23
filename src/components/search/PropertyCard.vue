<template>
  <div
    class="property-grid-card"
    :class="{ selected }"
    :data-aptseq="String(property.aptSeq)"
    @click="$emit('click')"
  >
    <div class="card-image-area">
      <img
        :src="property.image"
        :alt="property.name"
        class="card-image"
        @error="onImageError"
      />
      <div class="image-gradient"></div>

      <div class="rating-badge">
        <Star class="star-icon" />
        <span class="rating-text">{{ property.rating }}</span>
      </div>

      <div class="price-overlay">
        <span class="price-text">{{ priceLabel }}</span>
      </div>
    </div>

    <div class="card-content">
      <h3 class="property-name">{{ property.name }}</h3>

      <div class="location-row">
        <MapPin class="location-icon" />
        <span class="location-text">{{ property.address }}</span>
      </div>

      <div class="tags-row">
        <span
          v-for="tag in property.tags.slice(0, 3)"
          :key="tag"
          class="property-tag"
        >
          {{ tag }}
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
    selected: { type: Boolean, default: false },
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
          return `${eok}억 ${rest}만`;
        }
        return `${n}만`;
      };

      if (t === "월세") {
        const dep = d != null ? formatMoney(d) : "0";
        const rent = formatMoney(p);
        return `${dep} / ${rent}`;
      }

      return `${formatMoney(p)}`;
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
.property-grid-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 20px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(75, 29, 28, 0.08),
    0 0 0 1px rgba(75, 29, 28, 0.04);
  position: relative;
}

.property-grid-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(
    135deg,
    var(--tothezip-orange-04),
    var(--tothezip-orange-05),
    var(--tothezip-ruby-05)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.property-grid-card:hover::before {
  opacity: 1;
}

.property-grid-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 32px rgba(227, 93, 55, 0.2),
    0 0 0 1px rgba(227, 93, 55, 0.1);
}

.property-grid-card:hover .card-image {
  transform: scale(1.15);
}

.property-grid-card:hover .image-gradient {
  opacity: 0.7;
}

.property-grid-card:hover .property-name {
  color: var(--tothezip-orange-06);
}

.property-grid-card:hover .price-overlay {
  background: linear-gradient(
    135deg,
    var(--tothezip-orange-05),
    var(--tothezip-orange-06)
  );
}

.card-image-area {
  position: relative;
  width: 100%;
  height: 200px;
  padding: 12px;
  background: linear-gradient(
    135deg,
    var(--tothezip-beige-02),
    var(--tothezip-beige-03)
  );
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.image-gradient {
  position: absolute;
  inset: 12px;
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 40%,
    rgba(0, 0, 0, 0.3) 100%
  );
  opacity: 0.5;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.rating-badge {
  position: absolute;
  right: 20px;
  top: 20px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98),
    rgba(255, 255, 255, 0.95)
  );
  backdrop-filter: blur(12px);
  border: none;
  border-radius: 24px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(178, 34, 34, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 10;
}

.property-grid-card:hover .rating-badge {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 6px 16px rgba(178, 34, 34, 0.3), 0 3px 6px rgba(0, 0, 0, 0.15);
}

.star-icon {
  color: var(--tothezip-ruby-06);
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 1px 2px rgba(178, 34, 34, 0.3));
}

.rating-text {
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: var(--tothezip-ruby-06);
  line-height: 1;
  letter-spacing: -0.02em;
}

.price-overlay {
  position: absolute;
  left: 20px;
  bottom: 20px;
  background: linear-gradient(
    135deg,
    var(--tothezip-orange-06),
    var(--tothezip-orange-05)
  );
  backdrop-filter: blur(8px);
  padding: 8px 14px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(227, 93, 55, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: all 0.3s ease;
}

.price-text {
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.03em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #ffffff;
}

.property-name {
  font-family: "Pretendard", sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: var(--tothezip-brown-10);
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
  letter-spacing: -0.02em;
  min-height: 44px;
}

.location-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  border-top: 1px solid var(--tothezip-beige-02);
}

.location-icon {
  width: 14px;
  height: 14px;
  color: var(--tothezip-orange-05);
  flex-shrink: 0;
}

.location-text {
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--tothezip-brown-06);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.property-tag {
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: var(--tothezip-brown-07);
  background: linear-gradient(
    135deg,
    var(--tothezip-beige-01),
    var(--tothezip-beige-02)
  );
  border: 1px solid var(--tothezip-brown-02);
  border-radius: 8px;
  padding: 4px 10px;
  display: inline-flex;
  align-items: center;
  transition: all 0.25s ease;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.property-grid-card:hover .property-tag {
  background: linear-gradient(
    135deg,
    var(--tothezip-orange-02),
    var(--tothezip-orange-01)
  );
  border-color: var(--tothezip-orange-04);
  color: var(--tothezip-orange-07);
  transform: translateY(-1px);
}

.property-grid-card.selected {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(227, 93, 55, 0.22),
    0 0 0 2px rgba(227, 93, 55, 0.35);
}

.property-grid-card.selected::before {
  opacity: 1; /* 선택되면 그라데이션 보더 고정 */
}

.property-grid-card.selected .property-name {
  color: var(--tothezip-orange-06);
}
</style>
