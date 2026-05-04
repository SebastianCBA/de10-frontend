import React from "react";
import "./landingAssets/vendors/bootstrap/bootstrap.min.css";
import "./landingAssets/css/style.css";

export default function ComingSoon() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #ffffff 0%, #fff5ef 30%, #ff8c5a 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "4rem 1rem"
    }}>
      {/* Logo sin fondo ni marco */}
      <img
        src="/images/logo_mobile.png"
        alt="de10.app"
        style={{ width: "160px", height: "auto", marginBottom: "2rem" }}
      />

      <h1 style={{
        fontSize: "3rem",
        fontWeight: "bold",
        marginBottom: "1.2rem",
        color: "#222"
      }}>
        ¡Muy pronto!
      </h1>

      <p style={{
        fontSize: "1.25rem",
        maxWidth: "600px",
        marginBottom: "2rem",
        color: "#333"
      }}>
        Estamos trabajando para lanzar la mejor plataforma para <strong>despensas</strong>, <strong>autoservicios</strong> y pequeños comercios de toda la Argentina.<br />
        Muy pronto vas a poder activar tu tienda online con más de <strong>40.000 productos precargados</strong>.
      </p>

      <a
        href="https://wa.me/+5493512100793"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-warning btn-lg fw-bold"
        style={{
          color: "#fff",
          padding: "0.75rem 1.5rem",
          fontSize: "1.1rem",
          borderRadius: "6px",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem"
        }}
      >
        <i className="bi bi-whatsapp" style={{ fontSize: "1.3rem" }}></i>
        Avisame por WhatsApp
      </a>
    </div>
  );
}
