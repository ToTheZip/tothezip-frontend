import { http } from "@/api/http";

export async function getMyInfo() {
  const res = await http.get("/user");
  return res.data;
}
