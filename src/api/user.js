// import { apiFetch } from "@/api/client";

// export async function getMyInfo() {
//   const r = await apiFetch("/user", { method: "GET" });
//   if (!r.ok) throw new Error("ME_FAILED");
//   return r.json();
// }

import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

export async function getMyInfo() {
  const auth = useAuthStore();
  const res = await axios.get(`${API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
    withCredentials: true,
  });
  return res.data;
}
