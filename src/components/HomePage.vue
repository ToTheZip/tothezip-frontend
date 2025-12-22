<template>
  <div class="home-page">
    <!-- HERO: 배너 배경이 nav까지 포함 -->
    <div class="hero">
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
        <p class="banner-text">
          여기 배너 영역 근데 이미지 넣을지 그냥 연한 색상으로 냅둘지 고민중
        </p>
      </div>

      <!-- Search Overlap -->
      <div class="search-overlap">
        <SearchBar @search="goSearch" />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <div class="container">
        <!-- Recommended Properties Section -->
        <PropertiesSection
          :isLoggedIn="isLoggedIn"
          :region-name="regionName"
          :tags="propertyTags"
          :properties="displayProperties"
          @tag-click="filterProperties"
          @property-click="goToPropertyDetail"
          @property-go-map="goToMapPage"
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
      // 추천 섹션
      regionName: "",
      propertyTags: [],
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
  },

  methods: {
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

        const raw = (data.regionName || "").trim();

        let region = raw
          .replace(/관심\s*등록한/g, "")
          .replace(/추천\s*매물을\s*준비했어요/g, "")
          .trim();

        if (region.includes(",")) region = region.split(",")[0].trim();

        this.regionName = region;

        this.propertyTags = data.facilityTags || [];

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
  background: var(--tothezip-beige-01);
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
  height: 190px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
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
  bottom: -40px;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 200;
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
