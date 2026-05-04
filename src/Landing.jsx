// src/Landing.jsx

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import config from "./config";

// CSS del template (orden original)
import "./landingAssets/vendors/bootstrap/bootstrap.min.css";
import "./landingAssets/vendors/bootstrap-icons/font/bootstrap-icons.min.css";
import "./landingAssets/vendors/glightbox/glightbox.min.css";
import "./landingAssets/vendors/swiper/swiper-bundle.min.css";
import "./landingAssets/vendors/aos/aos.css";
import "./landingAssets/css/style.css";
//import "./landingAssets/vendors/bootstrap/bootstrap.bundle.min.js";
import { Helmet } from "react-helmet-async";
const LandingBelowFold = lazy(() => import("./LandingBelowFold"));
const HeroDesktopSlider = lazy(() => import("./HeroDesktopSlider"));

// Libs JS
//import GLightbox from "glightbox";
//import Swiper from "swiper";
//import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
//import AOS from "aos";

export default function Landing() {
  const navigate = useNavigate();
  const BRAND_ORANGE = "#ff6f2c";

  // 👉 Tiendas reales de ejemplo
  const tiendaMain = "dantequilodran";
  const tiendaAlt = "mawasdeportes";

  // ------------------------------
  // A/B test de titulares del HERO
  // ------------------------------
  const [abVariant, setAbVariant] = useState("A");
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const fromQuery = (qs.get("ab") || "").toUpperCase();
    const normalize = (v) => {
      if (["A", "B", "C"].includes(v)) return v;
      if (["1", "2", "3"].includes(v))
        return String.fromCharCode(64 + Number(v));
      return null;
    };
    const saved = localStorage.getItem("abVariant");
    const candidate = normalize(fromQuery) || normalize(saved);
    const chosen =
      candidate || ["A", "B", "C"][Math.floor(Math.random() * 3)];
    localStorage.setItem("abVariant", chosen);
    setAbVariant(chosen);
  }, []);

  const HERO_VARIANTS = {
  A: {
    title: (
      <>
        Vendé por WhatsApp con tu{" "}
        <span className="text-primary">catálogo online</span>
      </>
    ),
    description: (
      <>
        Creá tu catálogo en minutos, compartilo con tus clientes y recibí
        pedidos directo por WhatsApp. Ideal para comercios y servicios.
      </>
    ),
  },
  B: {
    title: (
      <>
        Catálogo online simple para{" "}
        <span className="text-primary">vender por WhatsApp</span>
      </>
    ),
    description: (
      <>
        Publicá tus productos o servicios, enviá tu link y empezá a recibir
        pedidos sin comisiones ni complicaciones.
      </>
    ),
  },
  C: {
    title: (
      <>
        Tu negocio online listo para{" "}
        <span className="text-primary">recibir pedidos por WhatsApp</span>
      </>
    ),
    description: (
      <>
        Creá tu catálogo en minutos y empezá a recibir pedidos por WhatsApp.
      </>
    ),
  },
};

  const heroCopy = HERO_VARIANTS[abVariant] || HERO_VARIANTS.A;

  // ------------------------------
  // Efectos UI originales
  // ------------------------------
  useEffect(() => {
    const offcanvasElement = document.getElementById("fbs__net-navbars");
    const toggleButton = document.querySelector(
      ".fbs__net-navbar-toggler"
    );

    const handleShow = () => {
      document.body.classList.add("offcanvas-active");
      if (toggleButton) toggleButton.classList.add("open");
    };
    const handleHide = () => {
      document.body.classList.remove("offcanvas-active");
      if (toggleButton) toggleButton.classList.remove("open");
    };

    if (offcanvasElement) {
      offcanvasElement.addEventListener("show.bs.offcanvas", handleShow);
      offcanvasElement.addEventListener("hidden.bs.offcanvas", handleHide);
    }
    return () => {
      if (offcanvasElement) {
        offcanvasElement.removeEventListener(
          "show.bs.offcanvas",
          handleShow
        );
        offcanvasElement.removeEventListener(
          "hidden.bs.offcanvas",
          handleHide
        );
      }
    };
  }, []);



  useEffect(() => {
    const navbar = document.querySelector(".fbs__net-navbar");
    const onScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      if (!navbar) return;
      if (y > 0) navbar.classList.add("active");
      else navbar.classList.remove("active");
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll(".section");
    const navLinks = document.querySelectorAll(
      ".fbs__net-navbar .scroll-link"
    );

    const removeActive = () =>
      navLinks.forEach((l) => l.classList.remove("active"));
    const addActive = (id) => {
      const a = document.querySelector(
        `.fbs__net-navbar .scroll-link[href="#${id}"]`
      );
      if (a) a.classList.add("active");
    };
    const current = () => {
      let id = null,
        min = Infinity;
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        const d = Math.abs(r.top - window.innerHeight / 4);
        if (d < min && r.top < window.innerHeight) {
          min = d;
          id = s.getAttribute("id");
        }
      });
      return id;
    };
    const update = () => {
      const id = current();
      if (id) {
        removeActive();
        addActive(id);
      }
    };
    window.addEventListener("scroll", update);
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

    useEffect(() => {
    let cancelled = false;

    const initBaseVisuals = async () => {
        const [{ default: AOS }, _bootstrap] = await Promise.all([
        import("aos"),
        import("./landingAssets/vendors/bootstrap/bootstrap.bundle.min.js"),
        ]);

        if (cancelled) return;

        AOS.init({
        duration: 800,
        easing: "slide",
        once: true,
        });
    };

    const timer = setTimeout(() => {
        initBaseVisuals();
    }, 300);

    return () => {
        cancelled = true;
        clearTimeout(timer);
    };
    }, []);
  /* ============================================================
     BLOQUE "EJEMPLO REAL" — fetch tienda + productos (2 tiendas)
  ============================================================ */
  const ejemploRef = useRef(null);
  const [shouldLoadEjemplo, setShouldLoadEjemplo] = useState(false);
  const [loadingEjemplo, setLoadingEjemplo] = useState(true);

  const [exampleMain, setExampleMain] = useState({
    shopName: "",
    phone: "",
    url: `https://${tiendaMain}.de10.app`,
    logo: "",
    items: [],
  });

  const [exampleAlt, setExampleAlt] = useState({
    shopName: "",
    phone: "",
    url: `https://${tiendaAlt}.de10.app`,
    logo: "",
    items: [],
  });

  // Resolvedor de imágenes
  const resolveImg = (src, type = "img") => {
    if (!src) return "/images/og-image.jpg";
    if (/^https?:\/\//i.test(src)) return src; // absoluto
    if (type === "logo") return `/backend/storage/logos/${src}`; // logo relativo
    return `/backend/storage/imgs/${src}`; // imágenes de productos
  };

  // helper para fetch de una tienda
  const fetchTiendaData = async (slug) => {
    const tiendaURL = `${config.apiBaseUrl}/tienda/${slug}`;
    const { data: tienda } = await axios.get(tiendaURL);

    const productosURL = `${config.apiBaseUrl}/tienda/${slug}/productos-inicio`;
    const { data: prodResp } = await axios.get(productosURL, {
      params: { per_page: 10 },
    });

    const rows = Array.isArray(prodResp?.data)
      ? prodResp.data
      : Array.isArray(prodResp)
      ? prodResp
      : [];

    const items = rows.map((p) => ({
      id: p.id || p.product_id,
      name: p.nombre,
      price: p.precio,
      img: p.imagen || (Array.isArray(p.galeria) ? p.galeria[0] : null),
    }));

    return {
      shopName: tienda?.name || tienda?.nombre || slug,
      phone: tienda?.phone || "",
      url: `https://${slug}.de10.app`,
      logo: tienda?.logo || "",
      items,
    };
  };
  const [geo, setGeo] = useState({
    country_code: "AR",
    pricing: {
      currency: "ARS",
      is_argentina: true,
    },
  });
    useEffect(() => {
    let cancelled = false;
    let timer = null;

    const loadGeo = async () => {
        try {
        const { data } = await axios.get(`${config.apiBaseUrl}/geo`);

        if (!cancelled && data) {
            setGeo({
            country_code: data.country_code || "AR",
            pricing: {
                currency: data?.pricing?.currency || "ARS",
                is_argentina: !!data?.pricing?.is_argentina,
            },
            });
        }
        } catch (error) {
        if (!cancelled) {
            setGeo({
            country_code: "AR",
            pricing: {
                currency: "ARS",
                is_argentina: true,
            },
            });
        }
        }
    };

    const run = () => {
        timer = window.setTimeout(loadGeo, 2500);
    };

    if (document.readyState === "complete") {
        run();
    } else {
        window.addEventListener("load", run, { once: true });
    }

    return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
        window.removeEventListener("load", run);
    };
    }, []); 

  const formatPlanPrice = () => {
    return geo?.pricing?.is_argentina ? "AR$4.990" : "US$3.99";
  };

    useEffect(() => {
    const timer = setTimeout(() => {
        setShouldLoadEjemplo(true);
    }, 1200);

    return () => clearTimeout(timer);
    }, []); 

useEffect(() => {
  if (!shouldLoadEjemplo) return;

  let cancelled = false;

  (async () => {
    try {
      const [dataMain, dataAlt] = await Promise.all([
        fetchTiendaData(tiendaMain),
        fetchTiendaData(tiendaAlt),
      ]);

      if (!cancelled) {
        setExampleMain(dataMain);
        setExampleAlt(dataAlt);
        setLoadingEjemplo(false);
      }
    } catch (e) {
      if (!cancelled) {
        setExampleMain((prev) => ({
          ...prev,
          shopName: prev.shopName || "Tienda ejemplo",
          phone: prev.phone || "",
          items: prev.items || [],
        }));
        setExampleAlt((prev) => ({
          ...prev,
          shopName: prev.shopName || "Tienda ejemplo",
          phone: prev.phone || "",
          items: prev.items || [],
        }));
        setLoadingEjemplo(false);
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}, [shouldLoadEjemplo]);

useEffect(() => {
  const loadAnalytics = () => {
    if (window.__gtmLoaded) return;
    window.__gtmLoaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-YNMN1XTRQX";
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", "G-YNMN1XTRQX");
  };

  const run = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 3000 });
    } else {
      setTimeout(loadAnalytics, 2500);
    }
  };

  if (document.readyState === "complete") {
    run();
  } else {
    window.addEventListener("load", run, { once: true });
  }

  return () => {
    window.removeEventListener("load", run);
  };
}, []);

  return (
    <>
      <Helmet>
        {/* Estilos específicos para el bloque “Ejemplo real” */}
        <style>{`
          .example-real h2 .brand { color: ${BRAND_ORANGE}; }
          .example-card {
            border: 1px solid rgba(0,0,0,.06);
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 8px 26px rgba(0,0,0,.06);
          }
          .shop-logo {
            width: 56px; height: 56px;
            border-radius: 12px;
            object-fit: contain;
            background: transparent;
            border: 1px solid rgba(0,0,0,.06);
          }
          .example-strip {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: minmax(180px, 1fr);
            gap: 16px;
            overflow-x: auto;
            padding: 2px 4px 10px;
            scroll-snap-type: x proximity;
          }
          .example-item {
            scroll-snap-align: start;
            border: 1px solid rgba(0,0,0,.06);
            border-radius: 16px;
            padding: 12px;
            background: #fff;
            height: 100%;
            display: flex; flex-direction: column; align-items: center;
          }
          .example-imgbox {
            width: 100%;
            aspect-ratio: 1/1;
            border-radius: 12px;
            overflow: hidden;
            background: transparent;
            border: 1px solid rgba(0,0,0,.06);
            display: grid; place-items: center;
            padding: .25rem;
          }
          .example-imgbox img {
            width: 100%; height: 100%;
            object-fit: contain;
            display: block; background: transparent;
          }
          .example-item-title {
            font-size: 0.98rem;
            line-height: 1.25;
            margin-top: 8px;
            width: 100%;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            min-height: calc(1.25em * 2);
          }
          .example-item-price { font-weight: 700; margin-top: 6px; }
          @media (max-width: 576px) {
            .example-strip { grid-auto-columns: minmax(160px, 75%); }
          }
        #back-to-top {
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: 48px;
        height: 48px;
        background: var(--color-naranja);
        color: #fff;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.3s ease;
        z-index: 9999;
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        #back-to-top.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        }

        #back-to-top:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.2);
        }            
        `}</style>

      <title>
        Catálogo Online para WhatsApp | de10.app
      </title>
      <meta
        name="description"
        content="Creá tu catálogo online y recibí pedidos por WhatsApp. Ideal para comercios y servicios que quieren vender sin comisiones."
      />
        <meta
          name="keywords"
          content="tienda online, catálogo, WhatsApp, carrito de compras, comercio local, servicios, de10"
        />
        <meta name="author" content="de10 👌" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://de10.app/" />

        <meta
          property="og:title"
          content="Vendé por WhatsApp con tu catálogo online"
        />
        <meta
          property="og:description"
          content="Creá tu catálogo online en minutos, compartilo con tus clientes y recibí pedidos por WhatsApp sin comisiones."
        />
        <meta property="og:url" content="https://de10.app/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://de10.app/images/og-image.jpg"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="de10.app - Tu tienda online lista en minutos"
        />
        <meta
          name="twitter:description"
          content="Catálogo para comercios y servicios. Sin comisiones."
        />
        <meta
          name="twitter:image"
          content="https://de10.app/images/og-image.jpg"
        />
      </Helmet>

      <div className="site-wrap">
        {/* HEADER */}
        <header className="fbs__net-navbar navbar navbar-expand-lg dark">
          <div className="container d-flex align-items-center justify-content-between">
            <a className="navbar-brand w-auto" href="/landing">
              <img
                className="logo dark img-fluid"
                src="/images/logo_mobile.png"
                alt="de10.app"
                width="140"
                height="40"
                loading="eager"
                fetchPriority="high"                
                style={{ width: "auto", height: "40px" }}
              />
            </a>

            <div
              className="offcanvas offcanvas-start w-75"
              id="fbs__net-navbars"
              tabIndex="-1"
              aria-labelledby="fbs__net-navbarsLabel"
            >
              <div className="offcanvas-header">
                <a
                  className="logo-link"
                  id="fbs__net-navbarsLabel"
                  href="/landing"
                >
              <img
                className="logo dark img-fluid"
                src="/images/logo_mobile.png"
                alt="de10.app"
                width="140"
                height="40"
                loading="lazy"
                style={{ width: "auto", height: "40px" }}
              />
                </a>
                <button
                  className="btn-close btn-close-black"
                  type="button"
                  data-bs-dismiss="offcanvas"
                  aria-label="Cerrar"
                ></button>
              </div>

              <div className="offcanvas-body align-items-lg-center">
                <ul className="navbar-nav nav me-auto ps-lg-5 mb-2 mb-lg-0">
                  <li className="nav-item">
                    <a
                      className="nav-link scroll-link active"
                      href="#home"
                    >
                      Inicio
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link scroll-link" href="#para-quien">
                      Para quién es
                    </a>
                  </li>
                    <li className="nav-item">
                      <a
                        className="nav-link scroll-link"
                        href="#ejemplo-real"
                      >
                        Ejemplo real
                      </a>
                    </li>
                  <li className="nav-item">
                    <a className="nav-link scroll-link" href="#nosotros">
                      Nosotros
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link scroll-link" href="#precios">
                      Precios
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link scroll-link"
                      href="#como-funciona"
                    >
                      Cómo Funciona
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link scroll-link" href="#contacto">
                      Contacto
                    </a>
                  </li>

                  {/* Solo en mobile: Ingresar al final */}
                  <li className="nav-item d-lg-none mt-3">
                    <Link
                      to="/login"
                      className="btn btn-primary w-100"
                    >
                      Ingresar
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="ms-auto w-auto">
              <div className="header-social d-flex align-items-center gap-1">
                <button
                  className="btn btn-primary btn-lg me-2"
                  onClick={() => navigate("/login")}
                >
                  Ingresar
                </button>
              </div>

              <button
                className="fbs__net-navbar-toggler justify-content-center align-items-center ms-auto"
                data-bs-toggle="offcanvas"
                data-bs-target="#fbs__net-navbars"
                aria-controls="fbs__net-navbars"
                aria-label="Toggle navigation"
                aria-expanded="false"
              >
                <svg
                  className="fbs__net-icon-menu"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="21" x2="3" y1="6" y2="6"></line>
                  <line x1="15" x2="3" y1="12" y2="12"></line>
                  <line x1="17" x2="3" y1="18" y2="18"></line>
                </svg>
                <svg
                  className="fbs__net-icon-close"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main>
          {/* HERO */}
          <section className="hero__v6 section" id="home">
            <div className="container">
              <div className="row align-items-center flex-column-reverse flex-lg-row">
                <div className="col-lg-6 mb-4 mb-lg-0">
                  <div className="row">
                    <div className="col-lg-12">
                      <span
                        className="hero-subtitle text-uppercase d-inline-block mb-2"
                        data-aos="fade-up"
                        data-aos-delay="0"
                      >
                        VENDÉ POR WHATSAPP SIN COMPLICACIONES
                      </span>

                      <div
                        className="d-flex align-items-center gap-2 mb-2"
                        data-aos="fade-up"
                        data-aos-delay="80"
                      >
                        <span className="badge rounded-pill text-bg-success">
                          Gratis
                        </span>
                        <span className="small text-muted">
                          por 15 días — Sin comisiones
                        </span>
                      </div>

                      <h1
                        className="hero-title mb-3 fw-bold"
                        data-aos="fade-up"
                        data-aos-delay="100"
                        style={{ maxWidth: "none" }}
                      >
                        {heroCopy.title}
                      </h1>

                      <p
                        className="hero-description mb-4 text-muted"
                        data-aos="fade-up"
                        data-aos-delay="200"
                      >
                        {heroCopy.description}{" "}
                        <Link
                          to="/vender-por-whatsapp"
                          className="fw-semibold text-decoration-none"
                        >
                          Cómo vender por WhatsApp
                        </Link>{" "}
                        y{" "}
                        <Link
                          to="/catalogo-digital"
                          className="fw-semibold text-decoration-none"
                        >
                          crear un catálogo digital
                        </Link>
                        {" "}
                        y{" "}
                        <Link
                          to="/tienda-online-ahora"
                          className="fw-semibold text-decoration-none"
                        >
                          crear una tienda online ahora
                        </Link>                      
                        {" "}y{" "}
                        <Link
                          to="/vender-por-internet-sin-pagina-web"
                          className="fw-semibold text-decoration-none"
                        >
                          vender por internet sin página web
                        </Link>
                        {" "}y{" "}
                        <Link
                          to="/empezar-a-vender-online"
                          className="fw-semibold text-decoration-none"
                        >
                          empezar a vender online
                        </Link>  
                        {" "}y{" "}
                        <Link
                          to="/herramientas-para-vender-por-whatsapp"
                          className="fw-semibold text-decoration-none"
                        >
                          comparar herramientas para vender por WhatsApp
                        </Link>  
                        </p>
                      <ul
                        className="list-unstyled mb-4"
                        data-aos="fade-up"
                        data-aos-delay="300"
                      >
                        <li className="mb-2">
                          <i
                            className="bi bi-cart-check-fill me-2"
                            style={{ color: BRAND_ORANGE }}
                          ></i>
                          Carrito y pedidos directos por WhatsApp
                        </li>
                        <li className="mb-2">
                          <i
                            className="bi bi-image me-2"
                            style={{ color: BRAND_ORANGE }}
                          ></i>
                          Catálogo propio con imágenes optimizadas
                        </li>
                        <li className="mb-2">
                          <i
                            className="bi bi-globe2 me-2"
                            style={{ color: BRAND_ORANGE }}
                          ></i>
                          Subdominio gratis — podés sumar dominio propio
                        </li>
                      </ul>

                      <div
                        data-aos="fade-up"
                        data-aos-delay="400"
                      >
                        <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap mt-4">
                          <a
                            href="http://demo.de10.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-lg btn-primary px-4"
                            style={{ fontWeight: "bold" }}
                          >
                            Ver ejemplo real
                          </a>
                          <Link
                            to="/registro"
                            className="btn btn-lg btn-primary px-4"
                            style={{ fontWeight: "bold" }}
                          >
                            Crear mi catálogo ahora!
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HERO visual */}
                <div
                  className="col-lg-6 text-center mb-4 mb-lg-0"
                  data-aos="fade-in"
                  data-aos-delay="200"
                >
                {isMobile ? (
                <div
                    className="rounded-4 shadow"
                    style={{
                    maxWidth: 480,
                    margin: "0 auto",
                    border: `3px solid ${BRAND_ORANGE}`,
                    borderRadius: 24,
                    background: "#fff",
                    minHeight: 420,
                    padding: 28,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    }}
                >
                    <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                        width: 56,
                        height: 56,
                        background: "#fff3ec",
                        color: BRAND_ORANGE,
                        }}
                    >
                        <i className="bi bi-bag fs-4"></i>
                    </div>
                    <div className="text-start">
                        <h3 className="h5 mb-0">Catálogo listo para vender</h3>
                        <small className="text-muted">
                        Compartí tu link y recibí pedidos
                        </small>
                    </div>
                    </div>

                    <ul className="list-unstyled d-grid gap-2 mt-3 text-start">
                    <li>
                        <i
                        className="bi bi-check-circle me-2"
                        style={{ color: BRAND_ORANGE }}
                        ></i>
                        Carrito de compras
                    </li>
                    <li>
                        <i
                        className="bi bi-check-circle me-2"
                        style={{ color: BRAND_ORANGE }}
                        ></i>
                        Pedidos por WhatsApp
                    </li>
                    <li>
                        <i
                        className="bi bi-check-circle me-2"
                        style={{ color: BRAND_ORANGE }}
                        ></i>
                        Panel simple y moderno
                    </li>
                    </ul>

                    <div className="text-end">
                    <span
                        className="badge rounded-pill"
                        style={{
                        backgroundColor: "#e8fff5",
                        color: "#198754",
                        }}
                    >
                        Rápido de configurar
                    </span>
                    </div>
                </div>
                ) : (
                <Suspense fallback={null}>
                    <HeroDesktopSlider BRAND_ORANGE={BRAND_ORANGE} />
                </Suspense>
                )}
                </div>
              </div>
            </div>
          </section>

            <Suspense fallback={null}>
            <LandingBelowFold
                BRAND_ORANGE={BRAND_ORANGE}
                formatPlanPrice={formatPlanPrice}
                ejemploRef={ejemploRef}
                shouldLoadEjemplo={shouldLoadEjemplo}
                loadingEjemplo={loadingEjemplo}
                exampleMain={exampleMain}
                exampleAlt={exampleAlt}
                resolveImg={resolveImg}
            />
            </Suspense>
        </main>
      </div>
    </>
  );
}
