const API_BASE = import.meta.env.VITE_API_BASE;

export async function loginApi(email, password) {
  const r = await fetch(`${API_BASE}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // refresh_token 쿠키 받기/보내기
    body: JSON.stringify({
      email: String(email || "").trim(),
      password: String(password || ""),
    }),
  });

  if (r.status === 401) {
    throw new Error("INVALID_CREDENTIALS");
  }
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`LOGIN_FAILED_${r.status}_${t}`);
  }

  // 백엔드가 JSON으로 { accessToken, user } 내려줌
  const data = await r.json().catch(() => null);
  const accessToken = data?.accessToken;
  const user = data?.user;

  if (!accessToken || !user) {
    throw new Error("LOGIN_RESPONSE_INVALID");
  }

  return { accessToken, user };
}

export async function refreshApi() {
  try{
    const r = await fetch(`${API_BASE}/user/refresh`, {
      method: "POST",
      credentials: "include", // refresh_token 쿠키 보내기
    });
  
    if (r.status === 401) throw new Error("REFRESH_UNAUTHORIZED");
    if (!r.ok) throw new Error("REFRESH_FAILED");
  
    const data = await r.json().catch(() => null);
    const accessToken = data?.accessToken;
  
    if (!accessToken) throw new Error("REFRESH_RESPONSE_INVALID");
    return { accessToken };
  } catch (e) {
    // ✅ 비회원이면 그냥 무시
    return null
  }
}

export async function logoutApi() {
  const r = await fetch(`${API_BASE}/user/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!r.ok) throw new Error("LOGOUT_FAILED");
  return r.json().catch(() => ({}));
}
