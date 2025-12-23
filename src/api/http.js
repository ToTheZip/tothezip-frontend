import axios from "axios";
import { useAuthStore } from "@/stores/auth";

// 공통 axios 인스턴스
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:80",
  withCredentials: true, // refresh_token 쿠키 포함
});

// 요청마다 accessToken 자동 부착
http.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

// 401이면 refresh 시도 후 원요청 재시도
let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  queue = [];
}

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const auth = useAuthStore();
    const original = err.config;

    // 네트워크 에러 등
    if (!err.response) return Promise.reject(err);

    const status = err.response.status;
    const isAuthError = status === 401 || status === 403;

    // refresh 엔드포인트에서 실패하면 바로 로그아웃
    const isRefreshCall = original?.url?.includes("/user/refresh");

    // 이미 재시도 했으면 종료
    if (!isAuthError || original._retry) {
      if (isAuthError && !isRefreshCall) {
        // 여기서 무조건 clearAuth 하지 말고, refresh 실패 케이스에서만 처리
      }
      return Promise.reject(err);
    }

    // accessToken이 없으면(비회원) refresh 시도 의미 없음
    // (단, "메모리 only + 새로고침" 전략이면 여기서 refresh를 시도하기도 함)
    if (!auth.accessToken) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      // refresh 진행 중이면 대기열에 넣었다가 토큰 받으면 재시도
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(http(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const r = await http.post("/user/refresh", null); // 쿠키로 refresh_token 보냄
      const newToken = r.data?.accessToken;

      if (!newToken) throw new Error("REFRESH_NO_TOKEN");

      auth.setAccessToken(newToken);

      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return http(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      auth.clearAuth();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);
