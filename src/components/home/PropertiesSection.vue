<template>
  <div class="properties-section">
    <div class="section-header">
      <div class="section-title">
        <template v-if="isLoggedIn">
          관심 등록한
          <span class="highlight">{{ regionName || "관심지역" }}</span
          >, 추천 매물을 준비했어요
        </template>
        <template v-else>
          두집이가 추천하는
          <span class="highlight">인기 매물</span> 보고가세요
        </template>
      </div>

      <div class="section-tags" v-if="isLoggedIn">
        <button
          v-for="tag in tags"
          :key="tag"
          class="tag-button"
          @click="$emit('tag-click', tag)"
        >
          #{{ tag }}
        </button>
      </div>
    </div>

    <div class="properties-grid">
      <PropertyCard
        v-for="p in properties"
        :key="p.id"
        :property="p"
        @go-map="(aptSeq) => $emit('property-go-map', aptSeq)"
      />
    </div>
  </div>
</template>

<script>
import PropertyCard from "./PropertyCard.vue";

export default {
  name: "PropertiesSection",
  components: { PropertyCard },
  props: {
    isLoggedIn: Boolean,
    regionName: String,
    tags: Array,
    properties: { type: Array, required: true },
  },
};
</script>

<style scoped>
.properties-section {
  width: 1070px;
  margin: 0 auto;
  padding: 40px 0;
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 4px 13px;
  margin-bottom: 20px;
}

.section-title {
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: black;
  line-height: normal;
  padding: 3px 4px;
}

.highlight {
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  color: var(--tothezip-orange-06);
}

.section-tags {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 2px;
}

.tag-button {
  border: 1px solid var(--tothezip-gray-04);
  border-radius: 50px;
  padding: 5px 8px;
  min-width: 68px;
  background: transparent;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 15px;
  color: var(--tothezip-gray-04);
  line-height: normal;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-button:hover {
  border-color: var(--tothezip-orange-06);
  color: var(--tothezip-orange-06);
}

.properties-grid {
  display: grid;

  /* ✅ 화면/컨테이너 폭에 맞게 자동으로 몇 칸 들어갈지 결정 */
  grid-template-columns: repeat(auto-fill, 214px);

  /* ✅ 그리드(카드 묶음) 자체를 컨테이너 가운데로 */
  justify-content: center;

  /* ✅ 카드 간격 (원하면 0 유지 가능) */
  column-gap: 0;
  row-gap: 0;

  /* ✅ 컨테이너 폭은 1070 유지(너가 원하던 기준) */
  width: 1070px;
  margin: 0 auto;

  overflow: hidden;
}
</style>
