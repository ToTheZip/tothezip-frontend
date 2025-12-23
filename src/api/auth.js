import { http } from "@/api/http";

export async function loginApi(email, password) {
  const res = await http.post("/user/login", {
    email: String(email || "").trim(),
    password: String(password || ""),
  });
  return res.data; // { accessToken, user }
}

export async function refreshApi() {
  const res = await http.post("/user/refresh", null);
  return res.data; // { accessToken }
}

export async function logoutApi() {
  const res = await http.post("/user/logout", null);
  return res.data;
}
