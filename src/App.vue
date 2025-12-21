<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import { refreshApi } from "@/api/auth";
import { getMyInfo } from "@/api/user";

export default {
  name: "App",
  async mounted() {
    const auth = useAuthStore();

    // 새로고침 직후 accessToken은 메모리에 없을 수 있음
    if (!auth.accessToken) {
      try {
        // 1) refresh로 accessToken 재발급 시도
        const { accessToken } = await refreshApi();
        auth.setAccessToken(accessToken);

        // 2) 재발급 성공하면 내정보 조회
        const user = await getMyInfo();
        auth.setUser(user);
      } catch (e) {
        // refresh 실패(쿠키 없음/만료)면 그냥 비로그인 상태
        auth.clearAuth();
      }
    }
  },
};
</script>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
