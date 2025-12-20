import { useAuthStore } from "@/stores/auth";
import { refreshApi } from "@/api/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

export async function apiFetch(path, options = {}) {
  const auth = useAuthStore();

  const headers = new Headers(options.headers || {});
  if (auth.accessToken) {
    headers.set("Authorization", `Bearer ${auth.accessToken}`);
  }

  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });

  let r = await doFetch();

  // 401 또는 403이면 accessToken 재발급 시도
  if (r.status === 401 || r.status === 403) {
    try {
      const { accessToken } = await refreshApi();
      auth.setAccessToken(accessToken);

      headers.set("Authorization", `Bearer ${accessToken}`);
      r = await doFetch();
    } catch (e) {
      auth.clearAuth();
      throw e;
    }
  }

  return r;
}
