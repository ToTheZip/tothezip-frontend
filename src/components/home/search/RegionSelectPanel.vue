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
              v-for="d in dongList"
              :key="d.dongCode"
              class="selector-item"
              :class="{ selected: localSelectedDong === d.dongName }"
              @click="selectDong(d.dongName)"
            >
              {{ d.dongName }}
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
import axios from "axios";

export default {
  name: "RegionSelectPanel",
  props: {
    selectedSido: String,
    selectedGugun: String,
    selectedDong: String,
  },
  data() {
    return {
      localSelectedSido: this.selectedSido || "",
      localSelectedGugun: this.selectedGugun || "",
      localSelectedDong: this.selectedDong || "",

      sidoList: [],
      gugunList: [],
      dongList: [], // [{ dongCode, dongName }]
      loading: false,
    };
  },
  watch: {
    selectedSido(v) {
      this.localSelectedSido = v || "";
    },
    selectedGugun(v) {
      this.localSelectedGugun = v || "";
    },
    selectedDong(v) {
      this.localSelectedDong = v || "";
    },
  },
  async mounted() {
    await this.fetchSidos();

    // 이미 선택값이 있으면 계단식으로 미리 로드
    if (this.localSelectedSido) {
      await this.fetchGuguns(this.localSelectedSido);
    }
    if (this.localSelectedSido && this.localSelectedGugun) {
      await this.fetchDongs(this.localSelectedSido, this.localSelectedGugun);
    }
  },
  methods: {
    async fetchSidos() {
      this.loading = true;
      try {
        const res = await axios.get("/regions/sidos");

        if (!Array.isArray(res.data)) {
          console.error("sidos API 응답이 배열이 아님:", res.data);
          this.sidoList = [];
          return;
        }
        this.sidoList = res.data;
      } finally {
        this.loading = false;
      }
    },

    async fetchGuguns(sido) {
      this.loading = true;
      try {
        const res = await axios.get("/regions/guguns", { params: { sido } });
        this.gugunList = res.data || [];
      } finally {
        this.loading = false;
      }
    },
    async fetchDongs(sido, gugun) {
      this.loading = true;
      try {
        const res = await axios.get("/regions/dongs", {
          params: { sido, gugun },
        });
        // res.data: [{dongCode, dongName}]
        this.dongList = res.data || [];
      } finally {
        this.loading = false;
      }
    },

    async selectSido(sido) {
      this.localSelectedSido = sido;
      this.localSelectedGugun = "";
      this.localSelectedDong = "";
      this.gugunList = [];
      this.dongList = [];
      await this.fetchGuguns(sido);
      this.autoApply();
    },
    async selectGugun(gugun) {
      this.localSelectedGugun = gugun;
      this.localSelectedDong = "";
      this.dongList = [];
      await this.fetchDongs(this.localSelectedSido, gugun);
      this.autoApply();
    },
    selectDong(dongName) {
      this.localSelectedDong = dongName;
      this.autoApply();
    },

    autoApply() {
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

    apply() {
      this.autoApply();
    },
    reset() {
      this.localSelectedSido = "";
      this.localSelectedGugun = "";
      this.localSelectedDong = "";
      this.gugunList = [];
      this.dongList = [];
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
