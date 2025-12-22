<template>
  <div class="panel property-panel">
    <div class="panel-content">
      <div class="property-search">
        <input
          type="text"
          v-model="searchQuery"
          @input="search"
          placeholder="아파트 이름을 입력하세요"
          class="property-search-input"
          ref="searchInput"
        />
        <div v-if="filteredProperties.length > 0" class="property-list">
          <div
            v-for="property in filteredProperties"
            :key="property"
            class="property-item"
            @click="selectProperty(property)"
          >
            {{ property }}
          </div>
        </div>
        <div v-else-if="searchQuery" class="no-results">
          검색 결과가 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PropertySearchPanel",
  props: {
    initialQuery: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      searchQuery: this.initialQuery,
      filteredProperties: [],

      // 실제로는 API에서 가져와야 함
      allProperties: [
        "래미안퍼스티지",
        "헬리오시티",
        "아크로리버파크",
        "롯데캐슬",
        "자이아파트",
        "푸르지오",
        "힐스테이트",
        "래미안",
        "아크로",
        "디에이치",
        "센트럴",
        "더샵",
        "파크",
        "트리마제",
      ],
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.searchInput) {
        this.$refs.searchInput.focus();
      }
    });
  },
  methods: {
    search() {
      if (!this.searchQuery) {
        this.filteredProperties = [];
        return;
      }

      // 실제로는 API 호출로 대체해야 함
      this.filteredProperties = this.allProperties.filter((property) =>
        property.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    selectProperty(property) {
      this.searchQuery = property;
      this.$emit("select", property);
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

.property-list::-webkit-scrollbar {
  width: 6px;
}

.property-list::-webkit-scrollbar-track {
  background: transparent;
}

.property-list::-webkit-scrollbar-thumb {
  background: var(--tothezip-gray-03);
  border-radius: 3px;
}

.property-list::-webkit-scrollbar-thumb:hover {
  background: var(--tothezip-gray-04);
}
</style>
