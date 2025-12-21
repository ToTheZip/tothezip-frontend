<template>
  <div class="home-page">
    <!-- HERO: 배너 배경이 nav까지 포함 -->
    <div class="hero">
      <!-- Navigation Bar (hero 안으로 이동) -->
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
      </div>

      <!-- Banner Area -->
      <div class="banner-area">
        <p class="banner-text">
          여기 배너 영역 근데 이미지 넣을지 그냥 연한 색상으로 냅둘지 고민중
        </p>
      </div>

      <!-- Search Overlap -->
      <div class="search-overlap">
        <SearchBar @search="handleSearch" />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <div class="container">
        <!-- Recommended Properties Section -->
        <PropertiesSection
          :region-name="regionName"
          :tags="propertyTags"
          :properties="displayProperties"
          @tag-click="filterProperties"
          @property-click="goToPropertyDetail"
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
import SearchBar from "./home/SearchBar.vue";
import PropertiesSection from "./home/PropertiesSection.vue";
import NewsSection from "./home/NewsSection.vue";
import Footer from "@/components/common/Footer.vue";

export default {
  name: "HomePage",
  components: {
    SearchBar,
    PropertiesSection,
    NewsSection,
    Footer,
  },
  data() {
    return {
      regionName: "종로구",
      propertyTags: ["역세권", "학세권", "문세권"],
      newsCategories: ["전체", "청약", "뉴스"],
      displayProperties: [
        {
          id: 1,
          name: "현대뜨레비앙",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-placeholder.jpg",
        },
        {
          id: 2,
          name: "현대뜨레비앙",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-placeholder.jpg",
        },
        {
          id: 3,
          name: "현대뜨레비앙",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-placeholder.jpg",
        },
        {
          id: 4,
          name: "현대뜨레비앙",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-placeholder.jpg",
        },
        {
          id: 5,
          name: "현대뜨레비앙",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-placeholder.jpg",
        },
        {
          id: 6,
          name: "현대뜨레비앙",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-placeholder.jpg",
        },
        {
          id: 7,
          name: "현대뜨레비앙",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-placeholder.jpg",
        },
        {
          id: 8,
          name: "현대뜨레비앙",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-placeholder.jpg",
        },
        {
          id: 9,
          name: "현대뜨레비앙",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-placeholder.jpg",
        },
        {
          id: 10,
          name: "현대뜨레비앙",
          address: "돈화문로11가길 59",
          rating: "4.2",
          tags: ["문세권", "학세권", "병세권"],
          image: "/images/property-placeholder.jpg",
        },
      ],
      displayNews: [
        {
          id: 1,
          type: "주요 뉴스",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 2,
          type: "주요 뉴스",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 3,
          type: "주요 뉴스",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
        {
          id: 4,
          type: "주요 뉴스",
          date: "2025.12.10",
          title:
            "'침수 피해' 대림1구역, 신통 기획 재개발로 주거 환경 개선·재난 예방 속도",
        },
      ],
    };
  },
  methods: {
    handleSearch(searchData) {
      console.log("Search:", searchData);
      // Implement search logic
    },
    filterProperties(tag) {
      console.log("Filter properties by:", tag);
      // Implement filter logic
    },
    filterNews(category) {
      console.log("Filter news by:", category);
      // Implement filter logic
    },
    goToPropertyDetail(id) {
      console.log("Go to property:", id);
      // this.$router.push(`/property/${id}`)
    },
    goToNewsDetail(id) {
      console.log("Go to news:", id);
      // this.$router.push(`/news/${id}`)
    },
    goToNewsList() {
      console.log("Go to news list");
      // this.$router.push('/news')
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
}

/* Main Content */
.main-content {
  width: 100%;
  background: white;
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
