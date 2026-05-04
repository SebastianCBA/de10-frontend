//  src/main.jsx
import "./request";          // 👈 importa DESPUÉS de crear la ref, ANTES del mount

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { AuthProvider } from "./AuthContext";
import { auth } from "./AuthSingleton";
import { HelmetProvider } from "react-helmet-async";  // 👈 IMPORTANTE
import { setupAxiosGuard } from "./axios-guard";

// ⚠️ importante: registrar interceptores antes de montar React
setupAxiosGuard(auth);


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider> 
      <AuthProvider ref={auth.ref}>
        <App />
      </AuthProvider>
    </HelmetProvider> 
  </React.StrictMode>
);
