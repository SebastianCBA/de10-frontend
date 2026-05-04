// src/components/TiendaSidebar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function TiendaSidebar({ categorias = [], menuAbierto, setMenuAbierto }) {
  const location = useLocation();
  const [acordeonAbierto, setAcordeonAbierto] = useState({});

  const toggleCategoria = (catId) => {
    setAcordeonAbierto((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const cerrarMenuMobile = () => {
    if (window.innerWidth < 768) {
      setMenuAbierto(false);
    }
  };

  return (
    <div className={`sidebar-categorias ${menuAbierto ? "abierto" : ""}`}>
      <ul className="list-group list-group-flush">
        {categorias.map((categoria) => (
          <li key={categoria.id} className="list-group-item px-2 py-1">
            {categoria.subcategorias && categoria.subcategorias.length > 0 ? (
              <>
                <div
                  className="d-flex justify-content-between align-items-center categoria-titulo"
                  onClick={() => toggleCategoria(categoria.id)}
                >
                  <span className="fw-bold">{categoria.name}</span>
                  {acordeonAbierto[categoria.id] ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {acordeonAbierto[categoria.id] && (
                  <ul className="list-unstyled ms-3 mt-2">
                    {categoria.subcategorias.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          to={`/categoria/${sub.id}/${sub.slug}`}
                          onClick={cerrarMenuMobile}
                          className={`d-block py-1 small ${
                            location.pathname === `/categoria/${sub.id}/${sub.slug}` ? "active" : ""
                          }`}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={`/categoria/${categoria.id}/${categoria.slug}`}
                onClick={cerrarMenuMobile}
                className={`d-block fw-bold ${
                  location.pathname === `/categoria/${categoria.id}/${categoria.slug}` ? "active" : ""
                }`}
              >
                {categoria.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TiendaSidebar;
