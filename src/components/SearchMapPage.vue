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
      v-if="selectedProperty && !showReviewPanel"
      :property="selectedProperty"
      @close="closeDetailPanel"
      @toggle-like="toggleLike"
      @open-reviews="openReviewsPanel"
    />

    <!-- 전체 리뷰 패널 -->
    <ReviewListPanel
      v-if="selectedProperty && showReviewPanel"
      :apt-seq="selectedProperty.aptSeq"
      :building-name="selectedProperty.name"
      @close="closeReviewsPanel"
    />
  </div>
</template>

<script>
import axios from "axios";
import { KakaoMap, KakaoMapMarker } from "vue3-kakao-maps";
import FilterTag from "@/components/search/FilterTag.vue";
import PropertyCard from "@/components/search/PropertyCard.vue";
import PropertyDetailPanel from "@/components/search/PropertyDetailPanel.vue";
import ReviewListPanel from "@/components/search/ReviewListPanel.vue";

export default {
  name: "SearchMapPage",
  components: {
    KakaoMap,
    KakaoMapMarker,
    FilterTag,
    PropertyCard,
    PropertyDetailPanel,
    ReviewListPanel,
  },
  data() {
    return {
      center: { lat: 37.572, lng: 126.991 },
      level: 4,
      mapRef: null,

      selectedProperty: null,

      filterTags: [],
      properties: [],

      loading: false,
      errorMessage: "",
      showReviewPanel: false,
    };
  },
  mounted() {
    this.fetchSearchResults();
  },
  methods: {
    onLoadKakaoMap(map) {
      this.mapRef = map;
      map.setDraggable(true);
      map.setZoomable(true);
    },

    async fetchSearchResults() {
      this.loading = true;
      this.errorMessage = "";
      this.selectedProperty = null;

      try {
        const raw = sessionStorage.getItem("tothezip_search");
        const searchData = raw ? JSON.parse(raw) : null;

        if (!searchData) {
          this.properties = [];
          this.filterTags = [];
          this.errorMessage =
            "검색 조건이 없습니다. 검색바에서 다시 검색해주세요.";
          return;
        }

        this.filterTags = this.makeFilterTags(searchData);
        const req = this.makeRequestBody(searchData);

        const { data } = await axios.post("/property/search", req);

        this.properties = (data || []).map((b) => {
          const allImages = Array.isArray(b.images)
            ? b.images.filter(Boolean)
            : [];
          const main = b.imageUrl || allImages[0] || "";
          const subs =
            allImages.length > 0 ? allImages.filter((x) => x !== main) : [];

          return {
            // 공통
            id: b.aptSeq,
            aptSeq: b.aptSeq,

            name: b.aptName,
            address: b.roadAddress,
            rating: b.propertyRating,
            tags: b.tags || [],
            buildYear: b.buildYear,
            isLiked: false,

            // 카드용 대표 이미지
            image: main,

            images: allImages.length ? allImages : main ? [main] : [],

            subImages: subs.slice(0, 4),
            totalImages: allImages.length ? allImages.length : main ? 1 : 0,

            minDealType: b.minDealType || "",
            minPrice: b.minPrice ?? null,
            minDeposit: b.minDeposit ?? null,

            // 지도 이동용
            latitude: b.latitude,
            longitude: b.longitude,
          };
        });

        if (this.properties.length > 0) {
          const first = this.properties[0];
          if (first?.latitude && first?.longitude) {
            this.center = { lat: first.latitude, lng: first.longitude };
          }
        }
      } catch (e) {
        console.error(e);
        this.errorMessage = "검색 중 오류가 발생했습니다.";
      } finally {
        this.loading = false;
      }
    },

    makeRequestBody(searchData) {
      const opt = searchData.options || {};
      const prop = searchData.property || null;

      return {
        sido: searchData.sido || "",
        gugun: searchData.gugun || "",
        dong: searchData.dong || "",

        // 아파트 선택했으면 aptSeq로 정확하게 검색
        aptSeq: prop?.aptSeq || "",
        aptName: prop?.aptName || "",

        nearSubway: !!opt.nearSubway,
        nearSchool: !!opt.nearSchool,
        nearHospital: !!opt.nearHospital,
        nearCulture: !!opt.nearCulture,
        dealType: opt.dealType || [],

        depositMin: opt.depositMin,
        depositMax: opt.depositMax,
        monthlyRentMin: opt.monthlyRentMin,
        monthlyRentMax: opt.monthlyRentMax,
        jeonseMin: opt.jeonseMin,
        jeonseMax: opt.jeonseMax,
        buyMin: opt.buyMin,
        buyMax: opt.buyMax,

        areaMin: opt.areaMin,
        areaMax: opt.areaMax,
        floorMin: opt.floorMin,
        floorMax: opt.floorMax,
        buildYearMin: opt.buildYearMin,
        buildYearMax: opt.buildYearMax,
        ratingMin: opt.ratingMin,
        ratingMax: opt.ratingMax,

        limit: 50,
        offset: 0,
      };
    },

    makeFilterTags(searchData) {
      const opt = searchData.options || {};
      const tags = [];
      let id = 1;

      if (searchData.location)
        tags.push({ id: id++, label: searchData.location });

      if (opt.nearSubway) tags.push({ id: id++, label: "역세권" });
      if (opt.nearSchool) tags.push({ id: id++, label: "학세권" });
      if (opt.nearHospital) tags.push({ id: id++, label: "병세권" });
      if (opt.nearCulture) tags.push({ id: id++, label: "문세권" });

      (opt.dealType || []).forEach((d) => tags.push({ id: id++, label: d }));

      if (opt.areaMin != null || opt.areaMax != null)
        tags.push({
          id: id++,
          label: `${opt.areaMin ?? 0}평~${opt.areaMax ?? "∞"}평`,
        });

      if (opt.floorMin != null || opt.floorMax != null)
        tags.push({
          id: id++,
          label: `${opt.floorMin ?? 0}층~${opt.floorMax ?? "∞"}층`,
        });

      if (opt.buildYearMin != null || opt.buildYearMax != null)
        tags.push({
          id: id++,
          label: `${opt.buildYearMin ?? 0}년~${opt.buildYearMax ?? "현재"}년`,
        });

      // 선택된 아파트 표시(선택형)
      if (searchData.property?.aptName)
        tags.push({ id: id++, label: searchData.property.aptName });

      return tags;
    },

    openReviewsPanel() {
      this.showReviewPanel = true;
    },
    closeReviewsPanel() {
      this.showReviewPanel = false;
    },

    closeDetailPanel() {
      this.selectedProperty = null;
      this.showReviewPanel = false; // 같이 초기화
    },

    selectProperty(property) {
      this.selectedProperty = property;
      this.showReviewPanel = false; // 새 건물 선택 시 상세부터

      if (property?.latitude && property?.longitude) {
        this.center = { lat: property.latitude, lng: property.longitude };
      }
    },

    toggleLike() {
      if (this.selectedProperty)
        this.selectedProperty.isLiked = !this.selectedProperty.isLiked;
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
