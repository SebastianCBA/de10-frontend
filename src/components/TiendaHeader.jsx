import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaBars, FaMapMarkerAlt, FaPhone, FaSearch } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import config from "../config";
import SugerenciasBusqueda from "./SugerenciasBusqueda";

function TiendaHeader({ tienda, busqueda, setBusqueda, sugerencias, setSugerencias, mostrarSugerencias, setMostrarSugerencias, setMenuAbierto }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { carrito } = useCart();
  const cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);

  useEffect(() => {
    if (!location.pathname.startsWith("/buscar")) {
      setBusqueda("");
    }
  }, [location.pathname]);

  const handleBusquedaChange = async (e) => {
    const texto = e.target.value;
    setBusqueda(texto);

    if (texto.length > 1) {
      try {
        const subdomain = window.location.hostname.split('.')[0];
        const res = await fetch(`${config.apiBaseUrl}/tienda/${subdomain}/buscar-productos?q=${texto}&page=1`);
        const data = await res.json();
        setSugerencias(data.data.slice(0, 6));
        setMostrarSugerencias(true);
      } catch (error) {
        console.error("Error buscando sugerencias:", error);
        setSugerencias([]);
        setMostrarSugerencias(false);
      }
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  const irABusqueda = () => {
    if (busqueda.trim().length > 2) {
      navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`);
    }
  };

  return (
    <div className="layout-header">
      <div className="topbar">
        <div className="topbar-left">
          <Link to="/" onClick={() => window.innerWidth < 768 && setMenuAbierto(false)} className="text-decoration-none text-dark fw-bold">
            {tienda.name}
          </Link>
        </div>
        <div className="topbar-right">
          <div className="icono-ubicacion">
            <FaMapMarkerAlt className="text-primary" />
            <span>{tienda.address ?? "Dirección por defecto"}</span>
          </div>
          <div className="icono-telefono">
            <FaPhone className="text-success" />
            <span>{tienda.phone ?? "3513738381"}</span>
          </div>
        </div>
      </div>

      <div className="main-header position-relative">
        <div className="d-md-none">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setMenuAbierto((prev) => !prev)}>
            <FaBars />
          </button>
        </div>

        <div className="logo-nombre-wrapper">
          <Link to="/" onClick={() => window.innerWidth < 768 && setMenuAbierto(false)} className="logo-nombre">
            {tienda.logo ? (
              <img src={tienda.logo} alt="Logo" className="logo-tienda" />
            ) : (
              <span className="fw-bold">{tienda.name}</span>
            )}
          </Link>
        </div>

        <div className="carrito-container d-md-none position-absolute top-0 end-0 mt-1 me-2">
          <Link to="/carrito" className="btn btn-outline-primary position-relative">
            <FaShoppingCart />
            {cantidadCarrito > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cantidadCarrito}
              </span>
            )}
          </Link>
        </div>

        <div className="search-wrapper mt-2 mt-md-0">
          <div className="search-container position-relative">
            <form
              className="input-group search-input-group"
              onSubmit={(e) => {
                e.preventDefault();
                irABusqueda();
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={handleBusquedaChange}
              />
              <button type="submit" className="btn btn-outline-primary">
                <FaSearch />
              </button>
            </form>

            <SugerenciasBusqueda
              sugerencias={sugerencias}
              mostrarSugerencias={mostrarSugerencias}
              setMostrarSugerencias={setMostrarSugerencias}
            />
          </div>
        </div>

        <div className="carrito-container d-none d-md-block">
          <Link to="/carrito" className="btn btn-outline-primary position-relative">
            <FaShoppingCart />
            {cantidadCarrito > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cantidadCarrito}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TiendaHeader;
