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
        <KakaoMapCustomOverlay
          v-for="c in clusterMarkers"
          :key="c.key"
          :lat="c.lat"
          :lng="c.lng"
          :yAnchor="1"
        >
          <div
            class="count-marker"
            :class="{ cluster: c.items.length > 1 }"
            @click.stop="
              c.items.length > 1
                ? zoomIntoCluster(c)
                : selectProperty(c.items[0], { fromMap: true })
            "
          >
            <span class="marker-count">{{ c.count }}</span>
            <div class="marker-glow"></div>
          </div>
        </KakaoMapCustomOverlay>

        <!-- (선택) 클러스터 모드가 아닐 때만 개별 표시 -->
        <KakaoMapCustomOverlay
          v-for="m in !isClusterMode ? markerBuildings : []"
          :key="m.aptSeq"
          :lat="m.latitude"
          :lng="m.longitude"
          :yAnchor="1"
        >
          <div
            class="count-marker"
            @click.stop="selectProperty(m, { fromMap: true })"
          >
            <span class="marker-count">{{ m.count }}</span>
            <div class="marker-glow"></div>
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
    />

    <!-- ================== PANELS ================== -->
    {{ console.log("selectedProperty:", selectedProperty) }}
    <PropertyDetailPanel
      v-if="selectedProperty && !showReviewPanel"
      :property="selectedProperty"
      @close="closeDetailPanel"
      @favorite-empty="removeFavoriteBuilding"
      @open-reviews="openReviewsPanel"
    />

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

const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "SearchMapPage",
  components: {
    KakaoMap,
    KakaoMapCustomOverlay,
    SearchSidebar,
    PropertyDetailPanel,
    ReviewListPanel,
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
      properties: [],
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
    validProperties() {
      return this.properties.filter((p) => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        return Number.isFinite(lat) && Number.isFinite(lng);
      });
    },
    markerBuildings() {
      const map = new Map();

      for (const p of this.validProperties) {
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
    handleGoMap(payload) {
      console.log("[SearchMapPage] go-map payload:", payload);

      const { aptSeq, lat, lng } = payload || {};

      // aptSeq가 없으면 id를 fallback으로
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
    async hydrateMissingFields() {
      const missing = this.properties
        .filter((p) => {
          const noPrice =
            !p.minDealType || (p.minDeposit == null && p.minPrice == null);

          const noCoord =
            !Number.isFinite(Number(p.latitude)) ||
            !Number.isFinite(Number(p.longitude));

          // 가격 OR 좌표 중 하나라도 없으면 보강
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
          // 좌표 보강
          latitude: Number(p.latitude) || Number(b.latitude),
          longitude: Number(p.longitude) || Number(b.longitude),

          // 가격 보강
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
        new Set(this.validProperties.map((p) => String(p.aptSeq ?? p.id)))
      );

      const limit = 8;
      const nextMap = { ...this.listingCountMap };

      for (let i = 0; i < aptSeqs.length; i += limit) {
        const chunk = aptSeqs.slice(i, i + limit);

        const results = await Promise.allSettled(
          chunk.map(async (aptSeq) => {
            const { data } = await axios.get(`/property/${aptSeq}/listings`);
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
      // 찜에서 전체/추천 누르면 라우트 변경 유지
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

      this.level = map.getLevel();
      this.rebuildClusters();
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
        // console.log("[RECO RAW]", sessionStorage.getItem("tothezip_reco"));
        console.log("[RECO PARSED]", reco);

        if (!reco) {
          this.errorMessage =
            "추천 데이터가 없습니다. 홈에서 다시 시도해주세요.";
          return;
        }

        const recoRegionName = (reco.regionName || "").trim();

        this.filterTags = this.makeRecoTags(reco);

        console.log("[RECO] properties:", this.properties.length);
        console.log("[RECO] valid:", this.validProperties.length);
        console.log("[RECO] markerBuildings:", this.markerBuildings.length);
        console.log("[RECO] sample:", this.properties[0]);

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

          // mapBuildingToCard는 regionName 안 넣어주니까 여기서 주입
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

            jibun: b.jibun, // "648-3"
            roadNm: b.roadNm || b.road_nm, // "온천북로33번길"
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
  --sidebar-w: 270px;
  --panel-gap: 7px;
}
.map-container {
  position: absolute;
  inset: 0;
}

/* 🎨 예쁜 마커 스타일 */
.count-marker {
  position: relative;
  width: 40px;
  height: 40px;
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
  font-size: 15px;
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

/* 클러스터 마커 (여러 개 묶인 경우) */
.count-marker.cluster {
  width: 52px;
  height: 52px;
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

.count-marker.cluster::before {
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 70%
  );
}

.count-marker.cluster .marker-count {
  font-size: 18px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.5);
}

.count-marker.cluster .marker-glow {
  background: radial-gradient(
    circle,
    rgba(178, 34, 34, 0.5) 0%,
    rgba(227, 93, 55, 0.3) 40%,
    transparent 70%
  );
  animation: clusterGlowPulse 2s ease-in-out infinite;
}

@keyframes clusterGlowPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
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
