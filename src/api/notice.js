// import { apiFetch } from "@/api/client";

// // 백엔드: GET /notice?typeFilter=ALL|뉴스|청약&sort=latest&page=1
// export async function fetchNoticeList({ typeFilter = "ALL", sort = "latest", page = 1 } = {}) {
//   const qs = new URLSearchParams({
//     typeFilter,
//     sort,
//     page: String(page),
//   });

//   const r = await apiFetch(`/notice?${qs.toString()}`, { method: "GET" });
//   if (!r.ok) {
//     const t = await r.text().catch(() => "");
//     throw new Error(`NOTICE_LIST_FAILED_${r.status}_${t}`);
//   }
//   return r.json(); // NoticeDto.NoticeList
// }

// // 백엔드: GET /notice/main?typeFilter=...&sort=hot
// export async function fetchHotNoticeList({ typeFilter = "ALL", sort = "hot" } = {}) {
//   const qs = new URLSearchParams({
//     typeFilter,
//     sort,
//   });

//   const r = await apiFetch(`/notice/main?${qs.toString()}`, { method: "GET" });
//   if (!r.ok) {
//     const t = await r.text().catch(() => "");
//     throw new Error(`NOTICE_HOT_FAILED_${r.status}_${t}`);
//   }
//   return r.json(); // NoticeDto.NoticeList
// }
import { apiFetch } from "@/api/client";

// 공지 목록(페이지)
export async function fetchNoticeList({ typeFilter = "ALL", sort = "latest", page = 1 } = {}) {
  const qs = new URLSearchParams({
    typeFilter,
    sort,
    page: String(page),
  });

  const r = await apiFetch(`/notice?${qs.toString()}`, { method: "GET" });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`NOTICE_LIST_FAILED_${r.status}_${t}`);
  }
  return r.json(); // NoticeDto.NoticeList
}

// HOT 사이드바 용 (너 말대로 /notice/main + sort=hot)
export async function fetchNoticeMain({ typeFilter = "ALL", sort = "hot" } = {}) {
  const qs = new URLSearchParams({
    typeFilter,
    sort,
  });

  const r = await apiFetch(`/notice/main?${qs.toString()}`, { method: "GET" });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`NOTICE_MAIN_FAILED_${r.status}_${t}`);
  }
  return r.json(); // NoticeDto.NoticeList
}

// 상세
export async function fetchNoticeDetail(noticeId) {
  const r = await apiFetch(`/notice/${noticeId}`, { method: "GET" });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`NOTICE_DETAIL_FAILED_${r.status}_${t}`);
  }
  return r.json(); // NoticeDto.Detail
}
