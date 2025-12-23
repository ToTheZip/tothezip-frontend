import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useKakao } from "vue3-kakao-maps/@utils";
import { useAuthStore } from "@/stores/auth";

useKakao(import.meta.env.VITE_KAKAO_MAP_KEY);

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

const auth = useAuthStore();
auth.hydrate();

app.use(router);

app.mount("#app");
