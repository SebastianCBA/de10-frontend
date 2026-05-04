// src/axios-guard.js
import axios from "axios";
import config from "./config";

export function setupAxiosGuard(auth) {
  axios.defaults.baseURL = config.apiBaseUrl;             // ej: http://localhost/dashboard/public/api
  axios.defaults.headers.common["Accept"] = "application/json";

  let redirecting = false;

  // request: adjunta Bearer si existe
  axios.interceptors.request.use((cfg) => {
    const tk = auth.getToken?.() || localStorage.getItem("token");
    if (tk) cfg.headers.Authorization = `Bearer ${tk}`;
    return cfg;
  });

  // response: si 401/419 => logout + redirect a /login
  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      if ((status === 401 || status === 419) && !redirecting) {
        redirecting = true;
        try {
          auth.logout?.();
          localStorage.removeItem("token");
        } finally {
          if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
          }
        }
      }
      return Promise.reject(err);
    }
  );
}
