import { http } from "@/api/http";

// 관심 태그
export function getPreferenceTags() {
  return http.get("/user/preferences/tags");
}

// 지역 + 층수 + 평수
export function getPreferenceRange() {
  return http.get("/user/preferences/range");
}
