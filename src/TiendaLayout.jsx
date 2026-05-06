import { useState, useEffect, useRef } from "react";
import {
  FaShoppingCart,
  FaBars,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaHome,
  FaWhatsapp,
  FaListUl,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import SpinnerCentrado from "./components/SpinnerCentrado";
import { Collapse } from "react-bootstrap";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import useSubdomain from "./hooks/useSubdomain";
import axios from "axios";
import config from "./config";
import { useCart } from "./context/CartContext";
import Carrito from "./Carrito";
import { sub } from "framer-motion/client";
import "./assets/tiendalayout.css";
import { formatPrice } from "./utils/formatPrice";


/* ----------------- Helpers de normalización ----------------- */
const pickProductos = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;               // [ ... ]
  if (Array.isArray(payload.data)) return payload.data;     // { data: [...] }
  const pag = payload.productos;
  if (Array.isArray(pag)) return pag;                       // { productos: [...] }
  if (pag && Array.isArray(pag.data)) return pag.data;      // { productos: { data:[...] } }
  return [];
};

const toImg = (p, base) => {
  if (!p) return "/images/no-image.jpg";
  const s = String(p);
  return /^https?:\/\//i.test(s) || s.startsWith("/") ? s : `${base}/${s}`;
};
/* ------------------------------------------------------------- */

function TiendaLayout() {
  
  const subdomain = useSubdomain();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectHome, setRedirectHome] = useState(false);

  const [tienda, setTienda] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [acordeonAbierto, setAcordeonAbierto] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [busquedaActiva, setBusquedaActiva] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [categoriasAbierto, setCategoriasAbierto] = useState(false);
  // Convierte el nombre de la sugerencia en una query buscable sin truncarlo.
  // Si el usuario hace click en una sugerencia, esperamos buscar por el nombre real
  // del producto, no por una versión resumida a 1–2 palabras.
  const buildQueryFromSuggestion = (prod) => {
    const raw = (prod?.nombre || prod?.name || "").toString();

    const noAccents = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return noAccents
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Refs para cerrar sugerencias al click fuera
  const mobileSearchRef = useRef(null);
  const desktopSearchRef = useRef(null);

  // NUEVO: ref del contenedor que scrollea
  const scrollAreaRef = useRef(null);

  // helper scroll top del contenedor (fallback a window)
  const scrollContentTop = (behavior = "smooth") => {
    const el = scrollAreaRef.current;
    if (el && typeof el.scrollTo === "function") {
      try { el.scrollTo({ top: 0, behavior }); } catch { el.scrollTop = 0; }
    } else {
      try { window.scrollTo({ top: 0, behavior }); } catch { window.scrollTo(0, 0); }
    }
  };

  const { carrito } = useCart();
  const cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);

  const categoriaActualId = location.pathname.includes("/categoria/")
    ? parseInt(location.pathname.split("/")[2])
    : null;
  const isHome = location.pathname === "/";
  const categoriaActual = categorias
    .flatMap((cat) =>
      (cat.subcategorias || []).map((sub) => ({
        ...sub,
        parentNombre: cat.nombre,
      }))
    )
    .find((sub) => sub.id === categoriaActualId);

  const categoryName = categoriaActual?.nombre || "";
  const parentCategoryName = categoriaActual?.parentNombre || "";

  useEffect(() => {
    if (!subdomain) return;

    axios
      .get(`${config.apiBaseUrl}/tienda/${subdomain}`)
      .then((res) => {
        if (!res.data || res.data.id === -1) {
          setRedirectHome(true);
          return;
        }

        setTienda(res.data);

        axios
          .get(`${config.apiBaseUrl}/tienda/${subdomain}/categorias`)
          .then((r) => setCategorias(r.data))
          .catch(() => setCategorias([]));
      })
      .catch((error) => {
        console.log("Error inesperado:", error);
        setRedirectHome(true);
      });
  }, [subdomain]);

  // Click fuera / Escape => cerrar sugerencias
  useEffect(() => {
    const handleDocClick = (e) => {
      const inMobile = mobileSearchRef.current?.contains(e.target);
      const inDesktop = desktopSearchRef.current?.contains(e.target);
      if (!inMobile && !inDesktop) setMostrarSugerencias(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setMostrarSugerencias(false);
    };
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const toggleAcordeon = (catId) => {
    setAcordeonAbierto((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleBusquedaChange = async (e) => {
    const texto = e.target.value;
    setBusqueda(texto);

    const q = texto.trim();
    if (q.length < 2 || !subdomain) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    try {
      const { data } = await axios.get(
        `${config.apiBaseUrl}/tienda/${subdomain}/buscar-productos`,
        { params: { q, page: 1 } }
      );

      const lista = pickProductos(data).slice(0, 6);
      setSugerencias(lista);
      setMostrarSugerencias(lista.length > 0);
    } catch (error) {
      console.error("Error buscando sugerencias:", error);
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  const irABusqueda = () => {
    const q = busqueda.trim();
    if (q.length > 2) {
      navigate(`/buscar?q=${encodeURIComponent(q)}`);
      setMostrarSugerencias(false);
      // scrolleo proactivo (el efecto igual lo hará al cambiar la ruta)
      scrollContentTop("smooth");
    }
  };

  // NUEVO: cada vez que cambia la ruta (o el search), subimos el contenedor
  useEffect(() => {
    // pequeño delay por si el Outlet tarda en renderizar
    requestAnimationFrame(() => scrollContentTop("smooth"));
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!location.pathname.startsWith("/buscar")) {
      setBusqueda("");
      setMostrarSugerencias(false);
    }
  }, [location.pathname]);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // En TiendaLayout.jsx
  useEffect(() => {
    // Quitamos favicons globales (los que NO vienen de Helmet)
    const toRemove = document.querySelectorAll(
      "link[rel='icon']:not([data-rh]), link[rel='shortcut icon']:not([data-rh]), link[rel='apple-touch-icon']:not([data-rh])"
    );
    toRemove.forEach((n) => n.parentNode?.removeChild(n));
  }, []);

  // ===== Helpers URL / WhatsApp =====
  const normalizeUrl = (url) => {
    if (!url) return "";
    const t = String(url).trim();
    return /^https?:\/\/|^mailto:|^tel:/i.test(t) ? t : `https://${t}`;
  };

  const isPlaceholderPhone = (raw) => {
    if (!raw) return true;
    const digits = String(raw).replace(/\D/g, "");
    return digits.length < 6 || /^0+$/.test(digits);
  };

  // Si el número no trae prefijo, asumo +54 (AR). Ajustá si necesitás otro default.
  const makeWhatsAppLink = (rawPhone) => {
    if (!rawPhone) return "";
    let digits = String(rawPhone).replace(/\D/g, "");
    digits = digits.replace(/^00/, "");
    if (/^\d{10}$/.test(digits)) digits = "54" + digits; // ejemplo AR
    return `https://wa.me/${digits}`;
  };

  // Evita que el lightbox se enganche a estos links
  const openExternal = (url, e) => {
    if (e) e.preventDefault();
    const u = normalizeUrl(url);
    window.open(u, "_blank", "noopener,noreferrer");
    if (window.innerWidth < 768) setCategoriasAbierto(false);
  };
  const openWhatsApp = (phone, e) => {
    if (e) e.preventDefault();
    const u = makeWhatsAppLink(phone);
    window.open(u, "_blank", "noopener,noreferrer");
    if (window.innerWidth < 768) setCategoriasAbierto(false);
  };

  if (redirectHome) {
    return (
      <div className="pantalla-error">
        <h2 className="text-danger">404 - Tienda no encontrada</h2>
        <p>Verificá la dirección e intentá nuevamente.</p>
        <a href="https://de10.app" className="btn btn-dark mt-3">Volver al inicio</a>
      </div>
    );
  }

  if (tienda === null && categorias.length === 0) {
    return <SpinnerCentrado mensaje="Cargando tienda..." />;
  }

  return (
    <>
      <Helmet>

        {(() => {
          const plain = (s) =>
            String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
          const clamp = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

          const DEFAULT_TITLE = `${tienda?.name ?? "Mi Tienda"} - de10.app`;
          const DEFAULT_DESC =
            "Catálogo online con carrito y WhatsApp. Hacé tu pedido y nos comunicaremos lo antes posible.";

          const path = typeof window !== "undefined" ? window.location.pathname : "";
          const isCategoryPage = path.startsWith("/categoria/");
          const isSearchPage = path.startsWith("/buscar");

          let title = plain(tienda?.welcome_title) || DEFAULT_TITLE;
          let description = clamp(
            plain(tienda?.welcome_subtitle) || DEFAULT_DESC,
            160
          );

          if (isCategoryPage && categoryName && parentCategoryName) {
            title = `${plain(categoryName)} | ${plain(tienda?.name ?? "Mi Tienda")}`;
            description = clamp(
              `Estás viendo ${plain(categoryName)} dentro de ${plain(parentCategoryName)} en ${plain(tienda?.name ?? "Mi Tienda")}. Comprá online y confirmá por WhatsApp.`,
              160
            );
          }

          if (isSearchPage) {
            const q =
              typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("q") || ""
                : "";

            if (q.trim()) {
              title = `Resultados para ${plain(q)} | ${plain(tienda?.name ?? "Mi Tienda")}`;
              description = clamp(
                `Resultados de búsqueda para ${plain(q)} en ${plain(tienda?.name ?? "Mi Tienda")}. Comprá online y confirmá por WhatsApp.`,
                160
              );
            }
          }

          const subdomain = (typeof window !== "undefined" && window.location.hostname) || "";
          typeof window !== "undefined" ? window.location.hostname : "";

          const isDemoStore = subdomain === "demo.de10.app";

          const shouldNoIndex = isDemoStore;

          let canonical = "";

          if (typeof window !== "undefined") {
            canonical = `${window.location.origin}${window.location.pathname}`;
          }

          if (isDemoStore) {
            canonical = "https://de10.app/";
          }

          let siteBaseUrl = "";

          if (typeof window !== "undefined") {
            siteBaseUrl = window.location.origin;
          }

          if (isDemoStore) {
            siteBaseUrl = "https://de10.app";
          }          
           // subdomain.includes(".") ? `https://${subdomain}/` : `https://${subdomain}.de10.app/`;

          const ogImage =
            typeof tienda?.logo === "string" && tienda.logo
              ? tienda.logo
              : "https://de10.app/images/og-image.jpg";

          return (
            <>
              {/* Título y descripción usados por Google */}
              <title>{title}</title>

              <meta name="description" content={description} />
              <meta
                  name="robots"
                  content={shouldNoIndex ? "noindex, nofollow" : "index, follow"}
                />
              <link rel="canonical" href={canonical} />

              {tienda?.logo && (() => {
                const bust = tienda.updated_at ? `?v=${encodeURIComponent(tienda.updated_at)}` : `?v=${Date.now()}`;
                const src = `${tienda.logo}${tienda.logo.includes('?') ? '' : bust}`;
                return (
                  <>
                    <link rel="icon" type="image/png" sizes="32x32" href={src} key="icon-32" />
                    <link rel="icon" type="image/png" sizes="16x16" href={src} key="icon-16" />
                    <link rel="shortcut icon" href={src} key="icon-shortcut" />
                    <link rel="apple-touch-icon" sizes="180x180" href={src} key="icon-apple" />
                  </>
                );
              })()}

              {/* Open Graph / Twitter */}
              <meta property="og:type" content="website" />
              <meta property="og:url" content={canonical} />
              <meta property="og:title" content={title} />
              <meta property="og:description" content={description} />
              <meta property="og:image" content={ogImage} />
              <meta property="og:site_name" content={tienda?.name ?? "de10.app"} />

              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={title} />
              <meta name="twitter:description" content={description} />
              <meta name="twitter:image" content={ogImage} />

              {/* JSON-LD: Store + WebSite con buscador */}
              <script type="application/ld+json">
                {JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Store",
                  name: tienda?.name ?? "Mi Tienda",
                  url: canonical.replace(/\/+$/, ""),
                  image: ogImage,
                  description: description,
                  address: { "@type": "PostalAddress", addressCountry: "AR" },
                  brand: {
                    "@type": "Brand",
                    name: tienda?.name ?? "Mi Tienda",
                    logo: ogImage,
                  },
                })}
              </script>
              <script type="application/ld+json">
                {JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  name: tienda?.name ?? "Mi Tienda",
                  url: `${siteBaseUrl}/`,
                  potentialAction: {
                    "@type": "SearchAction",
                    target: `${siteBaseUrl}/buscar?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                  },
                })}
              </script>
            </>
          );
        })()}
      </Helmet>


      <div className="tienda-layout">
        <div className="layout-header w-100">
          {/* MOBILE HEADER */}
          <div className="d-md-none w-100">
            <div className="d-flex justify-content-between align-items-center px-2 py-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setCategoriasAbierto(true)}
              >
                <FaBars />
              </button>

              <div
                className="flex-grow-1 mx-2 position-relative"
                ref={mobileSearchRef}
              >
              <div className="mobile-header-center">  
                {!busquedaActiva ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <img
                      src={tienda.logo}
                      alt={tienda.name}
                      className="logo-mobile"
                      style={{
                        height: 48,
                        maxWidth:  180,
                        objectFit: "contain",
                      }}
                    />
                  </div>                  
                ) : (
                  <form
                    className="d-flex"
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
                      autoFocus
                    />
                  </form>
                )}
              </div>
                {busquedaActiva && mostrarSugerencias && sugerencias.length > 0 && (
                <ul className="sugerencias-lista">
                  {sugerencias.map((prod, index) => {
                    const nombre = (prod.nombre || prod.name || "").trim();
                    const precioRaw = prod.precio ?? prod.price;
                    const tienePrecio = !isNaN(parseFloat(precioRaw));

                    return (
                      <li
                        key={`${prod.id}-${index}`}
                        className="sugerencia-item"
                        // onMouseDown evita que el blur del input desmonte la lista antes de navegar
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const q = buildQueryFromSuggestion(prod); // <- compactamos la query
                          if (!q) return;
                          navigate({ pathname: "/buscar", search: `?q=${encodeURIComponent(q)}` });
                          setMostrarSugerencias(false);
                          scrollContentTop("smooth");
                        }}
                      >
                        <img
                          src={toImg(prod.imagen || prod.image, config.imageBaseUrl)}
                          alt={nombre}
                        />
                        <div className="sugerencia-info">
                          <span>{nombre}</span>
                          {tienePrecio && (
                            <span className="precio">
                              {formatPrice(precioRaw)}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>


                )}
              </div>

              <div className="d-flex align-items-center gap-1">
                {cantidadCarrito > 0 && !busquedaActiva && (
                  <button
                    className="btn btn-outline-primary position-relative"
                    onClick={() => setCarritoAbierto(true)}
                  >
                    <FaShoppingCart className="icono-blanco" />
                    {cantidadCarrito > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {cantidadCarrito}
                      </span>
                    )}
                  </button>
                )}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    const next = !busquedaActiva;
                    setBusquedaActiva(next);
                    if (!next) setMostrarSugerencias(false);
                  }}
                >
                  {busquedaActiva ? "✕" : <FaSearch className="icono-blanco" />}
                </button>
              </div>
            </div>
          </div>

          {/* DESKTOP HEADER */}
          <div className="desktop-header-grid d-none d-md-grid px-3 py-2 w-100">
  
            <div className="logo-col d-flex justify-content-center align-items-center">

              
              {tienda.logo && typeof tienda.logo === "string" && (

                <img
                  src={tienda.logo}
                  alt={tienda.name}
                  className="logo-tienda me-2 d-none d-md-block"
                />
              )}
              {!tienda.logo || typeof tienda.logo !== "string" ? (
                <span className="fw-bold fs-5 d-none d-md-block">{tienda.name}</span>
              ) : (
                <span className="fw-bold fs-5 d-block d-md-none">{tienda.name}</span>
              )}
            </div>

            <div
              className="flex-grow-1 mx-3 position-relative"
              style={{ maxWidth: "60%" }}
              ref={desktopSearchRef}
            >
              <form
                className="input-group"
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
                  <FaSearch className="icono-blanco" />
                </button>
              </form>

              {mostrarSugerencias && sugerencias.length > 0 && (
              <ul className="sugerencias-lista">
                {sugerencias.map((prod, index) => {
                  const nombre = (prod.nombre || prod.name || "").trim();
                  const precioRaw = prod.precio ?? prod.price;
                  const tienePrecio = !isNaN(parseFloat(precioRaw));

                  return (
                    <li
                      key={`${prod.id}-${index}`}
                      className="sugerencia-item"
                      // onMouseDown evita que el blur del input desmonte la lista antes de navegar
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const q = buildQueryFromSuggestion(prod); // <- compactamos la query
                        if (!q) return;
                        navigate({ pathname: "/buscar", search: `?q=${encodeURIComponent(q)}` });
                        setMostrarSugerencias(false);
                        scrollContentTop("smooth");
                      }}
                    >
                      <img
                        src={toImg(prod.imagen || prod.image, config.imageBaseUrl)}
                        alt={nombre}
                      />
                      <div className="sugerencia-info">
                        <span>{nombre}</span>
                        {tienePrecio && (
                          <span className="precio">
                            {formatPrice(precioRaw)}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>


              )}
            </div>

            <div className="d-none d-md-block">
              <Link to="/carrito" className="btn btn-outline-primary position-relative">
                <FaShoppingCart className="icono-blanco" />
                {cantidadCarrito > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cantidadCarrito}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {carritoAbierto && (
          <div className="carrito-overlay" onClick={() => setCarritoAbierto(false)} />
        )}

        <div className={`carrito-sidebar ${carritoAbierto ? "abierto" : ""}`}>
          <div className="carrito-header d-flex justify-content-between align-items-center p-3 border-bottom">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <FaShoppingCart className="icono-blanco text-naranja" />
              Tu Compra
            </h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setCarritoAbierto(false)}>✕</button>
          </div>
          <div className="carrito-body flex-grow-1 overflow-auto p-3">
            {carritoAbierto ? <Carrito inline /> : null}
          </div>
        </div>

        {/* BACKDROP cuando está abierto en mobile */}
        {!isDesktop && categoriasAbierto && (
          <div className="carrito-overlay" onClick={() => setCategoriasAbierto(false)}></div>
        )}

        {/* >>> Scroll container con ref <<< */}
        <div ref={scrollAreaRef} className="tienda-scroll-area">
          <div className={`offcanvas-categorias ${isDesktop ? "visible-desktop" : categoriasAbierto ? "show" : ""}`}>
            {/* Header offcanvas (mobile) */}
            <div className="offcanvas-header d-flex justify-content-between align-items-center p-3 border-bottom d-md-none">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FaListUl className="icono-blanco text-naranja" />
                Secciones
              </h5>
              <button
                className="btn btn-sm btn-outline-secondary btn-close-mobile d-md-none"
                onClick={() => setCategoriasAbierto(false)}
              >
                ✕
              </button>
            </div>

            {/* Contenido scrollable */}
            <div className="contenido-categorias">
              {/* Inicio */}
              <Link
                to="/"
                onClick={() => {
                  if (window.innerWidth < 768) setCategoriasAbierto(false);
                  scrollContentTop("smooth");
                }}
                className={`hover-link d-flex align-items-center gap-2 w-100 mb-3 text-decoration-none ${
                  categoriaActualId === null ? "fw-bold text-primary" : "text-secondary"
                }`}
              >
                <FaHome className="text-primary" />
                <span className="mb-0">Inicio</span>
              </Link>

              {/* Redes/Contacto */}
              {(tienda?.phone || tienda?.instagram_url || tienda?.facebook_url) && (
                <div className="mb-3">
                  {tienda?.phone && !isPlaceholderPhone(tienda.phone) && (
                    <a
                      href={makeWhatsAppLink(tienda.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-lightbox d-flex align-items-center gap-2 w-100 mb-2 text-decoration-none hover-link"
                      data-lightbox="ignore"
                      data-fancybox="ignore"
                      data-pswp-ignore="true"
                      onClick={(e) => openWhatsApp(tienda.phone, e)}
                      aria-label="WhatsApp"
                      title={tienda.phone}
                    >
                      <FaWhatsapp className="text-success" />
                      <span className="mb-0">WhatsApp</span>
                    </a>
                  )}

                  {tienda?.instagram_url && (
                    <a
                      href={normalizeUrl(tienda.instagram_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-lightbox d-flex align-items-center gap-2 w-100 mb-2 text-decoration-none hover-link"
                      data-lightbox="ignore"
                      data-fancybox="ignore"
                      data-pswp-ignore="true"
                      onClick={(e) => openExternal(tienda.instagram_url, e)}
                      aria-label="Instagram"
                      title={tienda.instagram_url}
                    >
                      <FaInstagram className="text-secondary" />
                      <span className="mb-0">Instagram</span>
                    </a>
                  )}

                  {tienda?.facebook_url && (
                    <a
                      href={normalizeUrl(tienda.facebook_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-lightbox d-flex align-items-center gap-2 w-100 text-decoration-none hover-link"
                      data-lightbox="ignore"
                      data-fancybox="ignore"
                      data-pswp-ignore="true"
                      onClick={(e) => openExternal(tienda.facebook_url, e)}
                      aria-label="Facebook"
                      title={tienda.facebook_url}
                    >
                      <FaFacebook className="text-secondary" />
                      <span className="mb-0">Facebook</span>
                    </a>
                  )}
                </div>
              )}

              {/* Categorías */}
              {categorias.map((cat) => (
                <div key={cat.id} className="mb-3">
                  <div className="d-flex align-items-center" onClick={() => toggleAcordeon(cat.id)}>
                    {cat.nombre}
                    <span className="collapse-icon ms-auto">
                      {acordeonAbierto[cat.id] ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                  <Collapse in={acordeonAbierto[cat.id]}>
                    <div className="mt-2">
                      {(cat.subcategorias || []).map((sub) => (
                        <div key={sub.id} className="ms-3 py-1">
                          <Link
                            to={`/categoria/${sub.id}/${sub.modo}`}
                            onClick={() => {
                              if (window.innerWidth < 768) setCategoriasAbierto(false);
                              scrollContentTop("smooth");
                            }}
                            className={`text-decoration-none d-block hover-subcategoria ${
                              sub.id === categoriaActualId ? "fw-bold text-primary" : ""
                            }`}
                          >
                            {sub.nombre}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </div>
              ))}
            </div>
          </div>

          <div className="contenido-scrollable">
            <div key={location.key} className="route-fade">
              <Outlet context={{ tienda }} />
            </div>
          </div>
        </div>

        <div className="footer-fijo">
          <img src="/images/logo.fw.png" alt="de10" />
          <span>
            Sitio creado por{" "}
            <a href="https://www.de10.app" target="_blank" rel="noopener noreferrer">
              de10.app
            </a>{" "}
            © 2025
          </span>
        </div>
      </div>
    </>
  );
}

export default TiendaLayout;
