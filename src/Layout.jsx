import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaTachometerAlt,
  FaBoxOpen,
  FaTags,
  FaCreditCard,
  FaSitemap,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "./assets/variables.css";
import config from "./config";
import ConfigurarSubdominio from "./ConfigurarSubdominio";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [tienda, setTienda] = useState(null);
  const [estadoSub, setEstadoSub] = useState(null);
  const [loading, setLoading] = useState(true);

  // Manejo de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Traer datos de la tienda
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${config.apiBaseUrl}/my-pantry`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data) setTienda(res.data);
      })
      .catch((error) => {
        console.error("Error al obtener la tienda", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${config.apiBaseUrl}/my-pantry/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data) setEstadoSub(res.data);
      })
      .catch((error) => {
        console.error("Error al obtener el estado de la subscripcion", error);
      });
  }, []);

  // Manejo del sidebar mobile
  const handleToggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };


  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }} />
        <span className="mt-3 text-muted">Cargando tienda...</span>
      </div>
    );
  }

  if (!tienda?.subdomain) {
    return (
      <div className="container mt-5">
        <ConfigurarSubdominio tienda={tienda} setTienda={setTienda} />
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Fondo gris detrás del menú mobile */}
      {isMobile && (
        <div
          className={`sidebar-backdrop ${sidebarOpen ? "active" : ""}`}
          onClick={handleToggleSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 1030,
            display: sidebarOpen ? "block" : "none",
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-custom p-3 d-flex flex-column position-fixed top-0 start-0 vh-100 bg-white ${
          sidebarOpen || !isMobile ? "sidebar-visible" : "sidebar-hidden"
        }`}
        style={{
          width: isMobile ? "85%" : "220px",
          maxWidth: "300px",
          borderRight: "1px solid #ddd",
          zIndex: 1040,
          transition: "transform 0.3s ease",
          transform: sidebarOpen || !isMobile ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Logo */}
        <div className="mb-4 d-flex justify-content-between align-items-center px-2">
          <Link to="/dashboard" className="d-flex align-items-center justify-content-center w-100">
            <img src={isMobile ? "/images/logo_mobile.png" : "/images/logo.png"} alt="de10" width="140" />
          </Link>
        </div>

        {/* Menú */}
        <ul className="nav flex-column text-start">
          <li className="nav-item mb-2">
            <Link to="/dashboard" className="nav-link fw-semibold text-secundario">
              <FaTachometerAlt className="me-2" />
              Dashboard
            </Link>
          </li>

          <li className="nav-item mb-2">
            <Link to="/productos" className="nav-link fw-semibold text-secundario">
              <FaBoxOpen className="me-2" />
              Productos
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/orden/categorias" className="nav-link fw-semibold text-secundario">
              <FaSitemap className="me-2" />
              Mis categorías
            </Link>
          </li>
         {/* <li className="nav-item mb-2">
            <Link to="/categorias" className="nav-link fw-semibold text-secundario">
              <FaSitemap className="me-2" />
              Mis categorías
            </Link>
          </li> */}

          <li className="nav-item mb-2">
            <Link to="/sucursales" className="nav-link fw-semibold text-secundario">
              <FaMapMarkerAlt className="me-2" />
              Sucursales
            </Link>
          </li>
          

          <li className="nav-item mb-2">
            <Link to="/mi-tienda" className="nav-link fw-semibold text-secundario">
              <FaTags className="me-2" />
              Mi Tienda
            </Link>
          </li>

          <li className="nav-item mb-2">
            <Link to="/suscripcion" className="nav-link fw-semibold text-secundario">
              <FaCreditCard className="me-2" />
              Suscripción
            </Link>
          </li>
          {/* <li className="nav-item mb-2">
            <Link to="/orden/categorias" className="nav-link fw-semibold text-secundario">
              <FaSitemap className="me-2" />
              Ordenar categorías
            </Link>
          </li>   */}       
        </ul>

        {/* Botón salir */}
        <div className="mt-auto pt-4 border-top">
          <button className="btn btn-secundario secundario text-start w-100 fw-semibold" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Salir
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-grow-1" style={{ marginLeft: !isMobile ? "220px" : "0", transition: "margin-left 0.3s ease" }}>
        {/* Topbar */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white shadow-sm flex-wrap">
          <div className="d-flex align-items-center">
            {isMobile && (
              <button
                className="btn btn-secundario me-2 btn-menu"
                onClick={handleToggleSidebar}
                aria-label="Abrir menú"
              >
                <FaBars className="icon" size={18} />
              </button>
            )}
            <span className="text-muted fw-bold">{tienda?.name ?? "Mi Tienda"}</span>
          </div>

          {tienda?.subdomain && (
            <span className="text-muted small mt-2 mt-md-0">
              Estás editando <strong>{tienda.subdomain}.de10.app</strong>
            </span>
          )}
        </div>

        {/* Alerta de suscripción */}
        {estadoSub && (
          <div
            className={`alert ${
              estadoSub.active || estadoSub.daysLeft >= 0 ? "alert-info" : "alert-danger"
            } rounded-0 text-center mb-0`}
          >
            {estadoSub.message}
          </div>
        )}

        {/* Contenido dinámico */}
        <main className="p-2">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
