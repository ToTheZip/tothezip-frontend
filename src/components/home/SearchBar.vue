<template>
  <div class="search-area">
    <div class="search-bar-container">
      <div class="search-bar">
        <div v-if="activePanel" class="searchbar-dim"></div>

        <!-- 지역 선택 필드 -->
        <div
          class="search-field area-1"
          :class="{ active: activePanel === 'region' }"
          @click="togglePanel('region')"
        >
          <div class="field-title">지역</div>
          <div class="field-search">
            <div v-if="selectedLocation" class="selected-text">
              {{ selectedLocation }}
            </div>
            <div v-else class="placeholder-text">지역 검색</div>
          </div>
        </div>

        <div
          class="divider"
          :class="{
            hidden: activePanel === 'region' || activePanel === 'options',
          }"
        ></div>

        <!-- 옵션 선택 필드 -->
        <div
          class="search-field area-2"
          :class="{ active: activePanel === 'options' }"
          @click="togglePanel('options')"
        >
          <div class="field-title">옵션</div>
          <div class="field-search">
            <div v-if="selectedOptions.length > 0" class="options-tags">
              <span
                v-for="(tag, index) in visibleOptionTags"
                :key="index"
                class="option-tag"
              >
                {{ tag }}
              </span>
              <span v-if="hiddenOptionsCount > 0" class="more-options">
                외 {{ hiddenOptionsCount }}개
              </span>
            </div>
            <div v-else class="placeholder-text">옵션 추가</div>
          </div>
        </div>

        <div
          class="divider"
          :class="{
            hidden: activePanel === 'options' || activePanel === 'property',
          }"
        ></div>

        <!-- 매물명 선택 필드 -->
        <div
          class="search-field area-3"
          :class="{ active: activePanel === 'property' }"
          @click="togglePanel('property')"
        >
          <div class="field-title">매물명</div>
          <div class="field-search">
            <div v-if="selectedProperty" class="selected-text">
              {{ selectedProperty }}
            </div>
            <div v-else class="placeholder-text">검색어 입력</div>
          </div>
        </div>

        <button @click="handleSearch" class="search-button" aria-label="search">
          <svg
            class="search-icon"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
          >
            <circle
              cx="13"
              cy="13"
              r="8"
              stroke="white"
              stroke-width="2"
              fill="none"
            />
            <path
              d="M18 18L22 22"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- 패널 영역 -->
      <transition name="slide-fade">
        <div v-if="activePanel" class="panel-container">
          <!-- 지역 선택 패널 -->
          <RegionSelectPanel
            v-if="activePanel === 'region'"
            :selectedSido="selectedSido"
            :selectedGugun="selectedGugun"
            :selectedDong="selectedDong"
            @apply="handleRegionApply"
            @reset="resetLocation"
          />

          <!-- 옵션 선택 패널 -->
          <OptionsSelectPanel
            v-if="activePanel === 'options'"
            :options="optionsData"
            @apply="handleOptionsApply"
            @reset="resetOptions"
          />

          <!-- 매물명 검색 패널 -->
          <PropertySearchPanel
            v-if="activePanel === 'property'"
            :initialQuery="propertySearchQuery"
            @select="handlePropertySelect"
          />
        </div>
      </transition>
    </div>

    <!-- 배경 클릭 시 패널 닫기 -->
    <div v-if="activePanel" class="overlay" @click="closePanel"></div>
  </div>
</template>

<script>
import RegionSelectPanel from "./search/RegionSelectPanel.vue";
import OptionsSelectPanel from "./search/OptionsSelectPanel.vue";
import PropertySearchPanel from "./search/PropertySearchPanel.vue";

export default {
  name: "SearchBar",
  components: {
    RegionSelectPanel,
    OptionsSelectPanel,
    PropertySearchPanel,
  },
  data() {
    return {
      activePanel: null,

      // 지역 선택 데이터
      selectedSido: "",
      selectedGugun: "",
      selectedDong: "",
      selectedLocation: "",

      // 옵션 데이터
      optionsData: {
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
      },
      selectedOptions: [],

      // 매물명 검색 데이터
      propertySearchQuery: "",
      selectedProperty: "",
    };
  },
  computed: {
    visibleOptionTags() {
      // 옵션 칸에 표시할 수 있는 태그 수 제한 (약 2-3개)
      return this.selectedOptions.slice(0, 3);
    },
    hiddenOptionsCount() {
      return Math.max(0, this.selectedOptions.length - 3);
    },
  },
  methods: {
    togglePanel(panel) {
      if (this.activePanel === panel) {
        this.activePanel = null;
      } else {
        this.activePanel = panel;

        // 매물명 패널 열 때 input에 포커스
        if (panel === "property") {
          this.$nextTick(() => {
            if (this.$refs.propertyInput) {
              this.$refs.propertyInput.focus();
            }
          });
        }
      }
    },
    closePanel() {
      this.activePanel = null;
    },

    // 지역 선택 관련 메서드
    handleRegionApply({ sido, gugun, dong, location }) {
      this.selectedSido = sido;
      this.selectedGugun = gugun;
      this.selectedDong = dong;
      this.selectedLocation = location;
      this.closePanel();
    },
    resetLocation() {
      this.selectedSido = "";
      this.selectedGugun = "";
      this.selectedDong = "";
      this.selectedLocation = "";
    },

    // 옵션 선택 관련 메서드
    handleOptionsApply(options) {
      this.optionsData = { ...options };

      const optionTags = [];
      if (options.nearSubway) optionTags.push("역세권");
      if (options.nearSchool) optionTags.push("학세권");
      if (options.nearHospital) optionTags.push("병세권");
      if (options.nearCulture) optionTags.push("문세권");
      if (options.dealType && options.dealType.length > 0) {
        optionTags.push(...options.dealType);
      }

      // 거래 유형별 가격 정보 표시
      if (options.dealType.includes("월세")) {
        if (options.depositMin || options.depositMax) {
          optionTags.push(
            `보증금 ${options.depositMin || 0}~${options.depositMax || "∞"}만원`
          );
        }
        if (options.monthlyRentMin || options.monthlyRentMax) {
          optionTags.push(
            `월세 ${options.monthlyRentMin || 0}~${
              options.monthlyRentMax || "∞"
            }만원`
          );
        }
      }
      if (options.dealType.includes("전세")) {
        if (options.jeonseMin || options.jeonseMax) {
          optionTags.push(
            `전세 ${options.jeonseMin || 0}~${options.jeonseMax || "∞"}만원`
          );
        }
      }
      if (options.dealType.includes("매매")) {
        if (options.buyMin || options.buyMax) {
          optionTags.push(
            `매매 ${options.buyMin || 0}~${options.buyMax || "∞"}억원`
          );
        }
      }

      if (options.areaMin || options.areaMax) {
        optionTags.push(`${options.areaMin || 0}~${options.areaMax || "∞"}평`);
      }
      if (options.floorMin || options.floorMax) {
        optionTags.push(
          `${options.floorMin || 0}~${options.floorMax || "∞"}층`
        );
      }
      if (options.buildYearMin || options.buildYearMax) {
        optionTags.push(
          `${options.buildYearMin || 0}~${options.buildYearMax || "현재"}년`
        );
      }
      if (options.ratingMin || options.ratingMax) {
        optionTags.push(
          `평점 ${options.ratingMin || 0}~${options.ratingMax || 5}`
        );
      }

      this.selectedOptions = optionTags;
      this.closePanel();
    },
    resetOptions() {
      this.optionsData = {
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
      this.selectedOptions = [];
    },

    // 매물명 검색 관련 메서드
    handlePropertySelect(property) {
      this.selectedProperty = property;
      this.propertySearchQuery = property;
      this.closePanel();
    },

    // 검색 실행
    handleSearch() {
      const searchData = {
        location: this.selectedLocation,
        options: this.optionsData,
        propertyName: this.selectedProperty,
      };

      this.$emit("search", searchData);
    },
  },
};
</script>

<style scoped>
.search-area {
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 100;
}

.search-bar-container {
  width: 830px;
  position: relative;
  z-index: 200;
}

.search-bar {
  width: 830px;
  height: 80px;
  background: white;
  border: 1px solid var(--tothezip-gray-02);
  border-radius: 100px;
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.14);
  display: flex;
  align-items: center;
  padding: 10px 16px 10px 26px;
  gap: 0;
  position: relative;
  z-index: 201;
  /* overflow: hidden; */
}

.searchbar-dim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18); /* 원하는 만큼 조절 */
  border-radius: 100px;
  z-index: 1;
  pointer-events: none; /* 클릭은 아래 요소 그대로 */
}

.search-field {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 13px 11px 13px;
  height: 80px;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.2s;
  margin: 0 -8px;
}

.search-field,
.search-button {
  position: relative;
  z-index: 2;
}

.search-field:hover {
  background-color: var(--tothezip-gray-01, #f7f7f7);
}

.search-field.active {
  z-index: 3;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px 28px 11px 28px;
  margin: 0 -16px;
}

/* 지역 칸이 active일 때 검색바 왼쪽 끝까지 확장 */
.area-1.active {
  padding-left: 26px;
  margin-left: -26px;
}

/* 매물명 칸이 active일 때 검색바 오른쪽 끝(검색 버튼 포함)까지 확장 */
.area-3.active {
  padding-right: 100px;
  margin-right: -100px;
}

.area-1 {
  width: 245px;
}

.area-2 {
  width: 245px;
}

.area-3 {
  width: 245px;
}

.field-title {
  height: 30px;
  padding: 0 6px;
  margin-bottom: -3px;
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--tothezip-brown-08);
}

.field-search {
  display: flex;
  align-items: center;
  height: 30px;
  padding: 5px 6px;
  width: 100%;
  overflow: hidden;
}

.selected-text {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder-text {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: var(--tothezip-gray-04);
}

.options-tags {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: nowrap;
  overflow: hidden;
}

.option-tag {
  background: var(--tothezip-orange-02, #fff4ed);
  color: var(--tothezip-orange-06);
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.more-options {
  color: var(--tothezip-gray-05);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.divider {
  width: 0;
  height: 30px;
  border-left: 1px solid var(--tothezip-gray-02);
  margin: 0 8px;
  transition: opacity 0.2s ease;
}

.divider.hidden {
  opacity: 0;
}

.search-button {
  margin-left: auto;
  width: 54px;
  height: 54px;
  background: var(--tothezip-orange-06);
  border: none;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  z-index: 3;
}

.search-button:hover {
  background: var(--tothezip-orange-07);
}

/* 패널 스타일 */
.panel-container {
  position: absolute;
  top: 90px;
  left: 0;
  right: 0;
  z-index: 103;
  max-height: calc(100vh - 200px);
  overflow: visible;
}

.panel {
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}

.panel-content {
  padding: 24px;
}

/* 오버레이 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: rgba(0, 0, 0, 0.3); */
  z-index: 99;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
