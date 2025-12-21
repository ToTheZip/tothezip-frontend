import { apiFetch } from "@/api/client";

// ✅ 추천 매물 (비회원 허용)
export async function fetchHomeRecommendations() {
  const r = await apiFetch("/property/recommendations", { method: "GET" });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`HOME_RECO_FAILED_${r.status}_${t}`);
  }

  return r.json(); // PropertyDto.RecommendationsProperty
}

// ✅ 홈 공지
export async function fetchHomeNotices(typeFilter = "ALL") {
  const qs = new URLSearchParams({
    typeFilter,
    sort: "latest",
  });

  const r = await apiFetch(`/notice/main?${qs.toString()}`, {
    method: "GET",
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`HOME_NOTICE_FAILED_${r.status}_${t}`);
  }

  return r.json();
}
