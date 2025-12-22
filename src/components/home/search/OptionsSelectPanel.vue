<template>
  <div class="panel options-panel">
    <div class="panel-content">
      <div class="options-grid">
        <!-- 주변 시설 -->
        <div class="option-group">
          <h3 class="option-title">주변 시설</h3>
          <div class="toggle-buttons">
            <button
              class="toggle-button"
              :class="{ active: localOptions.nearSubway }"
              @click="localOptions.nearSubway = !localOptions.nearSubway"
            >
              역세권
            </button>
            <button
              class="toggle-button"
              :class="{ active: localOptions.nearSchool }"
              @click="localOptions.nearSchool = !localOptions.nearSchool"
            >
              학세권
            </button>
            <button
              class="toggle-button"
              :class="{ active: localOptions.nearHospital }"
              @click="localOptions.nearHospital = !localOptions.nearHospital"
            >
              병세권
            </button>
            <button
              class="toggle-button"
              :class="{ active: localOptions.nearCulture }"
              @click="localOptions.nearCulture = !localOptions.nearCulture"
            >
              문세권
            </button>
          </div>
        </div>

        <!-- 거래 유형 -->
        <div class="option-group">
          <h3 class="option-title">거래 유형</h3>
          <div class="toggle-buttons">
            <button
              class="toggle-button"
              :class="{ active: localOptions.dealType.includes('월세') }"
              @click="toggleDealType('월세')"
            >
              월세
            </button>
            <button
              class="toggle-button"
              :class="{ active: localOptions.dealType.includes('전세') }"
              @click="toggleDealType('전세')"
            >
              전세
            </button>
            <button
              class="toggle-button"
              :class="{ active: localOptions.dealType.includes('매매') }"
              @click="toggleDealType('매매')"
            >
              매매
            </button>
          </div>
        </div>
      </div>

      <!-- 2열 레이아웃: 왼쪽(기타 옵션), 오른쪽(가격 범위) -->
      <div class="main-options-grid">
        <!-- 왼쪽: 평수, 층수, 준공년도, 평균 평점 -->
        <div class="left-column">
          <div class="property-info-section">
            <h3 class="option-title">매물 정보</h3>

            <!-- 평수 범위 -->
            <div class="option-group">
              <h4 class="sub-option-title">평수 범위</h4>
              <div class="range-slider-container">
                <div class="range-values">
                  <span>{{ localOptions.areaMin }}평</span>
                  <span>{{ localOptions.areaMax }}평</span>
                </div>
                <div class="dual-range">
                  <div class="range-track"></div>
                  <div
                    class="range-progress"
                    :style="{
                      left: (localOptions.areaMin / 100) * 100 + '%',
                      width:
                        ((localOptions.areaMax - localOptions.areaMin) / 100) *
                          100 +
                        '%',
                    }"
                  ></div>
                  <input
                    type="range"
                    v-model.number="localOptions.areaMin"
                    min="0"
                    max="100"
                    step="5"
                    class="range-slider range-min"
                  />
                  <input
                    type="range"
                    v-model.number="localOptions.areaMax"
                    min="0"
                    max="100"
                    step="5"
                    class="range-slider range-max"
                  />
                </div>
              </div>
            </div>

            <!-- 층수 범위 -->
            <div class="option-group">
              <h4 class="sub-option-title">층수 범위</h4>
              <div class="range-slider-container">
                <div class="range-values">
                  <span>{{ localOptions.floorMin }}층</span>
                  <span>{{ localOptions.floorMax }}층</span>
                </div>
                <div class="dual-range">
                  <div class="range-track"></div>
                  <div
                    class="range-progress"
                    :style="{
                      left: (localOptions.floorMin / 50) * 100 + '%',
                      width:
                        ((localOptions.floorMax - localOptions.floorMin) / 50) *
                          100 +
                        '%',
                    }"
                  ></div>
                  <input
                    type="range"
                    v-model.number="localOptions.floorMin"
                    min="0"
                    max="50"
                    step="1"
                    class="range-slider range-min"
                  />
                  <input
                    type="range"
                    v-model.number="localOptions.floorMax"
                    min="0"
                    max="50"
                    step="1"
                    class="range-slider range-max"
                  />
                </div>
              </div>
            </div>

            <!-- 준공년도 -->
            <div class="option-group">
              <h4 class="sub-option-title">준공년도</h4>
              <div class="range-slider-container">
                <div class="range-values">
                  <span>{{ localOptions.buildYearMin }}년</span>
                  <span>{{ localOptions.buildYearMax }}년</span>
                </div>
                <div class="dual-range">
                  <div class="range-track"></div>
                  <div
                    class="range-progress"
                    :style="{
                      left:
                        ((localOptions.buildYearMin - 1970) / (2025 - 1970)) *
                          100 +
                        '%',
                      width:
                        ((localOptions.buildYearMax -
                          localOptions.buildYearMin) /
                          (2025 - 1970)) *
                          100 +
                        '%',
                    }"
                  ></div>
                  <input
                    type="range"
                    v-model.number="localOptions.buildYearMin"
                    min="1970"
                    max="2025"
                    step="1"
                    class="range-slider range-min"
                  />
                  <input
                    type="range"
                    v-model.number="localOptions.buildYearMax"
                    min="1970"
                    max="2025"
                    step="1"
                    class="range-slider range-max"
                  />
                </div>
              </div>
            </div>

            <!-- 평균 평점 -->
            <div class="option-group">
              <h4 class="sub-option-title">평균 평점</h4>
              <div class="range-slider-container">
                <div class="range-values">
                  <span>{{ localOptions.ratingMin.toFixed(1) }}점</span>
                  <span>{{ localOptions.ratingMax.toFixed(1) }}점</span>
                </div>
                <div class="dual-range">
                  <div class="range-track"></div>
                  <div
                    class="range-progress"
                    :style="{
                      left: (localOptions.ratingMin / 5) * 100 + '%',
                      width:
                        ((localOptions.ratingMax - localOptions.ratingMin) /
                          5) *
                          100 +
                        '%',
                    }"
                  ></div>
                  <input
                    type="range"
                    v-model.number="localOptions.ratingMin"
                    min="0"
                    max="5"
                    step="0.1"
                    class="range-slider range-min"
                  />
                  <input
                    type="range"
                    v-model.number="localOptions.ratingMax"
                    min="0"
                    max="5"
                    step="0.1"
                    class="range-slider range-max"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 오른쪽: 가격 범위 -->
        <div class="right-column">
          <!-- 가격 범위 (선택된 거래 유형에 따라 표시) -->
          <div
            v-if="localOptions.dealType.length > 0"
            class="option-group price-section"
          >
            <h3 class="option-title">가격 범위</h3>

            <!-- 월세 -->
            <div
              v-if="localOptions.dealType.includes('월세')"
              class="price-group"
            >
              <div class="price-item">
                <span class="price-label">보증금</span>
                <div class="range-slider-container">
                  <div class="range-values">
                    <span>{{ localOptions.depositMin }}만원</span>
                    <span>{{ localOptions.depositMax }}만원</span>
                  </div>
                  <div class="dual-range">
                    <div class="range-track"></div>
                    <div
                      class="range-progress"
                      :style="{
                        left: (localOptions.depositMin / 100000) * 100 + '%',
                        width:
                          ((localOptions.depositMax - localOptions.depositMin) /
                            100000) *
                            100 +
                          '%',
                      }"
                    ></div>
                    <input
                      type="range"
                      v-model.number="localOptions.depositMin"
                      min="0"
                      max="100000"
                      step="1000"
                      class="range-slider range-min"
                    />
                    <input
                      type="range"
                      v-model.number="localOptions.depositMax"
                      min="0"
                      max="100000"
                      step="1000"
                      class="range-slider range-max"
                    />
                  </div>
                </div>
              </div>

              <div class="price-item">
                <span class="price-label">월세</span>
                <div class="range-slider-container">
                  <div class="range-values">
                    <span>{{ localOptions.monthlyRentMin }}만원</span>
                    <span>{{ localOptions.monthlyRentMax }}만원</span>
                  </div>
                  <div class="dual-range">
                    <div class="range-track"></div>
                    <div
                      class="range-progress"
                      :style="{
                        left: (localOptions.monthlyRentMin / 500) * 100 + '%',
                        width:
                          ((localOptions.monthlyRentMax -
                            localOptions.monthlyRentMin) /
                            500) *
                            100 +
                          '%',
                      }"
                    ></div>
                    <input
                      type="range"
                      v-model.number="localOptions.monthlyRentMin"
                      min="0"
                      max="500"
                      step="10"
                      class="range-slider range-min"
                    />
                    <input
                      type="range"
                      v-model.number="localOptions.monthlyRentMax"
                      min="0"
                      max="500"
                      step="10"
                      class="range-slider range-max"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 전세 -->
            <div
              v-if="localOptions.dealType.includes('전세')"
              class="price-group"
            >
              <div class="price-item">
                <span class="price-label">전세금</span>
                <div class="range-slider-container">
                  <div class="range-values">
                    <span>{{ localOptions.jeonseMin }}만원</span>
                    <span>{{ localOptions.jeonseMax }}만원</span>
                  </div>
                  <div class="dual-range">
                    <div class="range-track"></div>
                    <div
                      class="range-progress"
                      :style="{
                        left: (localOptions.jeonseMin / 100000) * 100 + '%',
                        width:
                          ((localOptions.jeonseMax - localOptions.jeonseMin) /
                            100000) *
                            100 +
                          '%',
                      }"
                    ></div>
                    <input
                      type="range"
                      v-model.number="localOptions.jeonseMin"
                      min="0"
                      max="100000"
                      step="1000"
                      class="range-slider range-min"
                    />
                    <input
                      type="range"
                      v-model.number="localOptions.jeonseMax"
                      min="0"
                      max="100000"
                      step="1000"
                      class="range-slider range-max"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 매매 -->
            <div
              v-if="localOptions.dealType.includes('매매')"
              class="price-group"
            >
              <div class="price-item">
                <span class="price-label">매매가</span>
                <div class="range-slider-container">
                  <div class="range-values">
                    <span>{{ localOptions.buyMin }}억원</span>
                    <span>{{ localOptions.buyMax }}억원</span>
                  </div>
                  <div class="dual-range">
                    <div class="range-track"></div>
                    <div
                      class="range-progress"
                      :style="{
                        left: (localOptions.buyMin / 50) * 100 + '%',
                        width:
                          ((localOptions.buyMax - localOptions.buyMin) / 50) *
                            100 +
                          '%',
                      }"
                    ></div>
                    <input
                      type="range"
                      v-model.number="localOptions.buyMin"
                      min="0"
                      max="50"
                      step="1"
                      class="range-slider range-min"
                    />
                    <input
                      type="range"
                      v-model.number="localOptions.buyMax"
                      min="0"
                      max="50"
                      step="1"
                      class="range-slider range-max"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-footer">
        <button @click="reset" class="reset-button">초기화</button>
        <button @click="apply" class="apply-button">적용</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OptionsSelectPanel",
  props: {
    options: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      localOptions: { ...this.options },
    };
  },
  watch: {
    options: {
      deep: true,
      handler(newVal) {
        this.localOptions = { ...newVal };
      },
    },
    "localOptions.areaMin"(v) {
      if (v > this.localOptions.areaMax) this.localOptions.areaMax = v;
    },
    "localOptions.areaMax"(v) {
      if (v < this.localOptions.areaMin) this.localOptions.areaMin = v;
    },
    "localOptions.floorMin"(v) {
      if (v > this.localOptions.floorMax) this.localOptions.floorMax = v;
    },
    "localOptions.floorMax"(v) {
      if (v < this.localOptions.floorMin) this.localOptions.floorMin = v;
    },
    "localOptions.buildYearMin"(v) {
      if (v > this.localOptions.buildYearMax)
        this.localOptions.buildYearMax = v;
    },
    "localOptions.buildYearMax"(v) {
      if (v < this.localOptions.buildYearMin)
        this.localOptions.buildYearMin = v;
    },
    "localOptions.ratingMin"(v) {
      if (v > this.localOptions.ratingMax) this.localOptions.ratingMax = v;
    },
    "localOptions.ratingMax"(v) {
      if (v < this.localOptions.ratingMin) this.localOptions.ratingMin = v;
    },
    "localOptions.depositMin"(v) {
      if (v > this.localOptions.depositMax) this.localOptions.depositMax = v;
    },
    "localOptions.depositMax"(v) {
      if (v < this.localOptions.depositMin) this.localOptions.depositMin = v;
    },
    "localOptions.monthlyRentMin"(v) {
      if (v > this.localOptions.monthlyRentMax)
        this.localOptions.monthlyRentMax = v;
    },
    "localOptions.monthlyRentMax"(v) {
      if (v < this.localOptions.monthlyRentMin)
        this.localOptions.monthlyRentMin = v;
    },
    "localOptions.jeonseMin"(v) {
      if (v > this.localOptions.jeonseMax) this.localOptions.jeonseMax = v;
    },
    "localOptions.jeonseMax"(v) {
      if (v < this.localOptions.jeonseMin) this.localOptions.jeonseMin = v;
    },
    "localOptions.buyMin"(v) {
      if (v > this.localOptions.buyMax) this.localOptions.buyMax = v;
    },
    "localOptions.buyMax"(v) {
      if (v < this.localOptions.buyMin) this.localOptions.buyMin = v;
    },
  },
  methods: {
    toggleDealType(type) {
      const index = this.localOptions.dealType.indexOf(type);
      if (index > -1) {
        this.localOptions.dealType.splice(index, 1);
      } else {
        this.localOptions.dealType.push(type);
      }
    },
    apply() {
      this.$emit("apply", JSON.parse(JSON.stringify(this.localOptions)));
    },
    reset() {
      this.localOptions = {
        nearSubway: false,
        nearSchool: false,
        nearHospital: false,
        nearCulture: false,
        dealType: [],
        depositMin: 0,
        depositMax: 100000,
        monthlyRentMin: 0,
        monthlyRentMax: 500,
        jeonseMin: 0,
        jeonseMax: 100000,
        buyMin: 0,
        buyMax: 50,
        areaMin: 0,
        areaMax: 100,
        floorMin: 0,
        floorMax: 50,
        buildYearMin: 1970,
        buildYearMax: 2025,
        ratingMin: 0,
        ratingMax: 5,
      };
      this.$emit("reset");
    },
  },
};
</script>

<style scoped>
.panel {
  background: white;
  border-radius: 24px;
}

.panel-content {
  padding: 24px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.main-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 매물 정보 섹션 스타일 */
.property-info-section {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
}

.property-info-section .option-group {
  margin-top: 12px;
}

.property-info-section .option-group:first-of-type {
  margin-top: 16px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-option-title {
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: var(--tothezip-brown-08);
  margin: 0 0 4px 0;
}

.option-title {
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--tothezip-brown-08);
  margin-bottom: 4px;
}

.toggle-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toggle-button {
  padding: 8px 16px;
  border: 1.5px solid var(--tothezip-gray-03);
  border-radius: 20px;
  background: white;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--tothezip-brown-08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-button:hover {
  border-color: var(--tothezip-orange-05);
  color: var(--tothezip-orange-06);
}

.toggle-button.active {
  background: var(--tothezip-orange-06);
  border-color: var(--tothezip-orange-06);
  color: white;
  font-weight: 600;
}

.range-slider-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.range-values {
  display: flex;
  justify-content: space-between;
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  color: var(--tothezip-brown-08);
  font-weight: 500;
}

.dual-range {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
}

.range-track {
  position: absolute;
  width: 100%;
  height: 6px;
  background: var(--tothezip-gray-02);
  border-radius: 3px;
  top: 50%;
  transform: translateY(-50%);
}

.range-progress {
  position: absolute;
  height: 6px;
  background: var(--tothezip-orange-06);
  border-radius: 3px;
  top: 50%;
  transform: translateY(-50%);
  transition: left 0.1s, width 0.1s;
}

.range-slider {
  position: absolute;
  width: 100%;
  height: 20px;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--tothezip-orange-06);
  cursor: pointer;
  pointer-events: all;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
}

.range-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--tothezip-orange-06);
  cursor: pointer;
  pointer-events: all;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
}

.range-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 20px;
  background: transparent;
  border: none;
}

.range-slider::-moz-range-track {
  width: 100%;
  height: 20px;
  background: transparent;
  border: none;
}

.range-slider.range-min {
  z-index: 5;
}

.range-slider.range-max {
  z-index: 6;
}

/* 가격 섹션 스타일 */
.price-section {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px !important;
}

.price-group {
  margin-top: 12px;
}

.price-group:first-child {
  margin-top: 0;
}

.price-group-title {
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--tothezip-brown-08);
  margin: 0 0 16px 0;
}

.price-item {
  margin-bottom: 12px;
}

.price-item:last-child {
  margin-bottom: 0;
}

.price-label {
  display: block;
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--tothezip-brown-07);
  margin-bottom: 8px;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--tothezip-gray-02);
}

.reset-button,
.apply-button {
  padding: 10px 24px;
  border-radius: 24px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button {
  background: white;
  border: 1px solid var(--tothezip-gray-03);
  color: var(--tothezip-brown-08);
}

.reset-button:hover {
  background: var(--tothezip-gray-01, #f7f7f7);
}

.apply-button {
  background: var(--tothezip-orange-06);
  border: none;
  color: white;
}

.apply-button:hover {
  background: var(--tothezip-orange-07);
}
</style>
