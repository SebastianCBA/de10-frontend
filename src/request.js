import axios from "axios";
import { auth } from "./AuthSingleton";
import config from "./config";

export const api = axios.create({
  baseURL: config.apiBaseUrl,
});

/* request: agrega Authorization y X-Subdomain */
api.interceptors.request.use(c => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;

  const partes = window.location.hostname.split(".");
  if (partes.length >= 3) {
    c.headers["X-Subdomain"] = partes[0];
  }

  return c;
});

/* response: captura 401 */
api.interceptors.response.use(
  res => res,
  err => {
    console.log("🚫 interceptor atrapó", err.response?.status);
    if (err.response?.status === 401) {
      auth.ref.current?.clearToken?.();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
