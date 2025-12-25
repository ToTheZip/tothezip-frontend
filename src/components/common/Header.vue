<template>
  <nav
    class="navbar"
    :class="{
      'home-transparent': isHomePage && !isPageScrolled,
      'home-scrolled': isHomePage && isPageScrolled,
    }"
  >
    <div class="navbar-inner" @click="handleNavbarClick">
      <!-- LEFT: 로고 영역 -->
      <div class="nav-left">
        <router-link to="/" class="logo-area">
          <img
            src="@/assets/images/main_logo.png"
            alt="ToTheZip Logo"
            class="logo-image"
          />
        </router-link>
      </div>

      <!-- CENTER: 검색바 영역 -->
      <div
        class="nav-center"
        :class="{ hidden: isHomePage && !isPageScrolled }"
        :style="
          isHomePage
            ? {
                opacity: scrollProgress,
                transform: `translateX(-50%) scale(${
                  0.7 + scrollProgress * 0.3
                })`,
              }
            : {}
        "
        @click.stop
      >
        <div
          class="search-bar"
          :class="{ expanded: isSearchExpanded }"
          ref="searchBarRef"
        >
          <!-- 축소 상태 (기본) -->
          <template v-if="!isSearchExpanded">
            <input
              type="text"
              :placeholder="searchSummary"
              class="search-input"
              @click="expandSearch"
              readonly
            />
          </template>

          <!-- 확장 상태 -->
          <template v-else>
            <!-- 지역 선택 필드 -->
            <div
              class="search-field area-1"
              :class="{ active: activeSearchPanel === 'region' }"
              @click.stop="toggleSearchPanel('region')"
            >
              <div class="field-title">지역</div>
              <div class="field-search">
                <div v-if="selectedLocation" class="selected-text">
                  {{ selectedLocation }}
                </div>
                <div v-else class="placeholder-text">지역 검색</div>
              </div>
            </div>

            <div
              class="divider"
              :class="{
                hidden:
                  activeSearchPanel === 'region' ||
                  activeSearchPanel === 'options',
              }"
            ></div>

            <!-- 옵션 선택 필드 -->
            <div
              class="search-field area-2"
              :class="{ active: activeSearchPanel === 'options' }"
              @click.stop="toggleSearchPanel('options')"
            >
              <div class="field-title">옵션</div>
              <div class="field-search">
                <div v-if="selectedOptions.length > 0" class="options-tags">
                  <span
                    v-for="(tag, idx) in visibleOptionTags"
                    :key="idx"
                    class="option-tag"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="hiddenOptionsCount > 0" class="more-options">
                    +{{ hiddenOptionsCount }}
                  </span>
                </div>
                <div v-else class="placeholder-text">옵션 추가</div>
              </div>
            </div>

            <div
              class="divider"
              :class="{
                hidden:
                  activeSearchPanel === 'options' ||
                  activeSearchPanel === 'property',
              }"
            ></div>

            <!-- 매물명 선택 필드 -->
            <div
              class="search-field area-3"
              :class="{ active: activeSearchPanel === 'property' }"
              @click.stop="toggleSearchPanel('property')"
            >
              <div class="field-title">매물명</div>
              <div class="field-search">
                <div v-if="selectedProperty" class="selected-text">
                  {{ selectedProperty }}
                </div>
                <div v-else class="placeholder-text">검색어 입력</div>
              </div>
            </div>

            <button
              @click.stop="executeHeaderSearch"
              class="search-button expanded-btn"
              aria-label="검색"
            >
              <svg
                class="search-icon-svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </template>
        </div>

        <!-- 패널 영역 -->
        <transition name="slide-fade">
          <div
            v-if="isSearchExpanded && activeSearchPanel"
            class="panel-container"
          >
            <!-- 지역 선택 패널 -->
            <RegionSelectPanel
              v-if="activeSearchPanel === 'region'"
              :selectedSido="selectedSido"
              :selectedGugun="selectedGugun"
              :selectedDong="selectedDong"
              @apply="handleRegionApply"
              @reset="resetLocation"
            />

            <!-- 옵션 선택 패널 -->
            <OptionsSelectPanel
              v-if="activeSearchPanel === 'options'"
              :options="optionsData"
              @apply="handleOptionsApply"
              @reset="resetOptions"
            />

            <!-- 매물명 검색 패널 -->
            <PropertySearchPanel
              v-if="activeSearchPanel === 'property'"
              :initialQuery="propertySearchQuery"
              :sido="selectedSido"
              :gugun="selectedGugun"
              :dong="selectedDong"
              @select="handlePropertySelect"
            />
          </div>
        </transition>

        <!-- 검색바 확장 시 오버레이 -->
        <div
          v-if="isSearchExpanded"
          class="search-overlay"
          @click="closeSearch"
        ></div>
      </div>

      <!-- RIGHT: 메뉴 영역 -->
      <div class="nav-right">
        <!-- 비로그인 -->
        <template v-if="!isLoggedIn">
          <div class="nav-menu auth-links">
            <router-link to="/login" class="nav-link">로그인</router-link>
            <router-link to="/signup" class="nav-link">회원가입</router-link>
          </div>
        </template>
        <!-- 로그인 -->
        <template v-else>
          <div class="nav-menu">
            <div class="greeting" v-if="auth.user?.userName">
              <span class="user-name">{{
                auth.user.userName
              }}</span>
              <span class="hello-text">님, 안녕하세요!</span>
            </div>

            <button class="icon-button" title="관심 매물" @click="goFavorites">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.84 4.61C20.3292 4.099 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04096 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z"
                  stroke="#6F3D32"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <!-- 캘린더 버튼 Wrapper -->
            <div class="header-menu-item relative-wrapper">
              <button
                type="button"
                class="icon-button"
                title="마이 캘린더"
                data-favcal-toggle="1"
                @click="toggleCalendar"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                    stroke="#6F3D32"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M16 2V6"
                    stroke="#6F3D32"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 2V6"
                    stroke="#6F3D32"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M3 10H21"
                    stroke="#6F3D32"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <!-- 캘린더 컴포넌트 -->
              <FavoriteMiniCalendar />
            </div>

            <!-- 프로필 버튼 Wrapper -->
            <div class="header-menu-item relative-wrapper">
              <div class="profile-button" @click.stop="ui.toggleProfileMenu">
                <img :src="profileImg" class="profile-image" />
              </div>

              <!-- 프로필 메뉴 -->
              <transition name="slide-down">
                <ProfileMenuPanel
                  v-if="ui.showProfileMenu"
                  ref="profilePanelRef"
                  @logout="logout"
                  @withdraw="withdraw"
                  @editPreference="ui.openPreferenceEdit"
                />
              </transition>
            </div>

            <!-- ⭐ 관심 수정 패널 -->
            <PreferenceEditPanel />
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";
import { logoutApi } from "@/api/auth";

import { useUIStore } from "@/stores/ui";
import ProfileMenuPanel from "@/components/profile/ProfileMenuPanel.vue";
import PreferenceEditPanel from "@/components/profile/PreferenceEditPanel.vue";
import RegionSelectPanel from "@/components/home/search/RegionSelectPanel.vue";
import OptionsSelectPanel from "@/components/home/search/OptionsSelectPanel.vue";
import PropertySearchPanel from "@/components/home/search/PropertySearchPanel.vue";
import FavoriteMiniCalendar from "@/components/calendar/FavoriteMiniCalendar.vue"; // Import 추가

const onClickOutside = (e) => {
  const ui = useUIStore();
  // 프로필 메뉴가 열려있고, 클릭된 요소가 프로필 패널 내부에 없으면 닫기
  // 하지만 여기서는 Header 컴포넌트 내부에서 처리하는 것이 안전함
};

export default {
  name: "Header",
  data() {
    return {
      // 스크롤 상태
      isPageScrolled: false,
      scrollProgress: 0,

      // 검색바 확장 상태
      isSearchExpanded: false,
      activeSearchPanel: null,
      searchBarRef: null,

      // 지역 선택 데이터
      selectedSido: "",
      selectedGugun: "",
      selectedDong: "",
      selectedLocation: "",

      // 옵션 데이터
      optionsData: {
        nearSubway: false,
        nearSchool: false,
        nearHospital: false,
        nearCulture: false,
        dealType: [],
        depositMin: 0,
        depositMax: 100000,
        monthlyRentMin: 0,
        monthlyRentMax: 500,
        jeonseMin: 0,
        jeonseMax: 100000,
        buyMin: 0,
        buyMax: 50,
        areaMin: 1,
        areaMax: 100,
        floorMin: 1,
        floorMax: 100,
        buildYearMin: 1960,
        buildYearMax: 2025,
        ratingMin: 0,
        ratingMax: 5,
      },
      selectedOptions: [],

      // 매물명 검색 데이터
      propertySearchQuery: "",
      selectedProperty: "",
    };
  },
  computed: {
    isHomePage() {
      return this.$route.path === "/";
    },
    ui() {
      return useUIStore();
    },
    auth() {
      return useAuthStore();
    },
    isLoggedIn() {
      return !!this.auth.accessToken;
    },
    profileImg() {
      const img = this.auth.user?.profileImg;
      if (!img) {
        return new URL("@/assets/images/login_dozip.png", import.meta.url).href;
      }
      // If the path starts with /uploads/, prepend API base
      if (img.startsWith("/uploads/")) {
        const API_BASE = import.meta.env.VITE_API_BASE || "";
        return API_BASE + img;
      }
      return img;
    },
    visibleOptionTags() {
      return this.selectedOptions.slice(0, 3);
    },
    hiddenOptionsCount() {
      return Math.max(0, this.selectedOptions.length - 3);
    },
    searchSummary() {
      const parts = [];

      // 지역 정보
      if (this.selectedLocation) {
        parts.push(this.selectedLocation);
      }

      // 옵션 정보
      if (this.selectedOptions.length > 0) {
        if (this.selectedOptions.length === 1) {
          parts.push(this.selectedOptions[0]);
        } else if (this.selectedOptions.length === 2) {
          parts.push(`${this.selectedOptions[0]}, ${this.selectedOptions[1]}`);
        } else {
          const remainingCount = this.selectedOptions.length - 2;
          parts.push(
            `${this.selectedOptions[0]}, ${this.selectedOptions[1]} 외 ${remainingCount}개`
          );
        }
      }

      // 매물명 정보
      if (this.selectedProperty) {
        parts.push(this.selectedProperty);
      }

      return parts.length > 0
        ? parts.join(" | ")
        : "두집이에게 관심 매물 정보를 알려주세요!";
    },
  },
  components: {
    ProfileMenuPanel,
    PreferenceEditPanel,
    RegionSelectPanel,
    OptionsSelectPanel,
    PropertySearchPanel,
    FavoriteMiniCalendar, // 추가
  },
  mounted() {
    window.addEventListener("scroll", this.handlePageScroll);
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handlePageScroll);
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    handlePageScroll() {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      // 홈 페이지에서 스크롤 진행도 계산
      if (this.isHomePage) {
        const maxScroll = 300;
        this.scrollProgress = Math.min(scrollTop / maxScroll, 1);
        // 200px 이상 스크롤 시 검색바 표시 (좌 더 빨리 표시)
        this.isPageScrolled = scrollTop > 200;
      } else {
        this.scrollProgress = 0;
        this.isPageScrolled = false;
      }
    },

    handleClickOutside(event) {
      const ui = useUIStore();
      if (!ui.showProfileMenu) return;

      const profilePanel = this.$refs.profilePanelRef;
      // 프로필 버튼이나 패널 내부 클릭은 무시
      if (
        event.target.closest(".profile-button") ||
        (profilePanel && profilePanel.$el.contains(event.target))
      ) {
        return;
      }
      ui.closeProfileMenu();
    },
    // 전역 클릭 핸들러 (검색바 외부 클릭 시 닫기)
    handleDocumentClick(event) {
      if (!this.isSearchExpanded) return;

      // 검색바 영역이나 패널 영역을 클릭한 경우는 무시
      const searchBar = this.$refs.searchBarRef;
      if (searchBar && searchBar.contains(event.target)) {
        return;
      }

      // 그 외의 경우 검색바 닫기
      this.closeSearch();
    },

    // 헤더 클릭 핸들러 (검색바 외부 클릭 시 닫기)
    handleNavbarClick() {
      if (this.isSearchExpanded) {
        this.closeSearch();
      }
    },

    // 검색바 확장/축소 관련 메서드
    expandSearch() {
      this.isSearchExpanded = true;
    },
    closeSearch() {
      this.isSearchExpanded = false;
      this.activeSearchPanel = null;
    },
    toggleSearchPanel(panel) {
      if (this.activeSearchPanel === panel) {
        this.activeSearchPanel = null;
      } else {
        this.activeSearchPanel = panel;
      }
    },

    // 지역 선택 관련 메서드
    handleRegionApply({ sido, gugun, dong, location }) {
      this.selectedSido = sido;
      this.selectedGugun = gugun;
      this.selectedDong = dong;
      this.selectedLocation = location;
      this.activeSearchPanel = null;
    },
    resetLocation() {
      this.selectedSido = "";
      this.selectedGugun = "";
      this.selectedDong = "";
      this.selectedLocation = "";
    },

    // 옵션 선택 관련 메서드
    handleOptionsApply(options) {
      this.optionsData = { ...options };

      const optionTags = [];
      if (options.nearSubway) optionTags.push("역세권");
      if (options.nearSchool) optionTags.push("학세권");
      if (options.nearHospital) optionTags.push("병세권");
      if (options.nearCulture) optionTags.push("문세권");
      if (options.dealType && options.dealType.length > 0) {
        optionTags.push(...options.dealType);
      }

      // 거래 유형별 가격 정보 표시
      if (options.dealType.includes("월세")) {
        if (options.depositMin || options.depositMax) {
          optionTags.push(`보증금 ${options.depositMin}~${options.depositMax}`);
        }
        if (options.monthlyRentMin || options.monthlyRentMax) {
          optionTags.push(
            `월세 ${options.monthlyRentMin}~${options.monthlyRentMax}`
          );
        }
      }
      if (options.dealType.includes("전세")) {
        if (options.jeonseMin || options.jeonseMax) {
          optionTags.push(`전세 ${options.jeonseMin}~${options.jeonseMax}`);
        }
      }
      if (options.dealType.includes("매매")) {
        if (options.buyMin || options.buyMax) {
          optionTags.push(`매매 ${options.buyMin}~${options.buyMax}`);
        }
      }

      if (options.areaMin || options.areaMax) {
        optionTags.push(`${options.areaMin || 0}~${options.areaMax || "∞"}평`);
      }
      if (options.floorMin || options.floorMax) {
        optionTags.push(
          `${options.floorMin || 0}~${options.floorMax || "∞"}층`
        );
      }
      if (options.buildYearMin || options.buildYearMax) {
        optionTags.push(
          `${options.buildYearMin || 0}~${options.buildYearMax || "현재"}년`
        );
      }
      if (options.ratingMin || options.ratingMax) {
        optionTags.push(
          `평점 ${options.ratingMin || 0}~${options.ratingMax || 5}`
        );
      }

      this.selectedOptions = optionTags;
      this.activeSearchPanel = null;
    },
    resetOptions() {
      this.optionsData = {
        nearSubway: false,
        nearSchool: false,
        nearHospital: false,
        nearCulture: false,
        dealType: [],
        depositMin: 0,
        depositMax: 100000,
        monthlyRentMin: 0,
        monthlyRentMax: 500,
        jeonseMin: 0,
        jeonseMax: 100000,
        buyMin: 0,
        buyMax: 50,
        areaMin: 1,
        areaMax: 100,
        floorMin: 1,
        floorMax: 100,
        buildYearMin: 1960,
        buildYearMax: 2025,
        ratingMin: 0,
        ratingMax: 5,
      };
      this.selectedOptions = [];
    },

    // 매물명 검색 관련 메서드
    handlePropertySelect(property) {
      this.selectedProperty = property.aptName;
      this.propertySearchQuery = property.aptName;
      this.activeSearchPanel = null;
    },

    // 검색 실행
    executeHeaderSearch() {
      console.log("검색 버튼 클릭됨");
      const ui = useUIStore();
      ui.setSearchMode("SEARCH");

      const searchData = {
        sido: this.selectedSido,
        gugun: this.selectedGugun,
        dong: this.selectedDong,
        location: this.selectedLocation,
        options: this.optionsData,
        property: this.selectedProperty,
      };

      console.log("검색 데이터:", searchData);
      sessionStorage.setItem("tothezip_search", JSON.stringify(searchData));
      this.closeSearch();

      // 검색 페이지로 이동하거나 이미 검색 페이지면 커스텀 이벤트 발생
      if (this.$route.path !== "/search") {
        this.$router.push("/search");
      } else {
        // 커스텀 이벤트를 발생시켜 검색 페이지에 알림
        window.dispatchEvent(new CustomEvent("header-search-triggered"));
      }
    },

    toggleProfileMenu() {
      const ui = useUIStore();
      ui.toggleProfileMenu();
    },
    openPreferenceEdit() {
      const ui = useUIStore();
      ui.openPreferenceEdit();
    },
    toggleCalendar() {
      const ui = useUIStore();
      ui.toggleFavoriteCalendar();
    },
    goFavorites() {
      const ui = useUIStore();
      ui.setSearchMode("FAVORITE");
      this.$router.push({ path: "/search", query: { mode: "favorite" } });
    },
    goSearchMap() {
      const ui = useUIStore();
      ui.setSearchMode("SEARCH");
      this.$router.push({ path: "/search" });
    },
    goCalendar() {
      this.$router.push("/user/calendar");
    },
    goMyPage() {
      this.$router.push("/mypage");
    },
    async logout() {
      const auth = useAuthStore();
      try {
        await logoutApi();
      } catch (e) {
        console.error("[LOGOUT] api failed:", e);
      } finally {
        auth.clearAuth();
        localStorage.setItem("manualLogout", "1");
        this.$router.push("/");
        window.location.reload();
      }
    },
  },
};
</script>

<style scoped>
.navbar {
  width: 100%;
  height: 80px;
  background-color: #fff;
  border-bottom: 1px solid #dcd4cf;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20000;
  transition: all 0.3s ease;
}

.navbar.home-transparent {
  background: #fff4ed;
  border-bottom: none;
}

.navbar.home-scrolled {
  background-color: #fff;
  border-bottom: 1px solid #dcd4cf;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-inner {
  max-width: 1380px;
  height: 100%;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
}

/* LEFT */
.nav-left {
  flex: 0 0 auto;
}

/* RIGHT */
.nav-right {
  margin-left: auto;
}

/* CENTER */
.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  pointer-events: none;
  transform-origin: center;
  will-change: transform, opacity;
}

.nav-center .search-bar {
  pointer-events: auto;
}

.nav-center .panel-container {
  pointer-events: auto;
}

.nav-center.hidden {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

.nav-center.hidden {
  opacity: 0;
  pointer-events: none;
}

/* 검색바 */
.search-bar {
  position: relative;
  width: auto;
  min-width: 320px;
  max-width: 750px;
  height: 45px;
  background: #fff;
  border: 1px solid #dcd4cf;
  border-radius: 100px;
  box-shadow: 0px 2px 4px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 24px;
  transition: all 0.3s ease;
}

.search-bar.expanded {
  width: 580px;
  max-width: 580px;
  height: 70px;
  padding: 8px 14px 8px 24px;
  gap: 0;
  z-index: 200;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #a3978f;
  min-width: 0;
  cursor: pointer;
}

.search-input::placeholder {
  color: #a3978f;
}

.search-button {
  position: absolute;
  right: 8px;
  width: 30px;
  height: 30px;
  background-color: #ff9c33;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.search-button.expanded-btn {
  position: relative;
  right: auto;
  width: 50px;
  height: 50px;
  margin-left: auto;
  flex-shrink: 0;
  z-index: 10;
  pointer-events: auto;
}

.search-button.expanded-btn:hover {
  background-color: var(--tothezip-orange-07);
}

.search-icon {
  font-size: 15px;
}

.search-icon-svg {
  width: 24px;
  height: 24px;
}

/* 확장된 검색바 내부 요소 */
.searchbar-dim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  border-radius: 100px;
  z-index: 1;
  pointer-events: none;
}

.search-field {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px 13px 8px 13px;
  height: 70px;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.2s;
  margin: 0 -8px;
  position: relative;
  z-index: 2;
}

.search-field:hover {
  background-color: var(--tothezip-gray-01, #f7f7f7);
}

.search-field.active {
  z-index: 3;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 6px 26px 8px 26px;
  margin: 0 -16px;
}

.area-1.active {
  padding-left: 24px;
  margin-left: -24px;
}

.area-3.active {
  padding-right: 90px;
  margin-right: -90px;
}

.area-1 {
  width: 165px;
}

.area-2 {
  width: 165px;
}

.area-3 {
  width: 165px;
}

.field-title {
  height: 26px;
  padding: 0 6px;
  margin-bottom: -2px;
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: var(--tothezip-brown-08);
}

.field-search {
  display: flex;
  align-items: center;
  height: 26px;
  padding: 4px 6px;
  width: 100%;
  overflow: hidden;
}

.selected-text {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder-text {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: var(--tothezip-gray-04);
}

.options-tags {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: nowrap;
  overflow: hidden;
}

.option-tag {
  background: var(--tothezip-orange-02, #fff4ed);
  color: var(--tothezip-orange-06);
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.more-options {
  color: var(--tothezip-gray-05);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.divider {
  width: 0;
  height: 26px;
  border-left: 1px solid var(--tothezip-gray-02);
  margin: 0 8px;
  transition: opacity 0.2s ease;
}

.divider.hidden {
  opacity: 0;
}

/* 패널 스타일 */
.panel-container {
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  min-width: 650px;
  z-index: 201;
  max-height: calc(100vh - 200px);
  overflow: visible;
  transform-origin: center top;
}

/* 헤더에서 사용하는 패널 크기 조정 */
.panel-container :deep(.region-panel),
.panel-container :deep(.property-panel) {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  overflow-x: hidden;
}

.panel-container :deep(.options-panel) {
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 옵션 패널 버튼 크기 축소 */
.panel-container :deep(.options-panel .toggle-button) {
  padding: 6px 12px;
  font-size: 12px;
  min-width: 60px;
}

.panel-container :deep(.options-panel .toggle-buttons) {
  gap: 6px;
}

.panel-container :deep(.options-panel .option-title) {
  font-size: 13px;
  margin-bottom: 8px;
}

/* 검색 오버레이 */
.search-overlay {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.slide-fade-enter-active {
  transition: all 0.25s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(-50%) translateY(-10px) scaleY(0.8);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-50%) translateY(-10px) scaleY(0.8);
  opacity: 0;
}

/* 로고 영역 */
.logo-area {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: auto;
  height: 70px;
  text-decoration: none;
}

.logo-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
}

/* 메뉴 영역 */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 25px;
}

.icon-button {
  width: 24px;
/* ... */
}

.relative-wrapper {
  position: relative;
}

.icon-button {
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.icon-button:hover {
  opacity: 0.7;
}

.profile-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #a3978f;
  overflow: hidden;
  cursor: pointer;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auth-links {
  display: flex;
  gap: 20px;
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
  color: #ff9c33;
}

.greeting {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-family: "Pretendard Variable", sans-serif;
  white-space: nowrap;
}

.user-name {
  background-color: rgba(255, 156, 51, 0.15);
  color: #ff9c33;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  margin-right: 4px;
  cursor: default;
}

.hello-text {
  color: var(--tothezip-beige-08);
  font-weight: 500;
}

/* 반응형 */
@media (max-width: 900px) {
  .search-bar {
    width: 320px;
    height: 42px;
  }
  .navbar-inner {
    padding: 0 25px;
  }
}

@media (max-width: 760px) {
  .nav-center {
    display: none;
  }
  .navbar-inner {
    padding: 0 20px;
  }
}
</style>
