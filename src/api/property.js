import { http } from "@/api/http";

// tagId -> tag 상세(또는 name) 매핑용 API가 있다고 가정
export function resolveTags(tagIds) {
  return http.post("/property/tags/resolve", { tagIds });
}
