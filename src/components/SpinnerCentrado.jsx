// src/components/SpinnerCentrado.jsx
import React from "react";

function SpinnerCentrado({ mensaje = "Cargando...", compact = false }) {
  if (compact) {
    return (
      <div className="inline-loading d-flex align-items-center gap-2 mt-2">
        <div className="spinner-border text-primary" role="status" style={{ width: 18, height: 18 }} />
        <div className="mensaje-cargando small">{mensaje}</div>
      </div>
    );
  }

  return (
    <div className="pantalla-cargando d-flex flex-column justify-content-center align-items-center">
      <div className="spinner-border text-primary mb-3" role="status" />
      <div className="mensaje-cargando">{mensaje}</div>
    </div>
  );
}

export default SpinnerCentrado;
