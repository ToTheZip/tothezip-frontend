<template>
  <div class="listing-compare-panel" @click.stop @mousedown.stop>
    <div class="content">
      <div class="top-bar">
        <button class="back-button" @click="$emit('back')">
          <ChevronLeft />
        </button>
        <div class="title">비교 매물 추천</div>
        <div class="spacer" />
      </div>

      <!-- 선택 매물 요약 -->
      <div class="base-card">
        <div class="base-header">
          <div class="badge">{{ listing?.type }}</div>
          <div class="meta">
            <span>{{ toPyeong(listing?.area) }}평</span>
            <span class="dot">·</span>
            <span>{{ listing?.floor }}층</span>
          </div>
        </div>
        <div class="price">{{ formatListingPrice(listing) }}</div>
        <div class="name">{{ baseProperty?.name }}</div>
      </div>

      <div v-if="loading" class="placeholder">불러오는 중...</div>
      <div v-else-if="error" class="placeholder">{{ error }}</div>

      <template v-else>
        <div v-if="!compareResult?.candidates?.length" class="placeholder">
          비교할 매물이 없어요.
        </div>

        <template v-else>
          <!-- 최적 매물 (두더지 추천) -->
          <div v-if="topCandidate" class="top-recommendation">
            <div class="mole-section">
              <img
                src="@/assets/images/compare_dozip.png"
                alt="두집"
                class="mole-character"
              />
              <div class="mole-bubble">
                <div class="bubble-text">이 매물을 추천해요!</div>
              </div>
            </div>

            <div class="top-card" @click="handlePropertyClick(topCandidate)">
              <div class="card-top">
                <span class="type">{{ topCandidate.type }}</span>
                <span class="score">
                  {{ Math.round(topCandidate.aiScore ?? 0) }}점
                </span>
              </div>

              <div class="price">{{ formatListingPrice(topCandidate) }}</div>

              <!-- 비교 정보 -->
              <div class="comparison-grid">
                <div class="comparison-item">
                  <div class="comparison-label">가격 차이</div>
                  <div
                    class="comparison-value"
                    :class="getPriceComparisonClass()"
                  >
                    {{ formatPriceComparison() }}
                  </div>
                </div>
                <div class="comparison-item">
                  <div class="comparison-label">평수</div>
                  <div
                    class="comparison-value"
                    :class="getAreaComparisonClass()"
                  >
                    {{ formatAreaComparison() }}
                  </div>
                </div>
                <div class="comparison-item">
                  <div class="comparison-label">층수</div>
                  <div
                    class="comparison-value"
                    :class="getFloorComparisonClass()"
                  >
                    {{ formatFloorComparison() }}
                  </div>
                </div>
                <div class="comparison-item">
                  <div class="comparison-label">거리</div>
                  <div class="comparison-value neutral">
                    {{ formatMeter(topCandidate.distM) }}
                  </div>
                </div>
              </div>

              <div v-if="topCandidate.aiSummary" class="ai-summary">
                {{ topCandidate.aiSummary }}
              </div>

              <ul
                v-if="
                  Array.isArray(topCandidate.aiReasons) &&
                  topCandidate.aiReasons.length
                "
                class="ai-reasons"
              >
                <li
                  v-for="(r, idx) in topCandidate.aiReasons.slice(0, 4)"
                  :key="idx"
                >
                  {{ r }}
                </li>
              </ul>

              <div class="meta">
                <span>{{ toPyeong(topCandidate.area) }}평</span>
                <span class="dot">·</span>
                <span>{{ topCandidate.floor }}층</span>
                <span class="dot">·</span>
                <span>{{ formatMeter(topCandidate.distM) }}</span>
              </div>

              <div class="apt">{{ topCandidate.aptName }}</div>
            </div>
          </div>

          <!-- 나머지 매물들 -->
          <div v-if="otherCandidates.length" class="other-section">
            <div class="section-title">다른 추천 매물</div>
            <div class="list">
              <div
                v-for="c in otherCandidates"
                :key="c.propertyId"
                class="simple-card"
                @click="handlePropertyClick(c)"
              >
                <div class="card-header">
                  <span class="type">{{ c.type }}</span>
                  <span class="score">{{ Math.round(c.aiScore ?? 0) }}점</span>
                </div>
                <div class="price">{{ formatListingPrice(c) }}</div>
                <div v-if="c.aiSummary" class="summary">{{ c.aiSummary }}</div>
                <div class="info">
                  <span>{{ toPyeong(c.area) }}평 · {{ c.floor }}층</span>
                  <span class="apt-name">{{ c.aptName }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import ChevronLeft from "@/components/icons/ChevronLeft.vue";

export default {
  name: "ListingComparePanel",
  components: { ChevronLeft },
  props: {
    baseProperty: Object, // 건물(아파트) 정보
    listing: Object, // 기준 매물
    compareResult: Object, // { base, candidates, usedRadiusM, ... }
    loading: Boolean,
    error: String,
  },
  computed: {
    topCandidate() {
      const candidates = this.compareResult?.candidates || [];
      if (!candidates.length) return null;

      // aiScore가 가장 높은 매물 찾기
      return candidates.reduce((best, current) => {
        const bestScore = best?.aiScore ?? 0;
        const currentScore = current?.aiScore ?? 0;
        return currentScore > bestScore ? current : best;
      }, candidates[0]);
    },
    otherCandidates() {
      const candidates = this.compareResult?.candidates || [];
      if (!candidates.length || !this.topCandidate) return [];

      // topCandidate를 제외한 나머지 매물들
      return candidates.filter(
        (c) => c.propertyId !== this.topCandidate.propertyId
      );
    },
  },
  methods: {
    handlePropertyClick(candidate) {
      // 해당 매물의 건물 정보와 함께 상세 패널로 전환 이벤트 발생
      console.log("Clicked candidate:", candidate);

      // aptSeq가 있으면 사용, 없으면 propertyId 사용
      const buildingId = candidate.aptSeq || candidate.propertyId;

      this.$emit("select-property", {
        aptSeq: buildingId,
        propertyId: buildingId, // 호환성을 위해 둘 다 전달
        aptName: candidate.aptName,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
      });
    },

    // 비교 관련 메서드
    getPriceComparisonClass() {
      const basePriceValue = this.getPriceValue(this.listing);
      const topPriceValue = this.getPriceValue(this.topCandidate);

      if (basePriceValue === null || topPriceValue === null) return "neutral";

      const diff = topPriceValue - basePriceValue;
      if (Math.abs(diff) < 100) return "neutral"; // 100만원 미만 차이는 비슷한 것으로 처리
      return diff < 0 ? "positive" : "negative";
    },
    getAreaComparisonClass() {
      const baseArea = Number(this.listing?.area);
      const topArea = Number(this.topCandidate?.area);

      if (!Number.isFinite(baseArea) || !Number.isFinite(topArea))
        return "neutral";

      const diff = topArea - baseArea;
      if (Math.abs(diff) < 3) return "neutral"; // 3㎡ 미만 차이
      return diff > 0 ? "positive" : "negative";
    },
    getFloorComparisonClass() {
      const baseFloor = Number(this.listing?.floor);
      const topFloor = Number(this.topCandidate?.floor);

      if (!Number.isFinite(baseFloor) || !Number.isFinite(topFloor))
        return "neutral";

      const diff = topFloor - baseFloor;
      if (diff === 0) return "neutral";
      return diff > 0 ? "positive" : "negative";
    },
    getPriceValue(item) {
      if (!item) return null;
      const price = Number(item.price);
      const deposit = Number(item.deposit) || 0;

      if (!Number.isFinite(price)) return null;

      // 월세의 경우 보증금 + (월세 * 100)으로 환산하여 비교
      if (item.type === "월세") {
        return deposit + price * 100;
      }
      return price;
    },
    formatPriceComparison() {
      const basePriceValue = this.getPriceValue(this.listing);
      const topPriceValue = this.getPriceValue(this.topCandidate);

      if (basePriceValue === null || topPriceValue === null) return "-";

      const diff = topPriceValue - basePriceValue;
      if (Math.abs(diff) < 100) return "비슷함";

      const absDiff = Math.abs(diff);
      const formatted = this.formatMoneyManwon(absDiff);
      return diff > 0 ? `+${formatted}` : `-${formatted}`;
    },
    formatAreaComparison() {
      const baseArea = Number(this.listing?.area);
      const topArea = Number(this.topCandidate?.area);

      if (!Number.isFinite(baseArea) || !Number.isFinite(topArea)) return "-";

      const basePyeong = baseArea / 3.305785;
      const topPyeong = topArea / 3.305785;
      const diff = topPyeong - basePyeong;

      if (Math.abs(diff) < 3) return "비슷함";

      const sign = diff > 0 ? "+" : "";
      return `${sign}${diff.toFixed(1)}평`;
    },
    formatFloorComparison() {
      const baseFloor = Number(this.listing?.floor);
      const topFloor = Number(this.topCandidate?.floor);

      if (!Number.isFinite(baseFloor) || !Number.isFinite(topFloor)) return "-";

      const diff = topFloor - baseFloor;
      if (diff === 0) return "동일";

      const sign = diff > 0 ? "+" : "";
      return `${sign}${diff}층`;
    },

    toPyeong(areaM2) {
      const n = Number(areaM2);
      if (!Number.isFinite(n)) return "-";
      return (n / 3.305785).toFixed(1);
    },
    formatMeter(m) {
      const n = Number(m);
      if (!Number.isFinite(n)) return "-";
      if (n < 1000) return `${Math.round(n)}m`;
      return `${(n / 1000).toFixed(1)}km`;
    },
    formatMoneyManwon(v) {
      const n = Number(v);
      if (!Number.isFinite(n)) return String(v ?? "-");
      if (n >= 10000) {
        const eok = Math.floor(n / 10000);
        const rest = n % 10000;
        return rest === 0 ? `${eok}억` : `${eok}억 ${rest}만`;
      }
      return `${n}만`;
    },
    formatListingPrice(x) {
      const t = x?.type || "";
      const price = x?.price;
      const dep = x?.deposit;

      if (!t || price == null) return "";
      if (t === "월세") {
        const d = dep != null ? this.formatMoneyManwon(dep) : "0만";
        return `월세 ${d} / ${this.formatMoneyManwon(price)}`;
      }
      return `${t} ${this.formatMoneyManwon(price)}`;
    },
  },
};
</script>

<style scoped>
.listing-compare-panel {
  position: absolute;
  left: 277px;
  top: 7px;
  width: 270px;
  height: calc(100% - 14px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 2px 4px 4px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  z-index: 210;
}

.content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 20px;
}

.top-bar {
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}

.title {
  font-size: 13px;
  font-weight: 700;
  color: var(--tothezip-brown-10);
}

.back-button {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.base-card {
  margin: 10px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(244, 236, 231, 0.35);
  border: 1px solid var(--tothezip-brown-01);
}

.base-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.badge {
  display: inline-flex;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: var(--tothezip-brown-06);
  border: 1px solid var(--tothezip-brown-01);
  background: #fff;
  flex-shrink: 0;
}

.price {
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 4px;
}

.meta {
  font-size: 10px;
  color: var(--tothezip-gray-04);
  display: flex;
  gap: 4px;
  align-items: center;
}

.dot {
  opacity: 0.6;
}

.name {
  font-size: 11px;
  font-weight: 700;
  color: var(--tothezip-brown-07);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder {
  margin: 10px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(244, 236, 231, 0.3);
  text-align: center;
  font-size: 12px;
  color: var(--tothezip-gray-04);
}

/* 최적 매물 영역 */
.top-recommendation {
  margin: 10px;
}

.mole-section {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.mole-character {
  width: 40px;
  height: 40px;
  object-fit: contain;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.mole-bubble {
  position: relative;
  background: var(--tothezip-orange-06);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.mole-bubble::before {
  content: "";
  position: absolute;
  bottom: 4px;
  left: -6px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 8px 8px 0;
  border-color: transparent var(--tothezip-orange-06) transparent transparent;
}

.bubble-text {
  white-space: nowrap;
}

.top-card {
  border: 2px solid var(--tothezip-orange-06);
  border-radius: 12px;
  padding: 12px;
  background: linear-gradient(
    135deg,
    rgba(255, 237, 219, 0.3) 0%,
    rgba(255, 255, 255, 1) 100%
  );
  box-shadow: 0 4px 12px rgba(240, 138, 60, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;
}

.top-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(240, 138, 60, 0.25);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type {
  font-size: 11px;
  font-weight: 700;
  color: var(--tothezip-brown-06);
  border: 1px solid var(--tothezip-brown-01);
  padding: 2px 8px;
  border-radius: 999px;
  background: white;
}

.score {
  font-size: 11px;
  font-weight: 800;
  color: var(--tothezip-orange-06);
  background: rgba(255, 237, 219, 0.7);
  border: 1px solid rgba(240, 138, 60, 0.35);
  padding: 2px 8px;
  border-radius: 999px;
}

/* 비교 정보 그리드 */
.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(240, 138, 60, 0.2);
}

.comparison-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comparison-label {
  font-size: 9px;
  color: var(--tothezip-gray-04);
  font-weight: 600;
}

.comparison-value {
  font-size: 11px;
  font-weight: 800;
}

.comparison-value.positive {
  color: #2d9a5a;
}

.comparison-value.negative {
  color: #d94b4b;
}

.comparison-value.neutral {
  color: var(--tothezip-gray-05);
}

.ai-summary {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #222;
  line-height: 1.35;
}

.ai-reasons {
  margin: 6px 0 0;
  padding-left: 16px;
  font-size: 11px;
  color: var(--tothezip-gray-04);
  line-height: 1.35;
}

.apt {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--tothezip-brown-07);
}

/* 나머지 매물 영역 */
.other-section {
  margin: 16px 10px 0;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--tothezip-brown-08);
  margin-bottom: 8px;
  padding-left: 4px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.simple-card {
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 10px;
  padding: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.simple-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--tothezip-brown-03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.summary {
  margin-top: 6px;
  font-size: 11px;
  color: var(--tothezip-gray-05);
  line-height: 1.3;
}

.info {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: var(--tothezip-gray-04);
}

.apt-name {
  font-weight: 700;
  color: var(--tothezip-brown-07);
}
</style>
