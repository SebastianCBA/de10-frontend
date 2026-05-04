// src/Suscripcion.jsx
import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import axios from "axios";
import config from "./config";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/* ───────── util: breakpoint xs (<576 px) ───────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 575.98px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 575.98px)");
    const handler = () => setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function Suscripcion() {
  const { token } = useAuth();
  const isMobile = useIsMobile();

  /* ───────── state ───────── */
  const [status, setStatus] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgError, setMsgError] = useState("");

  /* ───────── carga ───────── */
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${config.apiBaseUrl}/my-pantry/status`, { headers }),
      axios.get(`${config.apiBaseUrl}/my-pantry/payments`, { headers })
    ])
      .then(([st, pay]) => {
        setStatus(st.data);
        setPayments(pay.data);
      })
      .catch(() => setMsgError("No se pudo cargar la información."))
      .finally(() => setLoading(false));
  }, [token]);

  /* ───────── iniciar suscripción ───────── */
  const iniciarSuscripcion = async () => {
    try {
      const { data } = await axios.post(
        `${config.apiBaseUrl}/iniciar-suscripcion`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      data?.init_point
        ? (window.location.href = data.init_point)
        : setMsgError("No se pudo obtener el enlace de suscripción.");
    } catch {
      setMsgError("No se pudo iniciar la suscripción.");
    }
  };

  /* ───────── UI helpers ───────── */
  if (!token)  return <Navigate to="/login" />;
  if (loading) return <Layout><div className="container py-5">Cargando…</div></Layout>;

  const renderBanner = () => {
    if (!status) return null;
    return status.active ? (
      <div className="alert alert-success">
        ✅ Tu suscripción está activa. Te quedan {status.daysLeft} días.
      </div>
    ) : (
      <div className="alert alert-warning">
        ⚠️ Tu suscripción no está activa. {status.message}
      </div>
    );
  };

  const renderPayments = () => (
    <div className="mt-4">
      <h4 className="mb-3">Historial de pagos</h4>

      {payments.length === 0 && (
        <p className="text-muted">Aún no se registran pagos.</p>
      )}

      {/* ▸ Desktop / tablet: tabla ------------------------ */}
      {!isMobile && payments.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead className="table-light">
              <tr>
                <th>Fecha</th>
                <th>ID pago</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.mp_payment_id}>
                  <td>{new Date(p.created_at).toLocaleDateString("es-AR")}</td>
                  <td className="text-truncate" style={{maxWidth:140}} title={p.mp_payment_id}>
                    {p.mp_payment_id}
                  </td>
                  <td>$ {p.amount}</td>
                  <td>
                    {p.status === "approved"
                      ? <span className="text-success">Aprobado</span>
                      : <span className="text-danger">Rechazado</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ▸ Mobile: tarjetas verticales -------------------- */}
      {isMobile && payments.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {payments.map(p => (
            <div className="card border-0 shadow-sm" key={p.mp_payment_id}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between">
                  <strong>{new Date(p.created_at).toLocaleDateString("es-AR")}</strong>
                  <span>
                    {p.status === "approved"
                      ? <span className="text-success">Aprobado</span>
                      : <span className="text-danger">Rechazado</span>}
                  </span>
                </div>
                <div className="small text-muted text-truncate" title={p.mp_payment_id}>
                  ID: {p.mp_payment_id}
                </div>
                <div className="mt-1 fw-bold">$ {p.amount}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ───────── render ───────── */
  return (
    <Layout>
      <div className="container py-5">
        <h1 className="mb-3 fw-bold" style={{color:"var(--color-secundario)"}}>
          Suscripción
        </h1>

        {renderBanner()}

        {!status?.active && (
          <>
            <p className="text-muted mb-4" style={{fontSize:"1.1rem"}}>
              El costo es de <strong>AR$4990 mensuales</strong>.
            </p>
            <button className="btn btn-primary" onClick={iniciarSuscripcion}>
              Suscribirme con Mercado Pago
            </button>
          </>
        )}

        {msgError && <div className="alert alert-danger mt-3">{msgError}</div>}

        {renderPayments()}
      </div>
    </Layout>
  );
}
