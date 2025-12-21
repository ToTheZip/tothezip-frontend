import { apiFetch } from "@/api/client";

export async function getMyInfo() {
  const r = await apiFetch("/user", { method: "GET" });
  if (!r.ok) throw new Error("ME_FAILED");
  return r.json();
}
