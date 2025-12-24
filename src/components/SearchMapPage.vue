<template>
  <div class="search-map-page">
    <!-- ================== MAP ================== -->
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
      >
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

    <!-- ================== SIDEBAR ================== -->
    <SearchSidebar
      ref="sidebarRef"
      :entry-mode="entryMode"
      :tab-mode="tabMode"
      :filter-tags="filterTags"
      :properties="properties"
      :selected-apt-seq="selectedAptSeq"
      :loading="loading"
      :error-message="errorMessage"
      @change-mode="setTabMode"
      @select-property="selectProperty"
    />

    <!-- ================== PANELS ================== -->
    <PropertyDetailPanel
      v-if="selectedProperty && !showReviewPanel"
      :property="selectedProperty"
      @close="closeDetailPanel"
      @favorite-empty="removeFavoriteBuilding"
      @open-reviews="openReviewsPanel"
    />
    <!-- <PropertyDetailPanel
      v-if="selectedProperty && !showReviewPanel"
      :property="selectedProperty"
      @close="closeDetailPanel"
      @toggle-like="toggleLike"
      @open-reviews="openReviewsPanel"
    /> -->

    <ReviewListPanel
      v-if="reviewTarget && showReviewPanel"
      :apt-seq="reviewTarget.aptSeq"
      :building-name="reviewTarget.name"
      @close="closeReviewsPanel"
    />
  </div>
</template>

<script>
import axios from "axios";
import { KakaoMap, KakaoMapMarker } from "vue3-kakao-maps";

import SearchSidebar from "@/components/search/SearchSidebar.vue";
import PropertyDetailPanel from "@/components/search/PropertyDetailPanel.vue";
import ReviewListPanel from "@/components/search/ReviewListPanel.vue";
import loginDozip from "@/assets/images/login_dozip.png";
import { useAuthStore } from "@/stores/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "SearchMapPage",
  components: {
    KakaoMap,
    KakaoMapMarker,
    SearchSidebar,
    PropertyDetailPanel,
    ReviewListPanel,
  },
  data() {
    return {
      // map
      center: { lat: 37.572, lng: 126.991 },
      level: 4,
      mapRef: null,

      // ui state
      entryMode: "ALL", // ALL | RECO | FAVORITE
      tabMode: "ALL", // ALL | RECO | NONE
      selectedProperty: null,
      showReviewPanel: false,

      // data
      filterTags: [],
      properties: [],

      loading: false,
      errorMessage: "",

      showReviewPanel: false,
      reviewTarget: null,

      selectedAptSeq: null,

      markerImageConfig: {
        imageSrc: loginDozip,
        imageWidth: 100,
        imageHeight: 100,
        imageOption: {},
      },
    };
  },
  // mounted() {
  //   this.fetchSearchResults();
  // },
  computed: {
    toggleLocked() {
      return false;
    },
    validProperties() {
      return this.properties.filter(
        (p) =>
          p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
      );
    },
  },
  async mounted() {
    await this.initByRoute();
    // 헤더 검색 이벤트 리스너 추가
    window.addEventListener("header-search-triggered", this.handleHeaderSearch);
  },
  beforeUnmount() {
    // 이벤트 리스너 제거
    window.removeEventListener(
      "header-search-triggered",
      this.handleHeaderSearch
    );
  },
  watch: {
    "$route.query": {
      deep: true,
      handler() {
        this.initByRoute();
      },
    },
  },
  methods: {
    // ---------------------------
    // 헤더 검색 이벤트 핸들러
    // ---------------------------
    handleHeaderSearch() {
      console.log("헤더 검색 이벤트 감지됨");
      // 검색 모드로 전환하고 검색 결과 다시 가져오기
      this.entryMode = "ALL";
      this.tabMode = "ALL";
      this.selectedProperty = null;
      this.showReviewPanel = false;
      this.fetchSearchResults();
    },

    // ---------------------------
    // INIT (entry 결정)
    // ---------------------------
    removeFavoriteBuilding(aptSeq) {
      // 1️⃣ properties 리스트에서 제거
      this.properties = this.properties.filter(
        (p) => String(p.aptSeq) !== String(aptSeq)
      );

      // 2️⃣ 선택 중이던 건물이면 상세 패널 닫기
      if (String(this.selectedAptSeq) === String(aptSeq)) {
        this.selectedProperty = null;
        this.selectedAptSeq = null;
        this.showReviewPanel = false;
      }

      // 3️⃣ 리스트가 비었으면 메시지
      if (this.properties.length === 0) {
        this.errorMessage = "찜한 매물이 없습니다.";
      }

      // 4️⃣ 지도 중심 재조정
      this.moveCenterToFirst();
    },
    async initByRoute() {
      const mode = String(this.$route.query.mode || "all").toLowerCase();
      const open = this.$route.query.open
        ? String(this.$route.query.open)
        : null;

      this.selectedProperty = null;
      this.showReviewPanel = false;
      this.errorMessage = "";

      if (mode === "favorite") {
        this.entryMode = "FAVORITE";
        this.tabMode = "NONE";
        await this.fetchFavoriteProperties();
        return;
      }

      if (mode === "reco") {
        this.entryMode = "RECO";
        this.tabMode = "RECO";
        await this.fetchRecoProperties();
        this.openPropertyIfRequested(open);
        // this.ui.setSearchMode("RECO");
        return;
      }

      this.entryMode = "ALL";
      this.tabMode = "ALL";
      await this.fetchSearchResults();
      this.openPropertyIfRequested(open);
    },

    setTabMode(next) {
      if (next === "ALL") {
        this.entryMode = "ALL"; // 진입 상태도 전환
        this.tabMode = "ALL";
        this.selectedProperty = null;
        this.showReviewPanel = false;
        this.fetchSearchResults();
        return;
      }

      if (next === "RECO") {
        this.entryMode = "RECO";
        this.tabMode = "RECO";
        this.selectedProperty = null;
        this.showReviewPanel = false;
        this.fetchRecoProperties();
        return;
      }
    },

    openPropertyIfRequested(openAptSeq) {
      if (!openAptSeq) return;
      const found = this.properties.find(
        (p) => String(p.aptSeq) === String(openAptSeq)
      );
      if (found) this.selectProperty(found);
    },

    onLoadKakaoMap(map) {
      this.mapRef = map;
      map.setDraggable(true);
      map.setZoomable(true);
    },

    // ---------------------------
    // FAVORITE (찜)
    // ---------------------------
    async fetchFavoriteProperties() {
      this.loading = true;
      this.properties = [];
      this.filterTags = [];

      try {
        const auth = useAuthStore();
        if (!auth.accessToken) {
          alert("로그인이 필요합니다.");
          this.$router.push("/login");
          return;
        }

        /**
         * 여기서 "찜 목록"을 실제 매물 카드 리스트로 보여주려면
         * 1) 백엔드가 aptSeq 리스트를 주거나
         * 2) 아예 매물 요약 DTO 리스트를 주는 엔드포인트가 있어야 함.
         *
         * 아래는 "aptSeq 리스트"를 받는다고 가정한 호출:
         * GET /favorite/aptseq?type=매물
         */
        const { data: aptSeqs } = await axios.get(
          `${API_BASE}/favorite/aptseq`,
          {
            params: { type: "매물" },
            withCredentials: true,
            headers: { Authorization: `Bearer ${auth.accessToken}` },
          }
        );

        if (!Array.isArray(aptSeqs) || aptSeqs.length === 0) {
          this.properties = [];
          this.errorMessage = "찜한 매물이 없습니다.";
          return;
        }

        const responses = await Promise.all(
          aptSeqs.map((aptSeq) =>
            axios.post(
              `${API_BASE}/property/search`,
              { aptSeq: String(aptSeq), limit: 1, offset: 0 },
              { withCredentials: true }
            )
          )
        );

        const buildings = responses
          .map((r) => (Array.isArray(r.data) ? r.data[0] : r.data))
          .filter(Boolean);

        this.properties = buildings.map(this.mapBuildingToCard(true));

        this.moveCenterToFirst();
      } catch (e) {
        console.error(e);
        this.errorMessage = "찜한 매물을 불러오지 못했습니다.";
      } finally {
        this.loading = false;
      }
    },

    // ---------------------------
    // RECO (추천)
    // ---------------------------
    async fetchRecoProperties() {
      this.loading = true;
      this.properties = [];
      this.filterTags = [];

      try {
        const raw = sessionStorage.getItem("tothezip_reco");
        const reco = raw ? JSON.parse(raw) : null;

        if (!reco) {
          this.errorMessage =
            "추천 데이터가 없습니다. 홈에서 다시 시도해주세요.";
          return;
        }

        // 태그 구성: 관심/선호 기반 (지역 + 시설 + 평수 + 층수)
        this.filterTags = this.makeRecoTags(reco);

        // 추천 매물 리스트 구성 (가능하면 payload에 properties를 통째로 넣는 게 제일 좋음)
        if (Array.isArray(reco.properties) && reco.properties.length > 0) {
          // 홈에서 이미 DTO를 내려받은 상태면 그대로 사용
          this.properties = reco.properties.map((p) => ({
            id: p.aptSeq ?? p.id,
            aptSeq: p.aptSeq ?? p.id,
            name: p.aptName ?? p.name,
            address: p.roadAddress ?? p.address,
            rating: p.propertyRating ?? p.rating,
            tags: p.tags || [],
            buildYear: p.buildYear,
            isLiked: true,
            image: p.imageUrl || p.image || "",
            images: p.images || [],
            minDealType: p.minDealType || "",
            minPrice: p.minPrice ?? null,
            minDeposit: p.minDeposit ?? null,
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
          }));
        } else {
          // aptSeqList로 다시 조회
          const aptSeqList = Array.isArray(reco.aptSeqList)
            ? reco.aptSeqList
            : [];
          if (aptSeqList.length === 0) {
            this.errorMessage = "추천 매물 목록이 비어있습니다.";
            return;
          }

          const responses = await Promise.all(
            aptSeqList.map((aptSeq) =>
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

          this.properties = buildings.map(this.mapBuildingToCard(true));
        }

        this.moveCenterToFirst();
      } catch (e) {
        console.error(e);
        this.errorMessage = "추천 매물을 불러오지 못했습니다.";
      } finally {
        this.loading = false;
      }
    },

    makeRecoTags(reco) {
      const tags = [];
      let id = 1;

      // 관심 지역
      if (reco.regionName) tags.push({ id: id++, label: reco.regionName });

      // 주변 시설 태그
      (reco.facilityTags || []).forEach((t) =>
        tags.push({ id: id++, label: t })
      );

      // 희망 평수/층수
      const pref = reco.preferences || {};
      if (pref.minArea != null || pref.maxArea != null) {
        tags.push({
          id: id++,
          label: `희망 ${pref.minArea ?? 0}~${pref.maxArea ?? "∞"}평`,
        });
      }
      if (pref.minFloor != null || pref.maxFloor != null) {
        tags.push({
          id: id++,
          label: `희망 ${pref.minFloor ?? 1}~${pref.maxFloor ?? "∞"}층`,
        });
      }

      return tags;
    },

    // ---------------------------
    // ALL (전체 검색)
    // ---------------------------
    async fetchSearchResults() {
      this.loading = true;
      this.properties = [];
      this.filterTags = [];

      try {
        // 기존 너 로직: sessionStorage에 있는 검색조건 사용
        const raw = sessionStorage.getItem("tothezip_search");
        const searchData = raw ? JSON.parse(raw) : null;

        if (!searchData) {
          this.errorMessage =
            "검색 조건이 없습니다. 홈에서 검색 후 이동해주세요.";
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

        this.moveCenterToFirst();
      } catch (e) {
        console.error(e);
        this.errorMessage = "검색 중 오류가 발생했습니다.";
      } finally {
        this.loading = false;
      }
    },

    // ---------------------------
    // shared helpers
    // ---------------------------
    moveCenterToFirst() {
      if (this.properties.length > 0) {
        const first = this.properties[0];
        if (first?.latitude && first?.longitude) {
          this.center = { lat: first.latitude, lng: first.longitude };
        }
      }
    },

    mapBuildingToCard(isLikedDefault) {
      return (b) => {
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
          isLiked: !!isLikedDefault,
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
      };
    },

    // ---------------------------
    // existing tag builders
    // ---------------------------
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

    openReviewsPanel(payload) {
      // payload: { aptSeq, name }
      this.reviewTarget = payload;
      this.showReviewPanel = true;
    },

    closeReviewsPanel() {
      this.showReviewPanel = false;
      this.reviewTarget = null;
    },
    closeDetailPanel() {
      this.selectedProperty = null;
      this.showReviewPanel = false;
    },
    selectProperty(property, { fromMap = false } = {}) {
      this.selectedProperty = property;
      this.selectedAptSeq = property?.aptSeq ?? null;
      this.showReviewPanel = false;

      if (property?.latitude && property?.longitude) {
        this.center = { lat: property.latitude, lng: property.longitude };
      }

      // 사이드바의 scrollToCard 호출
      if (this.$refs.sidebarRef && this.selectedAptSeq) {
        this.$refs.sidebarRef.scrollToCard(this.selectedAptSeq);
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
  inset: 0;
}
</style>
