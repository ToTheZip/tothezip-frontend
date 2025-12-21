<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script>
import { computed } from "vue";
import { useRoute } from "vue-router";

import DefaultLayout from "@/layouts/DefaultLayout.vue";
import NoFooterLayout from "@/layouts/NoFooterLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";

import { useAuthStore } from "@/stores/auth";
import { refreshApi } from "@/api/auth";
import { getMyInfo } from "@/api/user";

export default {
  name: "App",
  components: {
    DefaultLayout,
    NoFooterLayout,
    AuthLayout,
  },
  setup() {
    const route = useRoute();

    // 라우트 meta.layout 값으로 레이아웃 결정
    const layoutComponent = computed(() => {
      const key = route.meta?.layout;
      if (key === "auth") return "AuthLayout";
      if (key === "noFooter") return "NoFooterLayout";
      return "DefaultLayout";
    });

    return { layoutComponent };
  },

  // async mounted() {
  //   const auth = useAuthStore();

  //   // 새로고침 직후 accessToken은 메모리에 없을 수 있음
  //   if (!auth.accessToken) {
  //     try {
  //       // 1) refresh로 accessToken 재발급 시도
  //       const { accessToken } = await refreshApi();
  //       auth.setAccessToken(accessToken);

  //       // 2) 재발급 성공하면 내정보 조회
  //       const user = await getMyInfo();
  //       auth.setUser(user);
  //     } catch (e) {
  //       // refresh 실패(쿠키 없음/만료)면 그냥 비로그인 상태
  //       auth.clearAuth();
  //     }
  //   }
  // },
  async mounted() {
    const auth = useAuthStore();

    auth.hydrate();

    if (localStorage.getItem("manualLogout") === "1") {
      return;
    }

    try {
      if (!auth.accessToken) {
        const { accessToken } = await refreshApi();

        auth.setAuth(accessToken, auth.user);

        const user = await getMyInfo();
        auth.setAuth(accessToken, user);
      }
    } catch (e) {
      auth.clearAuth();
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
