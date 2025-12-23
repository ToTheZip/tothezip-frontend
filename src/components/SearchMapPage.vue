<template>
  <div class="search-map-page">
    <div class="map-container">
      <KakaoMap
        width="100%"
        height="100%"
        :lat="center.lat"
        :lng="center.lng"
        :level="level"
        :draggable="true"
        :scrollwheel="true"
        :zoomable="true"
        @onLoadKakaoMap="onLoadKakaoMap"
      >
        <!-- 유효한 좌표가 있는 매물만 마커로 표시 -->
        <KakaoMapMarker
          v-for="prop in validProperties"
          :key="prop.id"
          :lat="prop.latitude"
          :lng="prop.longitude"
          :image="markerImageConfig"
          :clickable="true"
          @onClickKakaoMapMarker="selectProperty(prop)"
        />
      </KakaoMap>
    </div>

    <!-- 왼쪽 검색 결과 사이드바 -->
    <div class="search-results-sidebar">
      <div class="filter-tags-section">
        <FilterTag v-if="ui.searchMode === 'FAVORITE'" label="❤️ 찜한 매물" />
        <FilterTag
          v-else
          v-for="tag in filterTags"
          :key="tag.id"
          :label="tag.label"
        />
      </div>

      <div class="results-list">
        <!-- 목록이 없을 경우 안내 메시지 -->
        <div v-if="properties.length === 0 && !loading" class="no-results">
          검색 결과가 없습니다.
        </div>

        <PropertyCard
          v-else
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
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";

import { KakaoMap, KakaoMapMarker } from "vue3-kakao-maps";
import FilterTag from "@/components/search/FilterTag.vue";
import PropertyCard from "@/components/search/PropertyCard.vue";
import PropertyDetailPanel from "@/components/search/PropertyDetailPanel.vue";
import ReviewListPanel from "@/components/search/ReviewListPanel.vue";

import loginDozip from "@/assets/images/login_dozip.png";

const API_BASE = import.meta.env.VITE_API_BASE;

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

      // 커스텀 마커 이미지 설정
      markerImageConfig: {
        imageSrc: loginDozip,
        imageWidth: 100,
        imageHeight: 100,
        imageOption: {}, // 기본값 사용
      },
    };
  },
  computed: {
    ui() {
      return useUIStore();
    },
    // 좌표가 유효한 매물만 필터링 (마커 렌더링용)
    validProperties() {
      return this.properties.filter(
        (p) =>
          p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
      );
    },
  },
  mounted() {
    this.applyModeFromRoute();
  },
  watch: {
    "$route.query.mode"() {
      this.applyModeFromRoute();
    },
    "$route.query.open"() {
      // open만 바뀌어도 상세 오픈 재시도
      if (this.$route.query.mode === "reco") {
        this.openByQuery();
      }
    },
  },

  methods: {
    applyModeFromRoute() {
      const mode = this.$route.query.mode;

      if (mode === "favorite") {
        this.ui.setSearchMode("FAVORITE");
        this.fetchFavoriteProperties();
        return;
      }

      if (mode === "reco") {
        this.ui.setSearchMode("RECO");
        this.fetchRecoProperties(); // ✅ 추천 목록 로드
        return;
      }

      // 기본 진입(= 홈 검색/일반 검색)
      this.ui.setSearchMode("SEARCH");
      this.fetchSearchResults();
    },

    async fetchRecoProperties() {
      this.loading = true;
      this.errorMessage = "";
      this.selectedProperty = null;

      try {
        const raw = sessionStorage.getItem("tothezip_reco");
        const reco = raw ? JSON.parse(raw) : null;

        if (
          !reco ||
          !Array.isArray(reco.aptSeqList) ||
          reco.aptSeqList.length === 0
        ) {
          this.properties = [];
          this.filterTags = [];
          this.errorMessage =
            "추천 매물 정보가 없습니다. 홈에서 다시 시도해주세요.";
          return;
        }

        // ✅ 상단 태그(사용자 관심/선호도 기반)
        // regionNames + facilityTags를 filterTags로 구성
        const tags = [];
        let id = 1;

        if (reco.regionNames) tags.push({ id: id++, label: reco.regionNames });
        (reco.facilityTags || []).forEach((t) =>
          tags.push({ id: id++, label: t })
        );

        // 원하면 첫 태그로 "사용자 관심" 같은 라벨도 추가 가능
        // tags.unshift({ id: id++, label: "사용자 관심 기반" });

        this.filterTags = tags;

        // ✅ 추천 aptSeqList -> 각각 상세 조회로 변환
        const responses = await Promise.all(
          reco.aptSeqList.map((aptSeq) =>
            axios.post(`${API_BASE}/property/search`, {
              aptSeq: String(aptSeq),
              limit: 1,
              offset: 0,
            })
          )
        );

        const buildings = responses
          .map((r) => (Array.isArray(r.data) ? r.data[0] : r.data))
          .filter(Boolean);

        this.properties = buildings.map((b) => {
          const allImages = Array.isArray(b.images)
            ? b.images.filter(Boolean)
            : [];
          const main = b.imageUrl || allImages[0] || "";

          return {
            id: b.aptSeq,
            aptSeq: b.aptSeq,
            name: b.aptName,
            address: b.roadAddress,
            rating: b.propertyRating,
            tags: b.tags || [],
            buildYear: b.buildYear,
            isLiked: false,
            image: main,
            images: allImages.length ? allImages : main ? [main] : [],
            minDealType: b.minDealType || "",
            minPrice: b.minPrice ?? null,
            minDeposit: b.minDeposit ?? null,
            latitude: Number(b.latitude),
            longitude: Number(b.longitude),
          };
        });

        // ✅ open 파라미터 있으면 상세 자동 오픈
        this.openByQuery();

        // ✅ 지도 센터도 open 매물 기준으로 맞추기(없으면 첫 매물)
        const openSeq = this.$route.query.open;
        const target =
          (openSeq &&
            this.properties.find(
              (p) => String(p.aptSeq) === String(openSeq)
            )) ||
          this.properties[0];

        if (target?.latitude && target?.longitude) {
          this.center = { lat: target.latitude, lng: target.longitude };
        }
      } catch (e) {
        console.error(e);
        this.errorMessage = "추천 매물을 불러오지 못했습니다.";
      } finally {
        this.loading = false;
      }
    },

    openByQuery() {
      const openSeq = this.$route.query.open;
      if (!openSeq) return;

      const found = this.properties.find(
        (p) => String(p.aptSeq) === String(openSeq)
      );
      if (found) {
        this.selectProperty(found); // ✅ 기존 상세 오픈 로직 재사용
      }
    },
    async fetchFavoriteProperties() {
      this.loading = true;
      this.errorMessage = "";
      this.selectedProperty = null;

      try {
        const auth = useAuthStore();

        console.log("[FAV] accessToken exists?", !!auth.accessToken);
        console.log(
          "[FAV] accessToken head:",
          auth.accessToken?.slice?.(0, 20)
        );

        if (!auth.accessToken) {
          alert("로그인이 필요합니다.");
          this.$router.push("/login");
          return;
        }

        // 1) 찜한 aptSeq 목록 가져오기 (백엔드: /favorite/aptseq)
        console.log("[FAV] call GET /favorite/aptseq?type=매물");

        const favRes = await axios.get(`${API_BASE}/favorite/aptseq`, {
          params: { type: "매물" },
          withCredentials: true,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });

        const aptSeqs = favRes.data;

        console.log("[FAV] GET /favorite/aptseq status:", favRes.status);
        console.log("[FAV] aptSeqs raw:", aptSeqs);

        if (!Array.isArray(aptSeqs) || aptSeqs.length === 0) {
          console.warn("[FAV] aptSeqs empty -> no favorites or type mismatch");
          this.properties = [];
          return;
        }

        // 2) aptSeq로 매물 상세(검색) 가져오기
        console.log("[FAV] fetching properties count:", aptSeqs.length);

        const responses = await Promise.all(
          aptSeqs.map((aptSeq) => {
            console.log("[FAV] POST /property/search aptSeq:", aptSeq);
            return axios.post(
              `${API_BASE}/property/search`,
              { aptSeq: String(aptSeq), limit: 1, offset: 0 },
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${auth.accessToken}` },
              }
            );
          })
        );

        console.log(
          "[FAV] search responses length:",
          responses.length,
          "first data:",
          responses[0]?.data
        );

        const buildings = responses
          .map((r, idx) => {
            const d = r.data;
            const one = Array.isArray(d) ? d[0] : d;
            console.log(`[FAV] building[${idx}] parsed:`, one);
            return one;
          })
          .filter(Boolean);

        console.log("[FAV] buildings filtered length:", buildings.length);

        // 3) 최종 매핑
        this.properties = buildings.map((b) => {
          const allImages = Array.isArray(b.images)
            ? b.images.filter(Boolean)
            : [];
          const main = b.imageUrl || allImages[0] || "";
          const subs = allImages.length
            ? allImages.filter((x) => x !== main)
            : [];

          return {
            id: b.aptSeq,
            aptSeq: b.aptSeq,
            name: b.aptName,
            address: b.roadAddress,
            rating: b.propertyRating,
            tags: b.tags || [],
            buildYear: b.buildYear,
            isLiked: true,
            image: main,
            images: allImages.length ? allImages : main ? [main] : [],
            subImages: subs.slice(0, 4),
            totalImages: allImages.length ? allImages.length : main ? 1 : 0,
            minDealType: b.minDealType || "",
            minPrice: b.minPrice ?? null,
            minDeposit: b.minDeposit ?? null,
            latitude: Number(b.latitude),
            longitude: Number(b.longitude),
          };
        });

        console.log("[FAV] final properties length:", this.properties.length);
        console.log("[FAV] final properties sample:", this.properties[0]);

        const first = this.properties[0];
        if (first?.latitude && first?.longitude) {
          this.center = { lat: first.latitude, lng: first.longitude };
        }
      } catch (e) {
        console.error("[FAV] error:", e);
        console.log(
          "[FAV] error response:",
          e?.response?.status,
          e?.response?.data
        );
        this.errorMessage = "찜한 매물을 불러오지 못했습니다.";
      } finally {
        this.loading = false;
      }
    },
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

        const { data } = await axios.post(`${API_BASE}/property/search`, req);

        this.properties = (data || []).map((b) => {
          const allImages = Array.isArray(b.images)
            ? b.images.filter(Boolean)
            : [];
          const main = b.imageUrl || allImages[0] || "";
          const subs =
            allImages.length > 0 ? allImages.filter((x) => x !== main) : [];

          return {
            id: b.aptSeq,
            aptSeq: b.aptSeq,
            name: b.aptName,
            address: b.roadAddress,
            rating: b.propertyRating,
            tags: b.tags || [],
            buildYear: b.buildYear,
            isLiked: false,
            image: main,
            images: allImages.length ? allImages : main ? [main] : [],
            subImages: subs.slice(0, 4),
            totalImages: allImages.length ? allImages.length : main ? 1 : 0,
            minDealType: b.minDealType || "",
            minPrice: b.minPrice ?? null,
            minDeposit: b.minDeposit ?? null,
            latitude: Number(b.latitude),
            longitude: Number(b.longitude),
          };
        });

        // 검색 결과가 있고 첫 번째 매물의 좌표가 유효하면 지도 중심 이동
        if (this.properties.length > 0) {
          const first = this.properties[0];
          if (first.latitude && first.longitude) {
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
        // 마커 클릭 시 줌 레벨 조정 (선택 사항)
        // this.level = 3;
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
  height: 100vh; /* 화면 전체 높이 사용 */
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

.no-results {
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 14px;
}
</style>
