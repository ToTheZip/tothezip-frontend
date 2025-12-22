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

// HOT 사이드바 용
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

// 캘린더용 청약 일정
export async function fetchNoticeCalendar({ year, month }) {
  const qs = new URLSearchParams({
    year: String(year),
    month: String(month), // 1~12
  });

  const r = await apiFetch(`/notice/calendar?${qs.toString()}`, {
    method: "GET",
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`NOTICE_CALENDAR_FAILED_${r.status}_${t}`);
  }

  return r.json(); // CalendarListDto
}
