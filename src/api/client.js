import { useAuthStore } from "@/stores/auth";
import { refreshApi } from "@/api/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

export async function apiFetch(path, options = {}) {
  const auth = useAuthStore(); // ✅ 먼저 선언

  console.log("apiFetch:", path, "token:", auth.accessToken);

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

  // ✅ accessToken 있을 때만 refresh
  if ((r.status === 401 || r.status === 403) && auth.accessToken) {
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
