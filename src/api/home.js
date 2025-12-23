import { http } from "@/api/http";

export async function fetchHomeRecommendations() {
  const res = await http.get("/property/recommendations");
  return res.data;
}

export async function fetchHomeNotices(typeFilter = "ALL") {
  const res = await http.get("/notice/main", {
    params: { typeFilter, sort: "latest" },
  });
  return res.data;
}
