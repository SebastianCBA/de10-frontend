import React from "react";
import Layout from "./Layout";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Dashboard() {
  const { token } = useAuth();

  if (!token) return <Navigate to="/login" />;

  return (
    <Layout>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 style={{ color: "var(--color-secundario)", fontWeight: "bold" }}>
            ¡Bienvenido a tu Panel de Control!
          </h1>
          <p className="text-muted" style={{ fontSize: "1.1rem" }}>
            Gestioná tu tienda y tus productos fácilmente.
          </p>
        </div>

        <div className="row g-4 align-items-stretch">
          <div className="col-md-4 d-flex">
            <div className="card h-100 w-100 shadow-sm border-0 card-hover dashboard-card">
              <div className="card-body text-center d-flex flex-column h-100">
                <h5 className="card-title" style={{ color: "var(--color-primario)", fontWeight: "bold" }}>
                  Mi Tienda
                </h5>
                <p className="card-text text-muted">
                  Editá los datos principales de tu tienda.
                </p>
                <Link to="/mi-tienda" className="btn mt-auto dashboard-card-button" style={{ backgroundColor: "var(--color-primario)", color: "white" }}>
                  Datos Generales
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 d-flex">
            <div className="card h-100 w-100 shadow-sm border-0 card-hover dashboard-card">
              <div className="card-body text-center d-flex flex-column h-100">
                <h5 className="card-title" style={{ color: "var(--color-primario)", fontWeight: "bold" }}>
                  Productos
                </h5>
                <p className="card-text text-muted">
                  Agregá, editá o eliminá productos de tu tienda.
                </p>
                <Link to="/productos" className="btn mt-auto dashboard-card-button" style={{ backgroundColor: "var(--color-primario)", color: "white" }}>
                  Ver Productos
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 d-flex">
            <div className="card h-100 w-100 shadow-sm border-0 card-hover dashboard-card">
              <div className="card-body text-center d-flex flex-column h-100">
                <h5 className="card-title" style={{ color: "var(--color-primario)", fontWeight: "bold" }}>
                  Suscripción
                </h5>
                <p className="card-text text-muted">
                  Activá tu plan o revisá tu estado de suscripción.
                </p>
                <Link to="/suscripcion" className="btn mt-auto dashboard-card-button" style={{ backgroundColor: "var(--color-primario)", color: "white" }}>
                  Ver Suscripción
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 d-flex">
            <div className="card h-100 w-100 shadow-sm border-0 card-hover dashboard-card">
              <div className="card-body text-center d-flex flex-column h-100">
                <h5 className="card-title" style={{ color: "var(--color-primario)", fontWeight: "bold" }}>
                  Pedidos WhatsApp
                </h5>
                <p className="card-text text-muted">
                  Revisá los pedidos registrados desde tu tienda con filtros por fecha.
                </p>
                <Link to="/pedidos-whatsapp" className="btn mt-auto dashboard-card-button" style={{ backgroundColor: "var(--color-primario)", color: "white" }}>
                  Ver Pedidos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
