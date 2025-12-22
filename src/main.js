import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useKakao } from "vue3-kakao-maps/@utils";

// app.use(Vue3KakaoMaps, {
//   appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
//   libraries: ["services", "clusterer"],
// });
useKakao(import.meta.env.VITE_KAKAO_MAP_KEY);
// useKakao(import.meta.env.VITE_KAKAO_MAP_KEY, ["services", "clusterer"]);

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

app.mount("#app");
