<template>
  <nav class="navbar">
    <div class="navbar-inner">
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
      <div class="nav-center">
        <div class="search-bar">
          <input
            type="text"
            placeholder="두집이에게 관심 매물 정보를 알려주세요!"
            class="search-input"
          />
          <button class="search-button" aria-label="검색" @click="onSearch">
            <span class="search-icon">🔍</span>
          </button>
        </div>
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
              <span class="user-name" @click="goMyPage">{{
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

            <button
              class="icon-button"
              title="마이 캘린더"
              data-favcal-toggle="1"
              @click.stop.prevent="toggleCalendar"
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

            <div class="profile-button" v-if="isLoggedIn" @click="goMyPage">
              <img :src="profileImg" alt="Profile" class="profile-image" />
            </div>
            <router-link to="/" class="nav-link" @click="logout"
              >로그아웃</router-link
            >
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

// export default {
//   name: "NavigationBar",
//   setup() {
//     const authStore = useAuthStore();
//     const user = computed(() => authStore.user);

//     return {
//       user,
//     };
//   },
// };
export default {
  name: "Header",
  computed: {
    auth() {
      return useAuthStore();
    },
    isLoggedIn() {
      return !!this.auth.accessToken;
    },
    profileImg() {
      // auth.user에 프로필 이미지가 있으면 사용, 없으면 기본 이미지
      return (
        this.auth.user?.profileImageUrl ||
        this.auth.user?.profileImage ||
        new URL("@/assets/images/login_dozip.png", import.meta.url).href
      );
    },
  },
  methods: {
    async onSearch() {
      const ui = useUIStore();

      // 🔥 중요: 찜 모드 해제
      ui.setSearchMode("SEARCH");

      const payload = {
        // 여기 네가 이미 쓰고 있는 검색 payload 구조
        keyword: this.keyword, // 예시
        options: {},
      };

      sessionStorage.setItem("tothezip_search", JSON.stringify(payload));

      this.$router.push("/search");
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
        await logoutApi(); // 서버 refresh 쿠키 제거
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
  z-index: 1000;
}

.navbar-inner {
  max-width: 1380px;
  height: 100%;
  margin: 0 auto;
  /* padding: 0 5px; */
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
  margin-left: auto; /* 오른쪽 끝으로 밀기 */
}

/* CENTER */
.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  pointer-events: none; /* 아래 버튼 클릭 방해 방지 */
}

.nav-center .search-bar {
  pointer-events: auto;
}

.nav-search {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0; /* flex 줄어들 때 깨짐 방지 */
}

/* 검색바 */
.search-bar {
  position: relative;
  width: 420px;
  max-width: 520px; /* 너무 길어지지 않게 */
  height: 45px;
  background: #fff;
  border: 1px solid #dcd4cf;
  border-radius: 100px;
  box-shadow: 0px 2px 4px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 50px 0 30px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #a3978f;
  min-width: 0; /* placeholder 잘림 방지 */
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
}

.search-icon {
  font-size: 15px;
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
  /* font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #000;
  text-decoration: none;
  transition: color 0.2s; */
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
  background-color: rgba(255, 156, 51, 0.15); /* 연한 주황 */
  color: #ff9c33;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  margin-right: 4px;
}

.hello-text {
  color: var(--tothezip-beige-08);
  font-weight: 500;
}

/* 반응형: 좁아지면 검색바 폭 줄이고, 더 좁으면 숨김 */
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
