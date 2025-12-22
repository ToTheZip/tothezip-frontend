<template>
  <div class="panel region-panel">
    <div class="panel-content">
      <div class="location-selector">
        <div class="selector-column">
          <h3 class="selector-title">시/도</h3>
          <div class="selector-list">
            <div
              v-for="sido in sidoList"
              :key="sido"
              class="selector-item"
              :class="{ selected: localSelectedSido === sido }"
              @click="selectSido(sido)"
            >
              {{ sido }}
            </div>
          </div>
        </div>

        <div v-if="localSelectedSido" class="selector-column">
          <h3 class="selector-title">구/군</h3>
          <div class="selector-list">
            <div
              v-for="gugun in gugunList"
              :key="gugun"
              class="selector-item"
              :class="{ selected: localSelectedGugun === gugun }"
              @click="selectGugun(gugun)"
            >
              {{ gugun }}
            </div>
          </div>
        </div>

        <div v-if="localSelectedGugun" class="selector-column">
          <h3 class="selector-title">읍/면/동</h3>
          <div class="selector-list">
            <div
              v-for="dong in dongList"
              :key="dong"
              class="selector-item"
              :class="{ selected: localSelectedDong === dong }"
              @click="selectDong(dong)"
            >
              {{ dong }}
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
  name: "RegionSelectPanel",
  props: {
    selectedSido: String,
    selectedGugun: String,
    selectedDong: String,
  },
  data() {
    return {
      localSelectedSido: this.selectedSido,
      localSelectedGugun: this.selectedGugun,
      localSelectedDong: this.selectedDong,

      sidoList: [
        "서울특별시",
        "부산광역시",
        "대구광역시",
        "인천광역시",
        "광주광역시",
        "대전광역시",
        "울산광역시",
        "세종특별자치시",
        "경기도",
        "강원도",
        "충청북도",
        "충청남도",
        "전라북도",
        "전라남도",
        "경상북도",
        "경상남도",
        "제주특별자치도",
      ],

      locationData: {
        서울특별시: {
          강남구: [
            "역삼동",
            "개포동",
            "청담동",
            "삼성동",
            "대치동",
            "신사동",
            "논현동",
            "압구정동",
          ],
          강동구: ["명일동", "고덕동", "상일동", "길동", "둔촌동", "암사동"],
          마포구: [
            "아현동",
            "공덕동",
            "서교동",
            "합정동",
            "망원동",
            "연남동",
            "성산동",
            "상암동",
          ],
          // 다른 구들...
        },
        경기도: {
          수원시: ["장안구", "권선구", "팔달구", "영통구"],
          성남시: ["수정구", "중원구", "분당구"],
          고양시: ["덕양구", "일산동구", "일산서구"],
        },
      },
    };
  },
  computed: {
    gugunList() {
      if (
        !this.localSelectedSido ||
        !this.locationData[this.localSelectedSido]
      ) {
        return [];
      }
      return Object.keys(this.locationData[this.localSelectedSido]);
    },
    dongList() {
      if (
        !this.localSelectedSido ||
        !this.localSelectedGugun ||
        !this.locationData[this.localSelectedSido] ||
        !this.locationData[this.localSelectedSido][this.localSelectedGugun]
      ) {
        return [];
      }
      return this.locationData[this.localSelectedSido][this.localSelectedGugun];
    },
  },
  methods: {
    selectSido(sido) {
      this.localSelectedSido = sido;
      this.localSelectedGugun = "";
      this.localSelectedDong = "";
    },
    selectGugun(gugun) {
      this.localSelectedGugun = gugun;
      this.localSelectedDong = "";
    },
    selectDong(dong) {
      this.localSelectedDong = dong;
    },
    apply() {
      let location = "";
      if (this.localSelectedSido) location += this.localSelectedSido;
      if (this.localSelectedGugun) location += " " + this.localSelectedGugun;
      if (this.localSelectedDong) location += " " + this.localSelectedDong;

      this.$emit("apply", {
        sido: this.localSelectedSido,
        gugun: this.localSelectedGugun,
        dong: this.localSelectedDong,
        location: location.trim(),
      });
    },
    reset() {
      this.localSelectedSido = "";
      this.localSelectedGugun = "";
      this.localSelectedDong = "";
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

.location-selector {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.selector-column {
  flex: 1;
  min-width: 0;
}

.selector-title {
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--tothezip-brown-08);
  margin-bottom: 12px;
}

.selector-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--tothezip-gray-02);
  border-radius: 12px;
  padding: 8px;
}

.selector-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  color: var(--tothezip-brown-08);
  transition: background-color 0.2s;
}

.selector-item:hover {
  background-color: var(--tothezip-gray-01, #f7f7f7);
}

.selector-item.selected {
  background-color: var(--tothezip-orange-02, #fff4ed);
  color: var(--tothezip-orange-06);
  font-weight: 600;
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

.selector-list::-webkit-scrollbar {
  width: 6px;
}

.selector-list::-webkit-scrollbar-track {
  background: transparent;
}

.selector-list::-webkit-scrollbar-thumb {
  background: var(--tothezip-gray-03);
  border-radius: 3px;
}

.selector-list::-webkit-scrollbar-thumb:hover {
  background: var(--tothezip-gray-04);
}
</style>
