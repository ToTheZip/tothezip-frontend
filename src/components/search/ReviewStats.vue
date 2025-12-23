<template>
  <div class="review-stats">
    <div class="stats-left">
      <div class="avg-score">{{ avgRating.toFixed(1) }}</div>
      <div class="avg-stars">
        <span
          v-for="i in 5"
          :key="i"
          class="star"
          :class="{ filled: i <= Math.round(avgRating) }"
        >
          ★
        </span>
      </div>
      <div class="stats-total">({{ totalCount }}개)</div>
    </div>

    <div class="stats-right">
      <div v-for="s in [5, 4, 3, 2, 1]" :key="s" class="stat-row">
        <span class="stat-label">{{ s }}점</span>
        <div class="stat-bar">
          <div
            class="stat-bar-fill"
            :style="{ width: ratingPercent(s) + '%' }"
          />
        </div>
        <span class="stat-count">{{ ratingCount(s) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ReviewStats",
  props: {
    avgRating: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    counts: {
      type: Object,
      default: () => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
    },
  },
  methods: {
    ratingCount(score) {
      return Number(this.counts?.[score] || 0);
    },
    ratingPercent(score) {
      const total = Number(this.totalCount || 0);
      if (!total) return 0;
      return Math.round((this.ratingCount(score) / total) * 100);
    },
  },
};
</script>

<style scoped>
.review-stats {
  margin-top: 10px;
  padding: 10px 10px;
  border: 1px solid rgba(240, 138, 60, 0.18);
  background: rgba(255, 237, 219, 0.55);
  border-radius: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.stats-left {
  width: 78px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.avg-score {
  font-size: 22px;
  font-weight: 800;
  color: #f08a3c;
  letter-spacing: -0.5px;
  line-height: 1;
}

.avg-stars {
  display: inline-flex;
  gap: 1px;
  line-height: 1;
}

.avg-stars .star {
  font-size: 14px;
  opacity: 0.25;
}

.avg-stars .star.filled {
  opacity: 1;
  color: var(--tothezip-ruby-06);
}

.stats-total {
  font-size: 10px;
  color: var(--tothezip-gray-04);
}

.stats-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: grid;
  grid-template-columns: 28px 1fr 26px;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 10px;
  color: var(--tothezip-gray-05);
  white-space: nowrap;
}

.stat-count {
  font-size: 10px;
  color: var(--tothezip-gray-05);
  text-align: right;
  white-space: nowrap;
}

.stat-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 999px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: rgba(240, 138, 60, 0.85);
}
</style>
