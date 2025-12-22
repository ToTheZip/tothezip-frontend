<template>
  <div class="search-map-page">
    <div class="map-container">
      <KakaoMap
        style="width: 100%; height: 100%"
        :lat="center.lat"
        :lng="center.lng"
        :level="level"
        :draggable="true"
        :scrollwheel="true"
        :zoomable="true"
        @onLoadKakaoMap="onLoadKakaoMap"
      />
    </div>

    <!-- 왼쪽 검색 결과 사이드바 -->
    <div class="search-results-sidebar">
      <div class="filter-tags-section">
        <FilterTag v-for="tag in filterTags" :key="tag.id" :label="tag.label" />
      </div>

      <div class="results-list">
        <PropertyCard
          v-for="property in properties"
          :key="property.id"
          :property="property"
          @click="selectProperty(property)"
        />
      </div>
    </div>

    <!-- 매물 상세 패널 -->
    <PropertyDetailPanel
      v-if="selectedProperty"
      :property="selectedProperty"
      @close="closeDetailPanel"
      @toggle-like="toggleLike"
    />
  </div>
</template>

<script>
import { KakaoMap, KakaoMapMarker } from "vue3-kakao-maps";
import FilterTag from "@/components/search/FilterTag.vue";
import PropertyCard from "@/components/search/PropertyCard.vue";
import PropertyDetailPanel from "@/components/search/PropertyDetailPanel.vue";

export default {
  name: "SearchMapPage",
  components: {
    KakaoMap,
    KakaoMapMarker,
    FilterTag,
    PropertyCard,
    PropertyDetailPanel,
  },
  data() {
    return {
      center: { lat: 37.572, lng: 126.991 },
      level: 4,
      selectedProperty: null,
      filterTags: [
        { id: 1, label: "역세권" },
        { id: 2, label: "문세권" },
        { id: 3, label: "10평 ~" },
        { id: 4, label: "~ 6.7억" },
        { id: 5, label: "5층 ~ 20층" },
        { id: 6, label: "2002년 ~" },
      ],
      properties: [
        {
          id: 1,
          name: "현대뜨레비앙",
          dealType: "전세",
          price: "5억 5천",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-sample.jpg",
          subImages: [
            "/images/property-sample.jpg",
            "/images/property-sample.jpg",
            "/images/property-sample.jpg",
            "/images/property-sample.jpg",
          ],
          totalImages: 24,
          buildYear: "2003",
          isLiked: false,
        },
        {
          id: 2,
          name: "현대뜨레비앙",
          dealType: "전세",
          price: "5억 5천",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-sample.jpg",
          subImages: [],
          totalImages: 0,
          buildYear: "2003",
          isLiked: false,
        },
        {
          id: 3,
          name: "현대뜨레비앙",
          dealType: "전세",
          price: "5억 5천",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-sample.jpg",
          subImages: [],
          totalImages: 0,
          buildYear: "2003",
          isLiked: false,
        },
        {
          id: 4,
          name: "현대뜨레비앙",
          dealType: "전세",
          price: "5억 5천",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-sample.jpg",
          subImages: [],
          totalImages: 0,
          buildYear: "2003",
          isLiked: false,
        },
        {
          id: 5,
          name: "현대뜨레비앙",
          dealType: "전세",
          price: "5억 5천",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-sample.jpg",
          subImages: [],
          totalImages: 0,
          buildYear: "2003",
          isLiked: false,
        },
        {
          id: 6,
          name: "현대뜨레비앙",
          dealType: "전세",
          price: "5억 5천",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-sample.jpg",
          subImages: [],
          totalImages: 0,
          buildYear: "2003",
          isLiked: false,
        },
        {
          id: 7,
          name: "현대뜨레비앙",
          dealType: "전세",
          price: "5억 5천",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-sample.jpg",
          subImages: [],
          totalImages: 0,
          buildYear: "2003",
          isLiked: false,
        },
        {
          id: 8,
          name: "현대뜨레비앙",
          dealType: "전세",
          price: "5억 5천",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-sample.jpg",
          subImages: [],
          totalImages: 0,
          buildYear: "2003",
          isLiked: false,
        },
      ],
    };
  },
  methods: {
    onLoadKakaoMap(map) {
      this.mapRef = map;
      map.setDraggable(true);
      map.setZoomable(true);
    },
    selectProperty(property) {
      this.selectedProperty = property;
    },
    closeDetailPanel() {
      this.selectedProperty = null;
    },
    toggleLike() {
      if (this.selectedProperty) {
        this.selectedProperty.isLiked = !this.selectedProperty.isLiked;
      }
    },
  },
};
</script>

<style scoped>
.search-map-page {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 왼쪽 검색 결과 사이드바 */
.search-results-sidebar {
  position: absolute;
  left: 0;
  top: 0;
  width: 270px;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  z-index: 100;
  border-right: 1px solid rgba(163, 151, 143, 0.22);
  overflow: hidden;
}

.filter-tags-section {
  flex: 0 0 auto;
  width: 100%;
  min-height: 71px;
  padding: 10px 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid var(--tothezip-brown-01);
}

.results-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.results-list::after {
  content: "";
  display: block;
  height: 32px;
}
</style>
