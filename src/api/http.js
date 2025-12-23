import axios from "axios";
import { useAuthStore } from "@/stores/auth";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:80",
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const auth = useAuthStore();
  const token = auth.accessToken;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
