<template>
  <div class="home-page" @scroll="handleScroll" ref="homeContainer">
    <!-- HERO: 배너 배경이 nav까지 포함 -->
    <div class="hero" :class="{ scrolled: isScrolled }">
      <!-- Navigation Bar (hero 안으로 이동)
      <div class="navbar">
        <div class="navbar-inner">
          <div class="logo-area">
            <img
              src="@/assets/images/main_logo.png"
              alt="ToTheZip Logo"
              class="logo-image"
            />
          </div>

          <div class="nav-menu">
            <router-link to="/login" class="nav-link">로그인</router-link>
            <router-link to="/signup" class="nav-link">회원가입</router-link>
          </div>
        </div>
      </div> -->

      <!-- Banner Area -->
      <div class="banner-area">
        <img src="@/assets/images/house.png" alt="House" class="banner-house" />
        <img
          src="@/assets/images/grass.png"
          alt="Grass"
          class="banner-grass banner-grass-left"
        />
        <img
          src="@/assets/images/grass.png"
          alt="Grass"
          class="banner-grass banner-grass-right"
        />
      </div>

      <!-- Search Overlap -->
      <div
        class="search-overlap"
        :style="{
          transform: `translateX(-50%) translateY(${
            -scrollProgress * 120
          }px) scale(${1 - scrollProgress * 0.4})`,
          opacity: 1 - scrollProgress * 0.8,
        }"
      >
        <SearchBar @search="goSearch" :scrollProgress="scrollProgress" />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <div class="container">
        <!-- Recommended Properties Section -->
        <!-- <PropertiesSection
          :isLoggedIn="isLoggedIn"
          :region-name="regionName"
          :tags="propertyTags"
          :properties="displayProperties"
          @tag-click="filterProperties"
          @property-click="goToPropertyDetail"
          @property-go-map="goRecoMap"
        /> -->
        <PropertiesSection
          :isLoggedIn="isLoggedIn"
          :region-name="regionName"
          :tags="propertyTags"
          :properties="displayProperties"
          @property-go-map="goRecoMap"
        />

        <!-- News Section -->
        <NewsSection
          :categories="newsCategories"
          :news="displayNews"
          @category-click="filterNews"
          @news-click="goToNewsDetail"
          @more-click="goToNewsList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SearchBar from "@/components/home/SearchBar.vue";
import PropertiesSection from "@/components/home/PropertiesSection.vue";
import NewsSection from "@/components/home/NewsSection.vue";
import Footer from "@/components/common/Footer.vue";

import { fetchHomeRecommendations, fetchHomeNotices } from "@/api/home";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";

export default {
  name: "HomePage",
  components: {
    SearchBar,
    PropertiesSection,
    NewsSection,
    Footer,
  },
  computed: {
    auth() {
      return useAuthStore();
    },
    isLoggedIn() {
      return !!this.auth.accessToken;
    },
  },
  data() {
    return {
      // 스크롤 상태
      isScrolled: false,
      scrollProgress: 0, // 0 ~ 1 사이의 값

      // 추천 섹션
      regionName: "",
      propertyTags: [],
      preferences: null, // 추가
      displayProperties: [],

      // 뉴스 섹션
      newsCategories: ["전체", "청약", "뉴스"],
      displayNews: [],
      activeNewsCategory: "전체",

      // // 로딩/에러
      // isLoadingReco: false,
      // isLoadingNews: false,
    };
  },

  async mounted() {
    // 홈 진입 시: 추천 + 뉴스 같이 로드
    await Promise.all([this.loadRecommendations(), this.loadHomeNews("ALL")]);

    // 스크롤 이벤트 리스너 추가
    window.addEventListener("scroll", this.handleScroll);
  },

  beforeUnmount() {
    // 컴포넌트 언마운트 시 리스너 제거
    window.removeEventListener("scroll", this.handleScroll);
  },

  methods: {
    handleScroll() {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      // 300px까지 스크롤을 기준으로 0 ~ 1 사이의 값 계산
      const maxScroll = 300;
      this.scrollProgress = Math.min(scrollTop / maxScroll, 1);
      this.isScrolled = scrollTop > 300;
    },

    goRecoMap(aptSeq) {
      // ✅ SearchMapPage가 바로 쓰도록 reco payload 저장
      const payload = {
        regionName: this.regionName,
        facilityTags: this.propertyTags,

        // ✅ preferences(희망 평수/층수)도 같이 저장해서 SearchMapPage 태그로 표시
        preferences: this.preferences || null,
        // 예: { minArea: 20, maxArea: 34, minFloor: 5, maxFloor: 20 }

        // ✅ 추천 리스트 자체를 통째로 넣는 게 제일 안정적 (추가 API 호출 필요 없음)
        properties: (this.displayProperties || []).map((p) => ({
          aptSeq: p.id,
          aptName: p.name,
          roadAddress: p.address,
          propertyRating: p.rating,
          tags: p.tags || [],
          imageUrl: p.image || "",
          latitude: p.latitude,
          longitude: p.longitude,
          buildYear: p.buildYear,
          minDealType: p.minDealType,
          minPrice: p.minPrice,
          minDeposit: p.minDeposit,
        })),

        aptSeqList: (this.displayProperties || []).map((p) => p.id),
      };

      sessionStorage.setItem("tothezip_reco", JSON.stringify(payload));

      this.$router.push({
        path: "/search",
        query: { mode: "reco", open: String(aptSeq) },
      });
    },
    goSearch(searchData) {
      this.$router.push({
        path: "/search",
        query: {
          sido: searchData.sido || "",
          gugun: searchData.gugun || "",
          dong: searchData.dong || "",
          aptName: searchData.propertyName || "",
          // 옵션은 JSON 문자열로 전달
          opts: encodeURIComponent(JSON.stringify(searchData.options || {})),
        },
      });
    },

    goToMapPage(aptSeq) {
      this.$router.push({
        name: "SearchMap",
        query: {
          aptSeq,
        },
      });
    },
    // -------------------------
    // 1) 추천 매물 로드
    // -------------------------
    // async loadRecommendations() {
    //   try {
    //     const data = await fetchHomeRecommendations();
    //     console.log("HOME RECO DATA:", data);

    //     this.regionName = data.regionName || "";
    //     this.propertyTags = data.facilityTags || [];
    //     this.displayProperties = (data.properties || []).map(p => ({
    //       id: p.aptSeq,
    //       name: p.aptName,
    //       address: p.roadAddress,
    //       rating: p.propertyRating,
    //       tags: [],
    //       image: p.imageUrl || "",
    //     }));
    //   } catch (e) {
    //     console.error("추천 매물 로딩 실패", e);
    //     this.displayProperties = [];
    //   }
    // },
    async loadRecommendations() {
      try {
        const data = await fetchHomeRecommendations();
        console.log("HOME RECO DATA:", data);
        console.log("PREFERENCES:", data.preferences); // 디버깅용 로그 추가

        const raw = (data.regionName || "").trim();

        let region = raw
          .replace(/관심\s*등록한/g, "")
          .replace(/추천\s*매물을\s*준비했어요/g, "")
          .trim();

        if (region.includes(",")) region = region.split(",")[0].trim();


        this.regionName = region;
        this.propertyTags = data.facilityTags || [];
        this.preferences = data.preferences || null; // 추가

        this.displayProperties = (data.properties || []).map((p) => ({
          id: p.aptSeq,
          name: p.aptName,
          address: p.roadAddress,
          rating: p.propertyRating,
          tags: p.tags || [], // 서버가 tags 내려주면 바로 반영
          image: p.imageUrl || "", // PropertyCard가 image를 보니까 유지
        }));
      } catch (e) {
        console.error("추천 매물 로딩 실패", e);
        this.regionName = "";
        this.propertyTags = [];
        this.preferences = null; // 초기화
        this.displayProperties = [];
      }
    },

    filterProperties(tag) {
      // 지금은 “연결만”이니까 필터는 나중에.
      // 필요하면: this.displayProperties = 원본에서 tag 포함하는 것만 필터링
      console.log("Filter properties by:", tag);
    },

    goToPropertyDetail(id) {
      // 라우터 있으면 이동
      // this.$router.push(`/property/${id}`);
      console.log("Go to property:", id);
    },

    // -------------------------
    // 2) 공지(부동산 소식) 로드
    // -------------------------
    async loadHomeNews(category) {
      this.isLoadingNews = true;
      try {
        this.activeNewsCategory = category;

        const typeFilter = category === "전체" ? "ALL" : category; // 백은 ALL/뉴스/청약
        const nList = await fetchHomeNotices(typeFilter);

        // nList: { pinned:[], notices:[] }
        const pinned = nList?.pinned || [];
        const notices = nList?.notices || [];

        // pinned 먼저 + 중복 제거 + 총 4개만
        const seen = new Set();
        const merged = [];
        for (const x of [...pinned, ...notices]) {
          const id = x.noticeId;
          if (id == null) continue;
          if (seen.has(id)) continue;
          seen.add(id);
          merged.push(x);
          if (merged.length >= 4) break; //
        }

        // NewsCard가 기대하는 형태로 변환
        this.displayNews = merged.map((x) => ({
          id: x.noticeId,
          type: x.type, // "뉴스" or "청약" or ...
          date: this.formatDate(x.registDate), // "2025.12.10"
          title: x.title,
        }));
      } catch (e) {
        console.error(e);
        this.displayNews = [];
      } finally {
        this.isLoadingNews = false;
      }
    },

    filterNews(category) {
      // 버튼 클릭 → 해당 타입으로 다시 fetch
      this.loadHomeNews(category);
    },

    // goToNewsDetail(id) {
    //   // 백엔드가 /notice/{id} 제공함.
    //   // 라우터를 /notice/:noticeId 로 만들어두면 여기서 이동 가능
    //   this.$router.push(`/notice/${id}`);
    // },

    // goToNewsList() {
    //   // 공지사항 페이지
    //   this.$router.push("/notices");
    // },

    goToNewsDetail(id) {
      this.$router.push({ name: "NoticeDetail", params: { noticeId: id } });
    },

    goToNewsList() {
      this.$router.push({
        name: "NoticeList",
        query: { typeFilter: "ALL", sort: "latest", page: 1 },
      });
    },

    formatDate(dateLike) {
      // LocalDate("2025-12-10") -> "2025.12.10"
      if (!dateLike) return "";
      const s = String(dateLike);
      if (s.includes("-")) return s.replaceAll("-", ".");
      return s;
    },
  },
};
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  background: white;
}

/* HERO: 배너 배경이 nav까지 포함 */
.hero {
  position: relative;
  width: 100%;
  background: linear-gradient(180deg, #fff4ed 0%, #fff4ed 100%);
  padding-top: 80px; /* 헤더 높이만큼 */
  transition: all 0.3s ease;
}

/* Navigation Bar (배경은 hero가 담당) */
.navbar {
  width: 100%;
  background: transparent;
}

.navbar-inner {
  width: 100%;
  padding: 18px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: center;
}

.logo-image {
  width: 74px;
  height: 74px;
  object-fit: contain;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 18px;
}

.nav-link {
  font-family: "Pretendard Variable", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: var(--tothezip-beige-08);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.nav-link:hover {
  color: var(--tothezip-orange-06);
}

/* Banner Area (배경색은 hero가 담당) */
.banner-area {
  width: 100%;
  height: 100px;
  background: transparent;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  overflow: visible;
}

.banner-house {
  position: absolute;
  bottom: 5px;
  left: 35%;
  transform: translateX(-50%);
  height: 160px;
  width: auto;
  z-index: 200;
}

.banner-grass {
  position: absolute;
  bottom: 18px;
  height: 70px;
  width: auto;
  z-index: 190;
}

.banner-grass-left {
  left: 31.2%;
}

.banner-grass-right {
  right: 61.5%;
  transform: scaleX(-1);
}

@keyframes float {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

.banner-text {
  font-family: "Pretendard Variable", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #111;
  line-height: normal;
  text-align: center;
  margin: 0;
}

/* Search Overlap */
.search-overlap {
  position: absolute;
  left: 50%;
  bottom: -30px;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 200;
  transition: none; /* 스크롤에 따라 동적으로 변경되므로 transition 제거 */
  will-change: transform, opacity;
}

/* Main Content */
.main-content {
  width: 100%;
  background: white;
  position: relative;
  z-index: 1;
}

.container {
  width: 1070px;
  margin: 0 auto;
  padding-top: 70px; /* 검색바 겹친 공간 확보 */
}

.project-info {
  position: absolute;
  left: 16px;
  top: 29px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 10px;
  color: var(--tothezip-brown-02);
  line-height: normal;
}

.top-button {
  position: absolute;
  right: 0;
  top: 29px;
  width: 66px;
  height: 46px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.triangle-icon {
  width: 12px;
  height: 12px;
  margin-bottom: 5px;
}

.top-text {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 10px;
  color: var(--tothezip-brown-01);
  line-height: normal;
}
</style>
