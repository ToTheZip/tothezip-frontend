<template>
  <div class="panel property-panel">
    <div class="panel-content">
      <div class="property-search">
        <input
          type="text"
          v-model="searchQuery"
          @input="onInput"
          placeholder="아파트 이름을 입력하세요"
          class="property-search-input"
          ref="searchInput"
        />

        <div v-if="loading" class="no-results">불러오는 중...</div>

        <div v-else-if="results.length > 0" class="property-list">
          <div
            v-for="item in results"
            :key="item.aptSeq"
            class="property-item"
            @click="selectProperty(item)"
          >
            {{ item.aptName }}
          </div>
        </div>

        <div v-else-if="searchQuery.trim()" class="no-results">
          검색 결과가 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PropertySearchPanel",
  props: {
    initialQuery: { type: String, default: "" },

    // 지역 상태 받기
    sido: { type: String, default: "" },
    gugun: { type: String, default: "" },
    dong: { type: String, default: "" },
  },
  data() {
    return {
      searchQuery: this.initialQuery,
      results: [],
      loading: false,
      timer: null,
    };
  },
  watch: {
    initialQuery(v) {
      this.searchQuery = v || "";
    },
    // 지역이 바뀌면 같은 검색어로 다시 조회
    sido() {
      this.debouncedSearch();
    },
    gugun() {
      this.debouncedSearch();
    },
    dong() {
      this.debouncedSearch();
    },
  },
  mounted() {
    this.$nextTick(() => this.$refs.searchInput?.focus());
    if ((this.searchQuery || "").trim()) this.fetch();
  },
  methods: {
    onInput() {
      this.debouncedSearch();
    },
    debouncedSearch() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.fetch(), 250);
    },
    async fetch() {
      const q = (this.searchQuery || "").trim();
      if (!q) {
        this.results = [];
        return;
      }

      this.loading = true;
      try {
        const res = await axios.get("/property/autocomplete", {
          params: {
            query: q,
            // 지역 미선택이면 아예 안 보내거나 null 처리
            sido: this.sido || null,
            gugun: this.gugun || null,
            dong: this.dong || null,
          },
        });
        this.results = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        this.results = [];
      } finally {
        this.loading = false;
      }
    },
    selectProperty(item) {
      this.searchQuery = item.aptName;
      // 선택 시 aptName만 올려도 되고, aptSeq까지 올려두면 나중에 상세조회 편함
      this.$emit("select", item);
      // 추천: this.$emit("select", item); 로 바꾸면 더 좋음(aptSeq 활용 가능)
    },
  },
};
</script>

<style scoped>
/* 너 기존 스타일 그대로 사용 */
.panel {
  background: white;
  border-radius: 24px;
}
.panel-content {
  padding: 24px;
}
.property-search {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.property-search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--tothezip-gray-02);
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  outline: none;
}
.property-search-input:focus {
  border-color: var(--tothezip-orange-06);
}
.property-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--tothezip-gray-02);
  border-radius: 12px;
  padding: 8px;
}
.property-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  color: var(--tothezip-brown-08);
  transition: background-color 0.2s;
}
.property-item:hover {
  background-color: var(--tothezip-orange-02, #fff4ed);
  color: var(--tothezip-orange-06);
}
.no-results {
  padding: 20px;
  text-align: center;
  color: var(--tothezip-gray-04);
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
}
</style>
