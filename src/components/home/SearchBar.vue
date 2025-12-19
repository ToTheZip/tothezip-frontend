<template>
  <div class="search-area">
    <div class="search-bar-container">
      <div class="search-bar">
        <div class="search-field area-1">
          <div class="field-title">지역</div>
          <div class="field-search">
            <input
              type="text"
              v-model="searchData.region"
              placeholder="지역 검색"
              class="search-input"
            />
          </div>
        </div>

        <div class="divider"></div>

        <div class="search-field area-2">
          <div class="field-title">옵션</div>
          <div class="field-search">
            <input
              type="text"
              v-model="searchData.options"
              placeholder="옵션 추가"
              class="search-input"
            />
          </div>
        </div>

        <div class="divider"></div>

        <div class="search-field area-3">
          <div class="field-title">매물명</div>
          <div class="field-search">
            <input
              type="text"
              v-model="searchData.propertyName"
              placeholder="검색어 입력"
              class="search-input"
            />
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
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchBar",
  data() {
    return {
      searchData: { region: "", options: "", propertyName: "" },
    };
  },
  methods: {
    handleSearch() {
      this.$emit("search", this.searchData);
    },
  },
};
</script>

<style scoped>
.search-area {
  width: 100%;
  display: flex;
  justify-content: center;
}

.search-bar-container {
  width: 830px;
  height: 80px;
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
}

.search-field {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 13px 11px 13px;
  height: 80px;
}

.area-1,
.area-2,
.area-3 {
  width: 240px;
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
}

.search-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: black;
}

.search-input::placeholder {
  color: var(--tothezip-gray-04);
}

.divider {
  width: 0;
  height: 30px;
  border-left: 1px solid var(--tothezip-gray-02);
  margin: 0 8px;
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
}

.search-button:hover {
  background: var(--tothezip-orange-07);
}
</style>
