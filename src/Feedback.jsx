// src/Feedback.jsx
import React, { useEffect } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "./config";

function Feedback({ tipo }) {
  const navigate = useNavigate();

  // opcional: refrescar estado de suscripción tras pago aprobado
  useEffect(() => {
    if (tipo === "success") {
      const token = localStorage.getItem("token");
      if (token) {
        axios.get(`${config.apiBaseUrl}/my-pantry/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }
    // después de 5 s vuelve al dashboard
    const t = setTimeout(() => navigate("/dashboard"), 5000);
    return () => clearTimeout(t);
  }, [tipo, navigate]);

  const mensajes = {
    success: {
      titulo: "¡Gracias! Tu pago fue aprobado 🎉",
      detalle: "Tu suscripción se activará en breves segundos.",
      clase: "alert-success",
    },
    failure: {
      titulo: "Pago rechazado 😕",
      detalle: "Revisa los datos e intentá nuevamente.",
      clase: "alert-danger",
    },
    pending: {
      titulo: "Pago pendiente ⏳",
      detalle: "Te avisaremos cuando se acredite.",
      clase: "alert-warning",
    },
  };

  const { titulo, detalle, clase } = mensajes[tipo] || mensajes.pending;

  return (
    <Layout>
      <div className="container py-5">
        <div className={`alert ${clase}`} role="alert">
          <h4 className="alert-heading">{titulo}</h4>
          <p>{detalle}</p>
          <hr />
          <p className="mb-0">Serás redirigido al panel en unos segundos…</p>
        </div>
      </div>
    </Layout>
  );
}

export default Feedback;
