<template>
  <div class="listing-item">
    <div class="listing-top">
      <span class="listing-type">{{ listing.type }}</span>
      <div class="listing-right">
        <span class="listing-price">{{ formattedPrice }}</span>
        <button
          class="listing-like-button favorite-btn"
          :class="{ liked: listing.isLiked }"
          type="button"
          @click.stop="$emit('toggle-like', listing)"
          aria-label="찜"
        >
          <HeartFill v-if="listing.isLiked" class="icon" />
          <HeartOutline v-else class="icon" />
        </button>
      </div>
    </div>

    <div class="listing-bottom">
      <span class="meta">{{ pyeong }}평</span>
      <span class="dot">·</span>
      <span class="meta">{{ listing.floor }}층</span>
    </div>
  </div>
</template>

<script>
import HeartOutline from "@/components/icons/HeartOutline.vue";
import HeartFill from "@/components/icons/HeartFill.vue";

export default {
  name: "ListingItem",
  components: {
    HeartOutline,
    HeartFill,
  },
  props: {
    listing: {
      type: Object,
      required: true,
    },
  },
  emits: ["toggle-like"],
  computed: {
    pyeong() {
      const n = Number(this.listing.area);
      if (!Number.isFinite(n)) return "-";
      return (n / 3.305785).toFixed(1);
    },
    formattedPrice() {
      if (this.listing.type === "월세") {
        const dep = this.listing.deposit
          ? this.formatMoney(this.listing.deposit)
          : "0만원";
        const rent = this.formatMoney(this.listing.price);
        return `월세 ${dep} / ${rent}`;
      }
      return `${this.listing.type} ${this.formatMoney(this.listing.price)}`;
    },
  },
  methods: {
    toNumber(v) {
      if (v == null) return null;
      const s = String(v).trim();
      if (!s) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
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
  },
};
</script>

<style scoped>
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

.listing-like-button.favorite-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--tothezip-beige-04);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.listing-like-button .icon {
  width: 14px;
  height: 14px;
  color: var(--tothezip-brown-05);
}

.listing-like-button:hover {
  background: var(--tothezip-orange-01);
  border-color: var(--tothezip-orange-03);
}

.listing-like-button:hover .icon {
  transform: scale(1.15);
}

.listing-like-button.liked {
  background: var(--tothezip-orange-04);
  border-color: var(--tothezip-orange-04);
}

.listing-like-button.liked .icon {
  color: #ffffff;
}
</style>
