import { http } from "@/api/http";

export async function fetchNoticeList({
  typeFilter = "ALL",
  sort = "latest",
  page = 1,
} = {}) {
  const res = await http.get("/notice", {
    params: { typeFilter, sort, page: String(page) },
  });
  return res.data;
}

export async function fetchNoticeMain({
  typeFilter = "ALL",
  sort = "hot",
} = {}) {
  const res = await http.get("/notice/main", { params: { typeFilter, sort } });
  return res.data;
}

export async function fetchNoticeDetail(noticeId) {
  const res = await http.get(`/notice/${noticeId}`);
  return res.data;
}

export async function fetchNoticeCalendar({ year, month }) {
  const res = await http.get("/notice/calendar", {
    params: { year: String(year), month: String(month) },
  });
  return res.data;
}
