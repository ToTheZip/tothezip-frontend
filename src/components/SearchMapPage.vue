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
        <!-- 클러스터 마커 -->
        <KakaoMapCustomOverlay
          v-for="c in clusterMarkers"
          :key="c.key"
          :lat="c.lat"
          :lng="c.lng"
          :yAnchor="1"
          :zIndex="hoveredKey === c.key ? 1000 : 1"
        >
          <div
            class="marker-container"
            @mouseenter="hoveredKey = c.key"
            @mouseleave="hoveredKey = null"
            @click.stop="
              c.items.length > 1
                ? zoomIntoCluster(c)
                : selectProperty(c.items[0], { fromMap: true })
            "
          >
            <!-- 툴팁 -->
            <div class="marker-tooltip">
              <div class="tooltip-content">
                <div class="tooltip-name">{{ getMarkerName(c) }}</div>
                <div class="tooltip-info">
                  <span v-if="getMarkerRating(c)" class="tooltip-rating">
                    ⭐ {{ getMarkerRating(c) }}
                  </span>
                  <span
                    v-if="getMarkerRating(c) && getMarkerPrice(c)"
                    class="tooltip-divider"
                    >·</span
                  >
                  <span v-if="getMarkerPrice(c)" class="tooltip-price">
                    {{ getMarkerPrice(c) }}
                  </span>
                </div>
              </div>
              <div class="tooltip-arrow"></div>
            </div>

            <!-- 마커 -->
            <div class="count-marker" :class="{ cluster: c.items.length > 1 }">
              <span class="marker-count">{{ c.count }}</span>
              <div class="marker-glow"></div>
            </div>
          </div>
        </KakaoMapCustomOverlay>

        <!-- 개별 마커 (클러스터 모드가 아닐 때) -->
        <KakaoMapCustomOverlay
          v-for="m in !isClusterMode ? markerBuildings : []"
          :key="m.aptSeq"
          :lat="m.latitude"
          :lng="m.longitude"
          :yAnchor="1"
          :zIndex="hoveredKey === m.aptSeq ? 10000 : 1"
        >
          <div
            class="marker-container"
            @mouseenter="hoveredKey = m.aptSeq"
            @mouseleave="hoveredKey = null"
            @click.stop="selectProperty(m, { fromMap: true })"
          >
            <!-- 툴팁 -->
            <div class="marker-tooltip">
              <div class="tooltip-content">
                <div class="tooltip-name">{{ m.name }}</div>
                <div class="tooltip-info">
                  <span v-if="m.rating" class="tooltip-rating">
                    ⭐ {{ m.rating }}
                  </span>
                  <span
                    v-if="m.rating && getMarkerPrice(m)"
                    class="tooltip-divider"
                    >·</span
                  >
                  <span v-if="getMarkerPrice(m)" class="tooltip-price">
                    {{ getMarkerPrice(m) }}
                  </span>
                </div>
              </div>
              <div class="tooltip-arrow"></div>
            </div>

            <!-- 마커 -->
            <div class="count-marker">
              <span class="marker-count">{{ m.count }}</span>
              <div class="marker-glow"></div>
            </div>
          </div>
        </KakaoMapCustomOverlay>
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
      @go-map="handleGoMap"
      @remove-tag="handleRemoveTag"
    />

    <!-- ================== PANELS ================== -->
    <PropertyDetailPanel
      v-if="selectedProperty && !showReviewPanel"
      :property="selectedProperty"
      :open-contract-immediate="shouldOpenContract"
      @close="closeDetailPanel"
      @favorite-empty="removeFavoriteBuilding"
      @open-reviews="openReviewsPanel"
      @contract-panel-closed="shouldOpenContract = false"
      @select-listing="openListingCompare"
      @listing-hover="handleListingHover"
    />

    <!-- <PropertyDetailPanel
      v-if="selectedProperty && !showReviewPanel"
      :property="selectedProperty"
      @close="closeDetailPanel"
      @toggle-like="toggleLike"
      @open-reviews="openReviewsPanel"
    /> -->
    <ListingComparePanel
      v-if="
        selectedProperty && !showReviewPanel && panelMode === 'LISTING_COMPARE'
      "
      :base-property="selectedProperty"
      :listing="selectedListing"
      :compare-result="compareResult"
      :loading="compareLoading"
      :error="compareError"
      @back="backToBuildingPanel"
      @select-property="selectComparedProperty"
    />

    <ReviewListPanel
      v-if="reviewTarget && showReviewPanel"
      :apt-seq="reviewTarget.aptSeq"
      :building-name="reviewTarget.name"
      @close="closeReviewsPanel"
      @open-contract-panel="handleOpenContractPanel"
    />

    <CursorTooltip :show="tooltip.show" :x="tooltip.x" :y="tooltip.y" />
  </div>
</template>

<script>
import axios from "axios";
import {
  KakaoMap,
  KakaoMapMarker,
  KakaoMapCustomOverlay,
} from "vue3-kakao-maps";

import SearchSidebar from "@/components/search/SearchSidebar.vue";
import PropertyDetailPanel from "@/components/search/PropertyDetailPanel.vue";
import ReviewListPanel from "@/components/search/ReviewListPanel.vue";
import loginDozip from "@/assets/images/login_dozip.png";
import { useAuthStore } from "@/stores/auth";
import CursorTooltip from "@/components/common/CursorTooltip.vue";
import ListingComparePanel from "@/components/search/ListingComparePanel.vue";

const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "SearchMapPage",
  components: {
    KakaoMap,
    KakaoMapCustomOverlay,
    SearchSidebar,
    PropertyDetailPanel,
    ReviewListPanel,
    CursorTooltip,
    ListingComparePanel,
  },
  data() {
    return {
      center: { lat: 37.572, lng: 126.991 },
      level: 4,
      mapRef: null,

      clusterMarkers: [],
      clusterThresholdLevel: 6,

      entryMode: "ALL",
      tabMode: "ALL",
      selectedProperty: null,
      showReviewPanel: false,

      filterTags: [],
      properties: [],  // 목록 기반 매물 (검색/추천/찜)
      viewportProperties: [],  // viewport 기반 추가 매물
      isLoadingViewport: false,
      lastBounds: null,  // 중복 요청 방지
      listingCountMap: {},

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
      hoveredKey: null,
      shouldOpenContract: false,
      panelMode: "BUILDING", // BUILDING | LISTING_COMPARE
      selectedListing: null,
      compareResult: null,
      compareLoading: false,
      compareError: "",
      tooltip: { show: false, x: 0, y: 0, text: "클릭하여 비교 매물 보기" },
    };
  },
  computed: {
    isClusterMode() {
      return this.level >= 6;
    },

    visibleBuildings() {
      return this.isClusterMode ? [] : this.markerBuildings;
    },
    toggleLocked() {
      return false;
    },
    allMarkerProperties() {
      // properties + viewportProperties 합치기 (중복 제거)
      const map = new Map();
      [...this.properties, ...this.viewportProperties].forEach(p => {
        const aptSeq = String(p.aptSeq ?? p.id);
        if (!map.has(aptSeq)) {
          map.set(aptSeq, p);
        }
      });
      return Array.from(map.values()).filter(p => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        return Number.isFinite(lat) && Number.isFinite(lng);
      });
    },
    markerBuildings() {
      const map = new Map();

      for (const p of this.allMarkerProperties) {
        const aptSeq = String(p.aptSeq ?? p.id);

        if (map.has(aptSeq)) continue;
        map.set(aptSeq, {
          ...p,
          aptSeq,
          count: this.listingCountMap[aptSeq] ?? 1,
        });
      }

      return Array.from(map.values());
    },
  },
  async mounted() {
    await this.initByRoute();
    window.addEventListener("header-search-triggered", this.handleHeaderSearch);
  },
  beforeUnmount() {
    window.removeEventListener(
      "header-search-triggered",
      this.handleHeaderSearch
    );
  },
  watch: {
    markerBuildings: {
      deep: true,
      handler() {
        this.$nextTick(() => this.rebuildClusters());
      },
    },
    "$route.query": {
      deep: true,
      handler() {
        this.initByRoute();
      },
    },
  },
  methods: {
    handleOpenContractPanel() {
      // 리뷰 패널 닫고 -> 상세 패널 열기 -> 상세 패널 내부에서 인증창 열기
      this.showReviewPanel = false;
      this.shouldOpenContract = true;
    },

    async handleRemoveTag(tag) {
      console.log("Remove tag:", tag);

      // 1) 추천(RECO) 모드: 태그만 화면에서 제거 (데이터 필터링은 복잡하므로 스킵 or 클라이언트 필터링)
      if (this.entryMode === "RECO") {
        this.filterTags = this.filterTags.filter((t) => t.id !== tag.id);
        // 필요하다면 여기서 this.properties 필터링 추가 가능
        return;
      }

      // 2) 전체(ALL) 모드: 검색 조건 해제 후 재검색
      if (this.entryMode === "ALL") {
        const raw = sessionStorage.getItem("tothezip_search");
        if (!raw) return;

        const searchData = JSON.parse(raw);
        const opt = searchData.options || {};

        switch (tag.type) {
          case "LOCATION":
            // 지역 태그 삭제 -> 이건 검색의 핵심이라 삭제가 애매하지만, 요청대로라면 빈 값으로
             searchData.location = ""; 
             searchData.sido = "";
             searchData.gugun = "";
             searchData.dong = "";
            break;
          case "OPTION":
            // 역세권 등
            if (tag.value) opt[tag.value] = false;
            break;
          case "DEAL_TYPE":
            if (opt.dealType) {
              opt.dealType = opt.dealType.filter((d) => d !== tag.value);
            }
            break;
          case "AREA":
            opt.areaMin = null;
            opt.areaMax = null;
            break;
          case "FLOOR":
            opt.floorMin = null;
            opt.floorMax = null;
            break;
          case "BUILD_YEAR":
            opt.buildYearMin = null;
            opt.buildYearMax = null;
            break;
          case "APT_NAME":
            if (searchData.property) searchData.property.aptName = "";
            break;
        }

        // 저장 후 재검색
        searchData.options = opt;
        sessionStorage.setItem("tothezip_search", JSON.stringify(searchData));
        await this.fetchSearchResults();
      }
    },

    // 마커 툴팁 정보 생성
    getMarkerName(marker) {
      if (marker.items && marker.items.length > 1) {
        return `${marker.items.length}개 건물`;
      }
      const item = marker.items ? marker.items[0] : marker;
      return item.name || "알 수 없음";
    },

    getMarkerRating(marker) {
      if (marker.items && marker.items.length > 1) {
        // 클러스터: 평균 평점 계산
        const ratings = marker.items
          .map((m) => Number(m.rating))
          .filter((r) => r > 0);

        if (ratings.length === 0) return null;

        const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        return avg.toFixed(1);
      }

      const item = marker.items ? marker.items[0] : marker;
      const rating = Number(item.rating);
      return rating > 0 ? rating.toFixed(1) : null;
    },

    getMarkerPrice(marker) {
      if (marker.items && marker.items.length > 1) {
        // 클러스터: 범위 표시
        return "여러 매물";
      }

      const item = marker.items ? marker.items[0] : marker;
      const type = item.minDealType;
      const deposit = item.minDeposit;
      const price = item.minPrice;

      if (!type) return null;

      if (type === "월세") {
        if (deposit != null && price != null) {
          return `월세 ${deposit}/${price}`;
        }
      } else if (type === "전세") {
        if (price != null) {
          return `전세 ${price}억`;
        }
      } else if (type === "매매") {
        if (price != null) {
          return `매매 ${price}억`;
        }
      }

      return null;
    },

    handleGoMap(payload) {
      console.log("[SearchMapPage] go-map payload:", payload);

      const { aptSeq, lat, lng } = payload || {};
      const targetAptSeq = aptSeq ?? payload?.id;

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        this.center = { lat, lng };
      }

      if (targetAptSeq) {
        this.selectedAptSeq = targetAptSeq;

        const found = this.properties.find(
          (p) => String(p.aptSeq ?? p.id) === String(targetAptSeq)
        );
        if (found) this.selectProperty(found, { fromMap: false });
      }
    },

    handleHeaderSearch() {
      console.log("헤더 검색 이벤트 감지됨");
      this.entryMode = "ALL";
      this.tabMode = "ALL";
      this.selectedProperty = null;
      this.showReviewPanel = false;
      this.fetchSearchResults();
    },

    async hydrateMissingFields() {
      const missing = this.properties
        .filter((p) => {
          const noPrice =
            !p.minDealType || (p.minDeposit == null && p.minPrice == null);

          const noCoord =
            !Number.isFinite(Number(p.latitude)) ||
            !Number.isFinite(Number(p.longitude));

          return noPrice || noCoord;
        })
        .map((p) => String(p.aptSeq ?? p.id));

      if (missing.length === 0) return;

      const limit = 8;
      const fetchedMap = new Map();

      for (let i = 0; i < missing.length; i += limit) {
        const chunk = missing.slice(i, i + limit);

        const results = await Promise.allSettled(
          chunk.map(async (aptSeq) => {
            const { data } = await axios.post(`${API_BASE}/property/search`, {
              aptSeq,
              limit: 1,
              offset: 0,
            });
            const b = Array.isArray(data) ? data[0] : data;
            return { aptSeq, b };
          })
        );

        for (const r of results) {
          if (r.status === "fulfilled" && r.value?.b) {
            fetchedMap.set(String(r.value.aptSeq), r.value.b);
          }
        }
      }

      this.properties = this.properties.map((p) => {
        const key = String(p.aptSeq ?? p.id);
        const b = fetchedMap.get(key);
        if (!b) return p;

        return {
          ...p,
          latitude: Number(p.latitude) || Number(b.latitude),
          longitude: Number(p.longitude) || Number(b.longitude),
          minDealType: p.minDealType || b.minDealType || "",
          minDeposit: p.minDeposit ?? b.minDeposit ?? null,
          minPrice: p.minPrice ?? b.minPrice ?? null,
        };
      });
    },

    rebuildClusters() {
      if (!this.mapRef) return;

      const clusterMode = this.level >= 6;
      if (!clusterMode) {
        this.clusterMarkers = [];
        return;
      }

      const kakao = window.kakao;
      const bounds = this.mapRef.getBounds();
      const proj = this.mapRef.getProjection();

      const cellPx = 90;

      const buckets = new Map();

      for (const m of this.markerBuildings) {
        const lat = Number(m.latitude);
        const lng = Number(m.longitude);
        if (!lat || !lng) continue;

        const ll = new kakao.maps.LatLng(lat, lng);
        if (!bounds.contain(ll)) continue;

        const pt = proj.pointFromCoords(ll);
        const gx = Math.floor(pt.x / cellPx);
        const gy = Math.floor(pt.y / cellPx);
        const key = `${gx}_${gy}`;

        if (!buckets.has(key)) {
          buckets.set(key, {
            key,
            count: 0,
            sumLat: 0,
            sumLng: 0,
            items: [],
          });
        }

        const b = buckets.get(key);
        b.count += Number(m.count ?? 1);
        b.sumLat += lat;
        b.sumLng += lng;
        b.items.push(m);
      }

      this.clusterMarkers = Array.from(buckets.values()).map((b) => ({
        key: b.key,
        count: b.count,
        lat: b.sumLat / b.items.length,
        lng: b.sumLng / b.items.length,
        items: b.items,
      }));
    },

    getCellSizeByLevel(level) {
      if (level >= 9) return 0.02;
      if (level >= 8) return 0.012;
      if (level >= 7) return 0.008;
      if (level >= 6) return 0.005;
      return 0.003;
    },

    zoomIntoCluster(c) {
      if (!this.mapRef) return;
      const kakao = window.kakao;
      this.mapRef.setCenter(new kakao.maps.LatLng(c.lat, c.lng));
      this.mapRef.setLevel(Math.max(1, this.level - 2));
    },

    async fetchListingCounts() {
      const aptSeqs = Array.from(
        new Set(this.properties.map((p) => String(p.aptSeq ?? p.id)))
      );

      const limit = 8;
      const nextMap = { ...this.listingCountMap };

      for (let i = 0; i < aptSeqs.length; i += limit) {
        const chunk = aptSeqs.slice(i, i + limit);

        const results = await Promise.allSettled(
          chunk.map(async (aptSeq) => {
            const { data } = await axios.get(
              `${API_BASE}/property/${aptSeq}/listings`
            );
            return { aptSeq, count: Array.isArray(data) ? data.length : 0 };
          })
        );

        for (const r of results) {
          if (r.status === "fulfilled") {
            nextMap[r.value.aptSeq] = r.value.count;
          }
        }
      }

      this.listingCountMap = nextMap;
    },

    removeFavoriteBuilding(aptSeq) {
      // 찜 목록 모드일 때만 리스트에서 제거
      if (this.entryMode !== "FAVORITE") return;

      this.properties = this.properties.filter(
        (p) => String(p.aptSeq) !== String(aptSeq)
      );

      if (String(this.selectedAptSeq) === String(aptSeq)) {
        this.selectedProperty = null;
        this.selectedAptSeq = null;
        this.showReviewPanel = false;
      }

      if (this.properties.length === 0) {
        this.errorMessage = "찜한 매물이 없습니다.";
      }

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
        await this.fetchListingCounts();
        this.rebuildClusters();

        return;
      }

      if (mode === "reco") {
        this.entryMode = "RECO";
        this.tabMode = "RECO";
        await this.fetchRecoProperties();
        await this.fetchListingCounts();
        this.rebuildClusters();

        this.openPropertyIfRequested(open);
        return;
      }

      this.entryMode = "ALL";
      this.tabMode = "ALL";
      await this.fetchSearchResults();
      await this.fetchListingCounts();
      this.rebuildClusters();

      this.openPropertyIfRequested(open);
    },

    async setTabMode(next) {
      if (this.entryMode === "FAVORITE") {
        this.$router.replace({
          path: this.$route.path,
          query: {
            ...this.$route.query,
            mode: next === "RECO" ? "reco" : "all",
          },
        });
        return;
      }

      this.selectedProperty = null;
      this.showReviewPanel = false;

      if (next === "ALL") {
        this.entryMode = "ALL";
        this.tabMode = "ALL";
        await this.fetchSearchResults();
        await this.fetchListingCounts();
        this.$nextTick(() => this.rebuildClusters());
        return;
      }

      if (next === "RECO") {
        this.entryMode = "RECO";
        this.tabMode = "RECO";
        await this.fetchRecoProperties();
        await this.fetchListingCounts();
        this.$nextTick(() => this.rebuildClusters());
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

      window.kakao.maps.event.addListener(map, "zoom_changed", () => {
        this.level = map.getLevel();
        this.rebuildClusters();
      });
      window.kakao.maps.event.addListener(map, "dragend", () => {
        this.rebuildClusters();
      });
      window.kakao.maps.event.addListener(map, "idle", () => {
        this.rebuildClusters();
      });

      // viewport 기반 매물 로딩을 위한 debounced 이벤트
      const debouncedFetchViewport = this.debounce(() =>{
        this.fetchViewportProperties();
      }, 500);

      window.kakao.maps.event.addListener(map, "idle", debouncedFetchViewport);

      this.level = map.getLevel();
      this.rebuildClusters();
      
      // 초기 viewport 로드
      this.fetchViewportProperties();
    },

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

        const recoRegionName = (reco.regionName || "").trim();

        this.filterTags = this.makeRecoTags(reco);

        if (Array.isArray(reco.properties) && reco.properties.length > 0) {
          this.properties = reco.properties.map((p) => ({
            id: p.aptSeq ?? p.id,
            aptSeq: p.aptSeq ?? p.id,
            name: p.aptName ?? p.name,
            address: p.roadAddress ?? p.address,
            addressRaw: p.roadAddress ?? p.address,
            rating: p.propertyRating ?? p.rating,
            tags: p.tags || [],
            buildYear: p.buildYear,
            isLiked: true,
            image: p.imageUrl || p.image || "",
            images: p.images || [],
            regionName: (p.regionName || recoRegionName || "").trim(),
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
            minDealType: p.minDealType || "",
            minPrice: p.minPrice ?? null,
            minDeposit: p.minDeposit ?? null,
          }));
        } else {
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

          this.properties = buildings.map((b) => ({
            ...this.mapBuildingToCard(true)(b),
            regionName: recoRegionName,
            addressRaw: b.roadAddress,
          }));
        }

        this.moveCenterToFirst();
        await this.hydrateMissingFields();
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

      if (reco.regionName) tags.push({ id: id++, label: reco.regionName });

      (reco.facilityTags || []).forEach((t) =>
        tags.push({ id: id++, label: t })
      );

      const pref = reco.preferences || {};
      if (pref.minArea != null || pref.maxArea != null) {
        tags.push({
          id: id++,
          label: `${pref.minArea ?? 0}~${pref.maxArea ?? "∞"}평`,
        });
      }
      if (pref.minFloor != null || pref.maxFloor != null) {
        tags.push({
          id: id++,
          label: `${pref.minFloor ?? 1}~${pref.maxFloor ?? "∞"}층`,
        });
      }

      return tags;
    },

    async fetchSearchResults() {
      this.loading = true;
      this.properties = [];
      this.filterTags = [];

      try {
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
            addressRaw: b.roadAddress,
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

            jibun: b.jibun,
            roadNm: b.roadNm || b.road_nm,
            roadBun: b.roadBun || b.road_bun,

            sidoName: b.sidoName || b.sido_name || "",
            gugunName: b.gugunName || b.gugun_name || b.sggName || "",
            dongName: b.dongName || b.dong_name || b.umdName || "",
          };
        });
        await this.fetchListingCounts();

        this.moveCenterToFirst();
      } catch (e) {
        console.error(e);
        this.errorMessage = "검색 중 오류가 발생했습니다.";
      } finally {
        this.loading = false;
      }
    },

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

          jibun: b.jibun,
          roadNm: b.roadNm || b.road_nm,
          roadBun: b.roadBun || b.road_bun,

          sidoName: b.sidoName || b.sido_name || "",
          gugunName: b.gugunName || b.gugun_name || b.sggName || "",
          dongName: b.dongName || b.dong_name || b.umdName || "",
        };
      };
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
        tags.push({ id: id++, label: searchData.location, type: "LOCATION" });
      if (opt.nearSubway)
        tags.push({ id: id++, label: "역세권", type: "OPTION", value: "nearSubway" });
      if (opt.nearSchool)
        tags.push({ id: id++, label: "학세권", type: "OPTION", value: "nearSchool" });
      if (opt.nearHospital)
        tags.push({ id: id++, label: "병세권", type: "OPTION", value: "nearHospital" });
      if (opt.nearCulture)
        tags.push({ id: id++, label: "문세권", type: "OPTION", value: "nearCulture" });
      (opt.dealType || []).forEach((d) =>
        tags.push({ id: id++, label: d, type: "DEAL_TYPE", value: d })
      );

      if (opt.areaMin != null || opt.areaMax != null)
        tags.push({
          id: id++,
          label: `${opt.areaMin ?? 0}평~${opt.areaMax ?? "∞"}평`,
          type: "AREA",
        });
      if (opt.floorMin != null || opt.floorMax != null)
        tags.push({
          id: id++,
          label: `${opt.floorMin ?? 0}층~${opt.floorMax ?? "∞"}층`,
          type: "FLOOR",
        });
      if (opt.buildYearMin != null || opt.buildYearMax != null)
        tags.push({
          id: id++,
          label: `${opt.buildYearMin ?? 0}년~${opt.buildYearMax ?? "현재"}년`,
          type: "BUILD_YEAR",
        });
      if (searchData.property?.aptName)
        tags.push({
          id: id++,
          label: searchData.property.aptName,
          type: "APT_NAME",
        });

      return tags;
    },

    openReviewsPanel(payload) {
      this.reviewTarget = payload;
      this.showReviewPanel = true;
    },

    closeReviewsPanel() {
      this.showReviewPanel = false;
      this.reviewTarget = null;
    },
    handleListingHover(payload) {
      // payload: {show, x, y}
      // console.log("[listing-hover to page]", payload);
      this.tooltip = { ...this.tooltip, ...payload };
    },

    async openListingCompare(listing) {
      this.selectedListing = listing;
      this.panelMode = "LISTING_COMPARE";
      this.tooltip.show = false;

      this.compareLoading = true;
      this.compareError = "";
      this.compareResult = null;

      try {
        const { data } = await axios.get(
          `${API_BASE}/property/listings/${listing.propertyId}/comparisons`
          // { params: { limit: 10 } }
        );
        // data: { base, candidates, usedRadiusM, aiEnabled, ... }
        this.compareResult = data;
      } catch (e) {
        console.error(e);
        this.compareError = "비교 매물을 불러오지 못했어요.";
      } finally {
        this.compareLoading = false;
      }
    },

    backToBuildingPanel() {
      this.panelMode = "BUILDING";
      this.selectedListing = null;
      this.compareResult = null;
      this.compareError = "";
      this.compareLoading = false;
    },

    closeDetailPanel() {
      this.panelMode = "BUILDING";
      this.selectedProperty = null;
      this.selectedListing = null;
      this.compareResult = null;
      this.tooltip.show = false;
      this.showReviewPanel = false;
    },
    selectProperty(property, { fromMap = false } = {}) {
      this.selectedProperty = property;
      this.selectedAptSeq = property?.aptSeq ?? null;
      this.showReviewPanel = false;

      // 건물 바꾸면 패널도 BUILDING으로 초기화
      this.panelMode = "BUILDING";
      this.selectedListing = null;
      this.compareResult = null;
      this.tooltip.show = false;

      if (property?.latitude && property?.longitude) {
        this.center = { lat: property.latitude, lng: property.longitude };
      }

      if (this.$refs.sidebarRef && this.selectedAptSeq) {
        this.$refs.sidebarRef.scrollToCard(this.selectedAptSeq);
      }
    },

    async selectComparedProperty(payload) {
      try {
        const aptSeq = payload?.aptSeq ? String(payload.aptSeq) : null;
        if (!aptSeq) return;

        // 1) 지도 이동 (가능하면 mapRef로 직접)
        const lat = Number(payload.latitude);
        const lng = Number(payload.longitude);

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          this.center = { lat, lng };

          // (선택) KakaoMap이 props 변경을 늦게 반영하면 아래도 같이
          if (this.mapRef?.setCenter) {
            // kakao.maps.LatLng는 전역 kakao가 있어야 함
            // eslint-disable-next-line no-undef
            this.mapRef.setCenter(new kakao.maps.LatLng(lat, lng));
          }
        }

        // 2) 현재 검색 결과(properties)에서 먼저 찾기
        let found = this.properties.find((p) => String(p.aptSeq) === aptSeq);

        // 3) 없으면 서버에서 aptSeq로 1건 조회해서 패널용 building 카드 만들기
        if (!found) {
          const { data } = await axios.post(`${API_BASE}/property/search`, {
            aptSeq,
            limit: 1,
            offset: 0,
          });

          const b = Array.isArray(data) ? data[0] : data;
          if (!b) {
            alert("해당 건물 정보를 불러오지 못했어요.");
            return;
          }

          // SearchMapPage에서 쓰는 카드 형태로 매핑
          const allImages = Array.isArray(b.images)
            ? b.images.filter(Boolean)
            : [];
          const main = b.imageUrl || allImages[0] || "";

          found = {
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
            latitude: Number(b.latitude),
            longitude: Number(b.longitude),
          };

          // (선택) 마커/사이드바에도 보이게 하고 싶으면 목록에 추가
          // this.properties = [found, ...this.properties];
          this.properties = [...this.properties, found];
        }

        // 4) 건물 상세 패널로 전환 (selectProperty가 panelMode BUILDING으로 초기화함)
        this.selectProperty(found);
      } catch (e) {
        console.error("비교 매물 선택 오류:", e);
        alert("건물 이동 중 오류가 발생했어요.");
      }
    },

    // viewport 기반 매물 로드
    async fetchViewportProperties() {
      if (!this.mapRef) return;

      const bounds = this.mapRef.getBounds();
      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      // 같은 영역 재요청 방지
      const boundsKey = `${sw.getLat().toFixed(4)},${sw.getLng().toFixed(4)},${ne.getLat().toFixed(4)},${ne.getLng().toFixed(4)}`;
      if (this.lastBounds === boundsKey) return;

      this.lastBounds = boundsKey;
      this.isLoadingViewport = true;

      try {
        const { data } = await axios.get(`${API_BASE}/property/map-viewport`, {
          params: {
            minLat: sw.getLat(),
            maxLat: ne.getLat(),
            minLng: sw.getLng(),
            maxLng: ne.getLng()
          }
        });

        this.viewportProperties = (data || []).map(b => ({
          id: b.aptSeq,
          aptSeq: b.aptSeq,
          name: b.aptName,
          address: b.roadAddress,
          rating: b.propertyRating,
          buildYear: b.buildYear,
          latitude: Number(b.latitude),
          longitude: Number(b.longitude),
          minDealType: b.minDealType || "",
          minPrice: b.minPrice ?? null,
          minDeposit: b.minDeposit ?? null,
        }));
      } catch (e) {
        console.error('Viewport properties fetch failed:', e);
      } finally {
        this.isLoadingViewport = false;
      }
    },

    // Debounce 헬퍼
    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
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
  --sidebar-w: 270px;
  --panel-gap: 7px;
}
.map-container {
  position: absolute;
  inset: 0;
}

/* 마커 컨테이너 */
.marker-container {
  position: relative;
  display: inline-block;
  z-index: 1;
}

/* 호버 시 맨 위로 */
.marker-container:hover {
  z-index: 10000;
}

/* 툴팁 (기본 숨김) */
.marker-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-12px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  z-index: 9999;
  white-space: nowrap;
}

/* 호버 시 툴팁 표시 */
.marker-container:hover .marker-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-8px);
}

.tooltip-content {
  background: rgba(17, 17, 17, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.tooltip-name {
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
  text-align: center;
}

.tooltip-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
}

.tooltip-rating {
  color: #ffd700;
  font-weight: 600;
}

.tooltip-divider {
  color: rgba(255, 255, 255, 0.4);
}

.tooltip-price {
  color: var(--tothezip-orange-03);
  font-weight: 600;
}

.tooltip-arrow {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(17, 17, 17, 0.95);
}

/* 기존 마커 스타일 */
.count-marker {
  position: relative;
  width: 55px; /* 40px -> 55px */
  height: 55px; /* 40px -> 55px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(
    135deg,
    var(--tothezip-orange-03) 0%,
    var(--tothezip-orange-05) 50%,
    var(--tothezip-ruby-05) 100%
  );
  border: 3px solid #ffffff;

  box-shadow: 0 4px 12px rgba(227, 93, 55, 0.35), 0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);

  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.count-marker::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.count-marker:hover::before {
  opacity: 1;
  animation: shine 1.5s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.marker-count {
  font-family: "Pretendard", sans-serif;
  font-weight: 800;
  font-size: 17px; /* 15px -> 17px */
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

.marker-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(227, 93, 55, 0.4) 0%,
    rgba(227, 93, 55, 0.2) 40%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
}

.count-marker:hover {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 8px 20px rgba(227, 93, 55, 0.4), 0 4px 8px rgba(0, 0, 0, 0.2);
}

.count-marker:hover .marker-glow {
  opacity: 1;
}

.count-marker:active {
  transform: translateY(-2px) scale(1.05);
}

/* 클러스터 마커 */
.count-marker.cluster {
  width: 75px;
  height: 75px;
  background: linear-gradient(
    135deg,
    var(--tothezip-ruby-04) 0%,
    var(--tothezip-ruby-06) 50%,
    var(--tothezip-orange-06) 100%
  );
  border-width: 4px;
  box-shadow: 0 6px 16px rgba(178, 34, 34, 0.4), 0 3px 6px rgba(0, 0, 0, 0.2),
    inset 0 -2px 6px rgba(0, 0, 0, 0.15),
    inset 0 2px 6px rgba(255, 255, 255, 0.3);
  animation: pulse 2s infinite;
}

.count-marker.cluster .marker-count {
  font-size: 22px;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 12px rgba(178, 34, 34, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15),
      0 0 0 0 rgba(178, 34, 34, 0.4);
  }
  50% {
    box-shadow: 0 4px 12px rgba(178, 34, 34, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15),
      0 0 0 15px rgba(178, 34, 34, 0);
  }
}
</style>
