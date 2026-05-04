// src/Landing.jsx
import { useEffect, useState, useRef } from "react";
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
    const backToTopButton = document.getElementById("back-to-top");
    const handleScroll = () => {
      if (!backToTopButton) return;
      if (window.scrollY > 170) backToTopButton.classList.add("show");
      else backToTopButton.classList.remove("show");
    };
    const handleClick = () =>
      window.scrollTo({ top: 0, behavior: "smooth" });

    if (backToTopButton)
      backToTopButton.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (backToTopButton)
        backToTopButton.removeEventListener("click", handleClick);
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

  // Init libs visuales (evitar doble init de Swiper)
  useEffect(() => {
    let heroSwiperInstance = null;
    let otherSwipers = [];
    let cancelled = false;

    const initVisualLibs = async () => {
      const [
        { default: AOS },
        { default: Swiper },
        swiperModules,
        _bootstrap,
      ] = await Promise.all([
        import("aos"),
        import("swiper"),
        import("swiper/modules"),
        import("./landingAssets/vendors/bootstrap/bootstrap.bundle.min.js"),
      ]);

      if (cancelled) return;

      const { Navigation, Pagination, Autoplay, EffectFade } = swiperModules;

      AOS.init({ duration: 800, easing: "slide", once: true });

      document.querySelectorAll(".swiper:not(.hero-swiper)").forEach((el) => {
        const instance = new Swiper(el, {
          modules: [Navigation, Pagination, Autoplay, EffectFade],
          loop: true,
          pagination: { el: el.querySelector(".swiper-pagination") },
          navigation: {
            nextEl: el.querySelector(".swiper-button-next"),
            prevEl: el.querySelector(".swiper-button-prev"),
          },
        });
        otherSwipers.push(instance);
      });

      heroSwiperInstance = new Swiper(".hero-swiper", {
        modules: [Navigation, Pagination, Autoplay, EffectFade],
        loop: true,
        speed: 600,
        effect: "fade",
        fadeEffect: { crossFade: true },
        autoplay: { delay: 3500, disableOnInteraction: false },
        pagination: {
          el: ".hero-swiper .swiper-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".hero-swiper .swiper-button-next",
          prevEl: ".hero-swiper .swiper-button-prev",
        },
        observer: true,
        observeParents: true,
        autoHeight: true,
      });
    };

    const timer = setTimeout(() => {
      initVisualLibs();
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (heroSwiperInstance) heroSwiperInstance.destroy(true, true);
      otherSwipers.forEach((s) => s.destroy(true, true));
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

    (async () => {
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
    })();

    return () => {
      cancelled = true;
    };
  }, []);  

  const formatPlanPrice = () => {
    return geo?.pricing?.is_argentina ? "AR$4.990" : "US$3.99";
  };

  useEffect(() => {
    const el = ejemploRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadEjemplo(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "300px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
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
        `}</style>

        {/* SEO Land */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-YNMN1XTRQX"
        ></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YNMN1XTRQX');
        `}</script>

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
                fetchpriority="high"                
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
                loading="eager"
                fetchpriority="high"                
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

                {/* Carrusel HERO */}
                <div
                  className="col-lg-6 text-center mb-4 mb-lg-0"
                  data-aos="fade-in"
                  data-aos-delay="200"
                >
                  <div
                    className="hero-swiper swiper rounded-4 shadow"
                    style={{
                      position: "relative",
                      maxWidth: 480,
                      margin: "0 auto",
                      border: `3px solid ${BRAND_ORANGE}`,
                      borderRadius: 24,
                      background: "#fff",
                      "--swiper-navigation-color": BRAND_ORANGE,
                      "--swiper-pagination-color": BRAND_ORANGE,
                      "--swiper-navigation-size": "18px",
                    }}
                  >
                    <div className="swiper-wrapper">
                      <div className="swiper-slide">
                        <div
                          className="rounded-4"
                          style={{
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
                            <div>
                              <h3 className="h5 mb-0">
                                Catálogo listo para vender
                              </h3>
                              <small className="text-muted">
                                Compartí tu link y recibí pedidos
                              </small>
                            </div>
                          </div>
                          <ul className="list-unstyled d-grid gap-2 mt-3">
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
                      </div>

                      <div className="swiper-slide">
                        <div
                          className="rounded-4"
                          style={{
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
                                background: "#eafaf0",
                                color: "#2ebb6c",
                              }}
                            >
                              <i className="bi bi-whatsapp fs-4"></i>
                            </div>
                            <div>
                              <h3 className="h5 mb-0">
                                Ventas directas por WhatsApp
                              </h3>
                              <small className="text-muted">
                                Sin comisiones ni intermediarios
                              </small>
                            </div>
                          </div>
                          <ul className="list-unstyled d-grid gap-2 mt-3">
                            <li>
                              <i className="bi bi-check-circle me-2 text-success"></i>
                              Recibí el pedido en segundos
                            </li>
                            <li>
                              <i className="bi bi-check-circle me-2 text-success"></i>
                              Conversá y cerrá la venta
                            </li>
                            <li>
                              <i className="bi bi-check-circle me-2 text-success"></i>
                              Disponible 24/7
                            </li>
                          </ul>
                          <div className="text-end">
                            <span className="badge rounded-pill text-bg-success">
                              Sin comisiones
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="swiper-slide">
                        <div
                          className="rounded-4"
                          style={{
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
                                background: "#fff0f0",
                                color: "#dc3545",
                              }}
                            >
                              <i className="bi bi-box-seam fs-4"></i>
                            </div>
                            <div>
                              <h3 className="h5 mb-0">
                                Mostrá lo que vendés
                              </h3>
                              <small className="text-muted">
                                Fotos, precio y stock al día
                              </small>
                            </div>
                          </div>
                          <p className="mt-3 mb-0">
                            Publicá tus productos o servicios con fotos,
                            precio y descripción clara. Mostrales a tus
                            clientes que estás activo y disponible.
                          </p>
                          <div className="text-end">
                            <span className="badge rounded-pill text-bg-danger">
                              Todo bajo tu marca
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="swiper-pagination"></div>
                    <div
                      className="swiper-button-prev"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "9999px",
                        background: "rgba(255,111,44,.08)",
                        backdropFilter: "blur(2px)",
                        zIndex: 10,
                      }}
                    ></div>
                    <div
                      className="swiper-button-next"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "9999px",
                        background: "rgba(255,111,44,.08)",
                        backdropFilter: "blur(2px)",
                        zIndex: 10,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PARA QUIÉN ES */}
          <section className="section" id="para-quien">
            <div className="container">
              <div className="row mb-5">
                <div className="col-md-10 mx-auto text-center">
                  <span
                    className="subtitle text-uppercase mb-3"
                    data-aos="fade-up"
                    data-aos-delay="0"
                  >
                    Para quién es
                  </span>
                  <h2
                    className="mb-3"
                    data-aos="fade-up"
                    data-aos-delay="100"
                  >
                    Es para vos si  {" "} 
                    <span className="text-primary">
                      vendés algo o brindás un servicio
                    </span>
                  </h2>
                  <p
                    className="text-muted"
                    data-aos="fade-up"
                    data-aos-delay="200"
                  >
                    Creá tu catálogo en minutos, compartí tu link y empezá a recibir pedidos por WhatsApp sin pagar comisiones.
                  </p>
                </div>
              </div>

              <p
                className="text-center fw-semibold mb-4"
                data-aos="fade-up"
                data-aos-delay="250"
              >
                No importa qué vendas:
              </p>

              <div className="row g-3 g-md-4">
                {[
                  { icon: "bi-basket", label: "Almacenes y despensas" },
                  { icon: "bi-shop", label: "Comercios en general" },
                  { icon: "bi-egg-fried", label: "Gastronomía y rotiserías" },
                  { icon: "bi-bag-check", label: "Venta por catálogo" },
                  { icon: "bi-heart", label: "Dietéticas / salud" },
                  { icon: "bi-scissors", label: "Peluquerías y estética" },
                  { icon: "bi-tools", label: "Servicios técnicos" },
                  { icon: "bi-briefcase", label: "Profesionales / estudios" },
                ].map((item, idx) => (
                  <div
                    className="col-6 col-md-3"
                    key={idx}
                    data-aos="fade-up"
                    data-aos-delay={100 + idx * 50}
                  >
                    <div className="h-100 p-3 p-md-4 rounded-4 border text-center shadow-sm bg-white">
                      <div className="mb-2">
                        <i
                          className={`bi ${item.icon}`}
                          style={{
                            fontSize: "1.8rem",
                            color: "var(--bs-primary)",
                          }}
                        ></i>
                      </div>
                      <div className="fw-semibold">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <p
                className="text-center mt-3 text-muted"
                data-aos="fade-up"
                data-aos-delay="550"
              >
                También rubros <b>abstractos o a medida</b> — por ejemplo,{" "}
                <i>verdulerías, inmobiliarias</i>, emprendedores y cualquier
                otro rubro.
              </p>

              <div
                className="text-center mt-2"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <Link
                  to="/registro"
                  className="btn btn-primary btn-lg"
                >
                   Crear mi catálogo ahora
                </Link>
              </div>
            </div>
          </section>

          {/* ============================================================
             EJEMPLO REAL
          ============================================================ */}
          <section
              className="section example-real"
              id="ejemplo-real"
              ref={ejemploRef}
            >
            <div className="container">
              <div className="row mb-4">
                <div className="col-md-10 mx-auto text-center">
                  <div
                    className="text-uppercase small fw-bold text-muted"
                    style={{ letterSpacing: ".12em" }}
                  >
                    Ejemplo real
                  </div>
                  <h2 className="mt-2">
                    Mirá tiendas creadas con{" "}
                    <span className="brand">de10.app</span>
                  </h2>
                  <p className="text-muted">
                    Esto no es un mockup: son tiendas reales activas.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                {/* Tarjeta tienda principal */}
                <div className="col-12 col-lg-6">
                  <div className="example-card p-3 p-md-4 h-100 d-flex flex-column">
                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between example-header flex-wrap gap-3">
                      <div className="d-flex align-items-center gap-3">
                        {/* Logo real */}
                        <img
                          className="shop-logo"
                          src={
                            exampleMain.logo
                              ? resolveImg(exampleMain.logo, "logo")
                              : "/images/logo-placeholder.svg"
                          }
                          alt={`${exampleMain.shopName || "Tienda"} logo`}
                          loading="lazy"
                        />
                        <div>
                          <div className="fw-bold h5 mb-1">
                            {exampleMain.shopName || "Tienda"}
                          </div>
                          {!!exampleMain.phone && (
                            <div className="text-muted small">
                              WhatsApp:{" "}
                              <span className="fw-semibold">
                                {exampleMain.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <a
                        className="btn btn-lg btn-primary"
                        href={exampleMain.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visitar tienda
                      </a>
                    </div>

                    {/* Productos (scroll horizontal) */}
                    <div className="mt-3 flex-grow-1 d-flex flex-column">
                        {!shouldLoadEjemplo ? (
                          <div className="text-muted">
                            Deslizá para ver ejemplos reales.
                          </div>
                        ) : loadingEjemplo ? (
                          <div className="text-muted">
                            Cargando productos…
                          </div>
                        ) : (
                        <div className="example-strip">
                          {exampleMain.items.map((it) => (
                            <div key={it.id} className="example-item">
                              <div className="example-imgbox">
                                <img
                                  src={resolveImg(it?.img)}
                                  alt={it?.name || "Producto"}
                                  loading="lazy"
                                />
                              </div>
                              <div className="example-item-title">
                                {it?.name}
                              </div>
                              <div className="example-item-price">
                                $
                                {Number(it?.price || 0).toLocaleString(
                                  "es-AR"
                                )}
                              </div>
                            </div>
                          ))}
                          {exampleMain.items.length === 0 && (
                            <div className="text-muted">
                              Sin productos para mostrar.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tarjeta tienda alternativa */}
                <div className="col-12 col-lg-6">
                  <div className="example-card p-3 p-md-4 h-100 d-flex flex-column">
                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between example-header flex-wrap gap-3">
                      <div className="d-flex align-items-center gap-3">
                        {/* Logo real */}
                        <img
                          className="shop-logo"
                          src={
                            exampleAlt.logo
                              ? resolveImg(exampleAlt.logo, "logo")
                              : "/images/logo-placeholder.svg"
                          }
                          alt={`${exampleAlt.shopName || "Tienda"} logo`}
                          loading="lazy"
                        />
                        <div>
                          <div className="fw-bold h5 mb-1">
                            {exampleAlt.shopName || "Tienda"}
                          </div>
                          {!!exampleAlt.phone && (
                            <div className="text-muted small">
                              WhatsApp:{" "}
                              <span className="fw-semibold">
                                {exampleAlt.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <a
                        className="btn btn-lg btn-primary"
                        href={exampleAlt.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visitar tienda
                      </a>
                    </div>

                    {/* Productos (scroll horizontal) */}
                    <div className="mt-3 flex-grow-1 d-flex flex-column">
                        {!shouldLoadEjemplo ? (
                          <div className="text-muted">
                            Deslizá para ver ejemplos reales.
                          </div>
                        ) : loadingEjemplo ? (
                          <div className="text-muted">
                            Cargando productos…
                          </div>
                        ) : (
                        <div className="example-strip">
                          {exampleAlt.items.map((it) => (
                            <div key={it.id} className="example-item">
                              <div className="example-imgbox">
                                <img
                                  src={resolveImg(it?.img)}
                                  alt={it?.name || "Producto"}
                                  loading="lazy"
                                />
                              </div>
                              <div className="example-item-title">
                                {it?.name}
                              </div>
                              <div className="example-item-price">
                                $
                                {Number(it?.price || 0).toLocaleString(
                                  "es-AR"
                                )}
                              </div>
                            </div>
                          ))}
                          {exampleAlt.items.length === 0 && (
                            <div className="text-muted">
                              Sin productos para mostrar.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* NOSOTROS */}
          <section className="about__v4 section" id="nosotros">
            <div className="container">
              <div className="row">
                <div className="col-md-6 order-md-2">
                  <div className="row justify-content-end">
                    <div className="col-md-11 mb-4 mb-md-0">
                      <span
                        className="subtitle text-uppercase mb-3"
                        data-aos="fade-up"
                        data-aos-delay="0"
                      >
                        VENDÉ POR WHATSAPP SIN COMPLICACIONES
                      </span>
                      <h2
                        className="mb-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                      >
                        Transformamos tu forma de vender con una plataforma
                        segura, simple y pensada para tu negocio
                      </h2>
                      <div
                        data-aos="fade-up"
                        data-aos-delay="200"
                      >
                        <p>
                          Vendé por WhatsApp en minutos con tu propio catálogo online.
                          Creá tu tienda, mostrale tus productos a tus clientes y recibí pedidos directo en WhatsApp.
                          No necesitás conocimientos técnicos y podés empezar hoy mismo.
                        </p>
                        <p>
                          Nacimos con la idea de facilitarle la vida a miles
                          de pequeños comercios y profesionales que quieren
                          dar el salto digital. Somos un equipo que desarrolló
                          de10.app: una solución accesible, confiable y
                          poderosa para vender online sin complicaciones.
                        </p>
                        <p>
                          Con de10.app cualquier negocio puede ofrecer sus
                          productos o servicios con catálogo, carrito y
                          recibir pedidos directo por WhatsApp.
                        </p>
                      </div>
                      <h4
                        className="small fw-bold mt-4 mb-3"
                        data-aos="fade-up"
                        data-aos-delay="300"
                      >
                        Nuestros valores
                      </h4>
                      <ul
                        className="d-flex flex-row flex-wrap list-unstyled gap-3 features"
                        data-aos="fade-up"
                        data-aos-delay="400"
                      >
                        <li className="d-flex align-items-center gap-2">
                          <span className="icon rounded-circle text-center">
                            <i className="bi bi-check"></i>
                          </span>
                          <span className="text">Simplicidad</span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                          <span className="icon rounded-circle text-center">
                            <i className="bi bi-check"></i>
                          </span>
                          <span className="text">Soporte humano real</span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                          <span className="icon rounded-circle text-center">
                            <i className="bi bi-check"></i>
                          </span>
                          <span className="text">Confianza</span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                          <span className="icon rounded-circle text-center">
                            <i className="bi bi-check"></i>
                          </span>
                          <span className="text">
                            Tecnología accesible
                          </span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                          <span className="icon rounded-circle text-center">
                            <i className="bi bi-check"></i>
                          </span>
                          <span className="text">
                            Enfoque en el comerciante
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="img-wrap position-relative">
                    <img
                      className="img-fluid rounded-4"
                      src="assets/images/imagen-nosotros.webp"
                      alt="Comerciante usando de10.app"
                      data-aos="fade-up"
                      data-aos-delay="0"
                    />
                    <div
                      className="mission-statement p-4 rounded-4 d-flex gap-4"
                      data-aos="fade-up"
                      data-aos-delay="100"
                    >
                      <div className="mission-icon text-center rounded-circle">
                        <i className="bi bi-lightbulb fs-4"></i>
                      </div>
                      <div>
                        <h3 className="text-uppercase fw-bold">
                          Nuestra misión
                        </h3>
                        <p className="fs-5 mb-0">
                          Potenciar a los comercios y profesionales brindando
                          una herramienta digital moderna, eficiente y fácil
                          de usar, para competir en igualdad de condiciones
                          con los grandes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PRECIOS */}
          <section className="section pricing__v2" id="precios">
            <div className="container">
              <div className="row mb-5">
                <div className="col-md-8 mx-auto text-center">
                  <span
                    className="subtitle text-uppercase mb-3"
                    data-aos="fade-up"
                    data-aos-delay="0"
                  >
                    Precios
                  </span>
                  <h2
                    className="mb-3"
                    data-aos="fade-up"
                    data-aos-delay="100"
                  >
                    Probá gratis los primeros 15 días
                  </h2>
                  <p data-aos="fade-up" data-aos-delay="200">
                    Después, accedé a todos los beneficios por solo{" "}
                    <strong>{formatPlanPrice()} por mes</strong>. Podés sumar un dominio
                    personalizado.
                  </p>
                </div>
              </div>

              <div className="row justify-content-center">
                <div
                  className="col-md-10"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  <div className="p-5 rounded-4 price-table popular h-100">
                    <div className="row">
                      <div className="col-md-6">
                        <h3 className="mb-3">Plan único</h3>
                        <p>
                          Ideal para comercios y servicios que quieren empezar
                          a vender online sin complicaciones.
                        </p>
                        <div className="price mb-4">
                          <strong className="me-1">{formatPlanPrice()}</strong>
                          <span>/ mes</span>
                        </div>
                        <div>
                          <Link
                            className="btn btn-white hover-outline"
                            to="/registro"
                          >
                            Crear mi catálogo ahora
                          </Link>
                        </div>
                        <p className="mt-3 small text-muted">
                          * Gratis por 15 días · Sin tarjeta
                        </p>
                      </div>
                      <div className="col-md-6 pricing-features">
                        <h4 className="text-uppercase fw-bold mb-3">
                          Incluye
                        </h4>
                        <ul className="list-unstyled d-flex flex-column gap-3">
                          <li className="d-flex gap-2 align-items-start mb-0">
                            <span className="icon rounded-circle position-relative mt-1">
                              <i className="bi bi-check"></i>
                            </span>
                            <span>
                              Subdominio de10.app gratis, ejemplo:
                              mitienda.de10.app
                            </span>
                          </li>
                          <li className="d-flex gap-2 align-items-start mb-0">
                            <span className="icon rounded-circle position-relative mt-1">
                              <i className="bi bi-check"></i>
                            </span>
                            <span>
                              Panel de control simple y moderno
                            </span>
                          </li>
                          <li className="d-flex gap-2 align-items-start mb-0">
                            <span className="icon rounded-circle position-relative mt-1">
                              <i className="bi bi-check"></i>
                            </span>
                            <span>
                              Recepción de pedidos por WhatsApp
                            </span>
                          </li>
                          <li className="d-flex gap-2 align-items-start mb-0">
                            <span className="icon rounded-circle position-relative mt-1">
                              <i className="bi bi-check"></i>
                            </span>
                            <span>
                              Carrito de compras y catálogo personalizable
                            </span>
                          </li>
                          <li className="d-flex gap-2 align-items-start mb-0">
                            <span className="icon rounded-circle position-relative mt-1">
                              <i className="bi bi-check"></i>
                            </span>
                            <span>Soporte humano real</span>
                          </li>
                          <li className="d-flex gap-2 align-items-start mb-0">
                            <span className="icon rounded-circle position-relative mt-1">
                              <i className="bi bi-check"></i>
                            </span>
                            <span>
                              Opción de dominio propio con tu marca
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CÓMO FUNCIONA */}
            <section className="section howitworks__v1" id="como-funciona">
              <div className="container">
                <div className="row mb-5">
                  <div className="col-md-8 text-center mx-auto">
                    <span
                      className="subtitle text-uppercase mb-3"
                      data-aos="fade-up"
                      data-aos-delay="0"
                    >
                      Cómo funciona
                    </span>
                    <h2
                      data-aos="fade-up"
                      data-aos-delay="100"
                    >
                      Tu tienda online en minutos
                    </h2>
                    <p
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      Con de10.app cargás tus propios productos (o servicios),
                      con fotos, precio y disponibilidad. Seguí estos simples
                      pasos y empezá a vender online sin complicaciones:
                    </p>
                  </div>
                </div>

                <div className="row g-md-5">
                  {/* Paso 1 */}
                  <div className="col-md-6 col-lg-3">
                    <div
                      className="step-card text-center h-100 d-flex flex-column justify-content-start position-relative"
                      data-aos="fade-up"
                      data-aos-delay="0"
                    >
                      <div data-aos="fade-right" data-aos-delay="500">
                        <img
                          className="arch-line"
                          src="assets/images/arch-line.svg"
                          alt=""
                        />
                      </div>
                      <span className="step-number rounded-circle text-center fw-bold mb-5 mx-auto">
                        1
                      </span>

                      <div>
                        <h3 className="fs-5 mb-4">
                          Cargá tus productos o servicios
                        </h3>
                        <ul
                          className="list-unstyled text-start mx-auto"
                          style={{ maxWidth: 290 }}
                        >
                          <li className="mb-2">
                            <span className="badge rounded-pill bg-secondary me-2">
                              Tus productos
                            </span>
                            Cargá tu catálogo con{" "}
                            <strong>fotos</strong>,{" "}
                            <strong>categorías</strong>, y{" "}
                            <strong>variantes</strong>.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Paso 2 */}
                  <div
                    className="col-md-6 col-lg-3"
                    data-aos="fade-up"
                    data-aos-delay="600"
                  >
                    <div className="step-card reverse text-center h-100 d-flex flex-column justify-content-start position-relative">
                      <div data-aos="fade-right" data-aos-delay="1100">
                        <img
                          className="arch-line reverse"
                          src="assets/images/arch-line-reverse.svg"
                          alt=""
                        />
                      </div>
                      <span className="step-number rounded-circle text-center fw-bold mb-5 mx-auto">
                        2
                      </span>
                      <h3 className="fs-5 mb-4">
                        Definí precio y detalles
                      </h3>
                      <p>
                        Configurá <strong>precio</strong>,{" "}
                        <strong>stock</strong> y{" "}
                        <strong>visibilidad</strong>. Sumá{" "}
                        <strong>fotos</strong>,{" "}
                        <strong>variantes</strong> y{" "}
                        <strong>categorías</strong>. Es rápido y
                        simple.
                      </p>
                    </div>
                  </div>

                  {/* Paso 3 */}
                  <div
                    className="col-md-6 col-lg-3"
                    data-aos="fade-up"
                    data-aos-delay="1200"
                  >
                    <div className="step-card text-center h-100 d-flex flex-column justify-content-start position-relative">
                      <div data-aos="fade-right" data-aos-delay="1700">
                        <img
                          className="arch-line"
                          src="assets/images/arch-line.svg"
                          alt=""
                        />
                      </div>
                      <span className="step-number rounded-circle text-center fw-bold mb-5 mx-auto">
                        3
                      </span>
                      <h3 className="fs-5 mb-4">
                        Se publica automáticamente
                      </h3>
                      <p>
                        El producto aparece en tu tienda ordenado por{" "}
                        <strong>categoría</strong> y{" "}
                        <strong>subcategoría</strong>, listo para que
                        tus clientes lo encuentren fácil.
                      </p>
                    </div>
                  </div>

                  {/* Paso 4 */}
                  <div
                    className="col-md-6 col-lg-3"
                    data-aos="fade-up"
                    data-aos-delay="1800"
                  >
                    <div className="step-card last text-center h-100 d-flex flex-column justify-content-start position-relative">
                      <span className="step-number rounded-circle text-center fw-bold mb-5 mx-auto">
                        4
                      </span>
                      <div>
                        <h3 className="fs-5 mb-4">
                          Recibí pedidos por WhatsApp
                        </h3>
                        <p>
                          Tu tienda online ya está funcionando. Tus
                          clientes pueden{" "}
                          <strong>
                            explorar, elegir y enviarte el pedido
                          </strong>{" "}
                          directo por WhatsApp.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-12 text-center">
                    <Link
                      to="/guia-vender-por-whatsapp"
                      className="fw-semibold text-decoration-none"
                    >
                      Ver guía completa para vender por WhatsApp
                    </Link>
                  </div>
                </div>
              </div>
            </section>

          <button id="back-to-top">
            <i className="bi bi-arrow-up-short"></i>
          </button>

          {/* FOOTER */}
          <footer
            className="footer pt-5 pb-5 bg-light"
            id="contacto"
          >
            <div className="container">
              <div className="row justify-content-between mb-5 g-xl-5">
                <div className="col-md-4 mb-5 mb-lg-0">
                  <h3 className="mb-3">Hecho para negocios reales</h3>
                  <p className="mb-4">
                    de10.app está pensado para comercios y servicios que quieren mostrar lo que venden
                    y recibir pedidos por WhatsApp sin complicaciones. Simple, rápido y sin comisiones.
                  </p>
                </div>
                <div className="col-md-7">
                  <div className="row g-2">
                    <div className="col-md-6 col-lg-4 mb-4 mb-lg-0">
                      <h3 className="mb-3">Secciones</h3>
                      <ul className="list-unstyled">
                        <li>
                          <a href="#para-quien">Para quién es</a>
                        </li>
                        <li>
                          <a href="#nosotros">Nosotros</a>
                        </li>
                        <li>
                          <a href="#precios">Precios</a>
                        </li>
                        <li>
                          <a href="#como-funciona">Cómo funciona</a>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6 col-lg-4 mb-4 mb-lg-0">
                      <h3 className="mb-3">Acceso</h3>
                      <ul className="list-unstyled">
                        <li>
                          <a href="/register">Registro</a>
                        </li>
                        <li>
                          <a href="/login">Ingreso</a>
                        </li>
                        <li>
                          <a href="/forgot-password">
                            Recuperar contraseña
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6 col-lg-4 mb-4 mb-lg-0 quick-contact">
                      <h3 className="mb-3">Contacto</h3>
                      <p className="d-flex align-items-center mb-3">
                        <i
                          className="bi bi-whatsapp me-3"
                          style={{
                            color: "#25D366",
                            fontSize: "1.4rem",
                          }}
                        ></i>
                        <a
                          href="https://wa.me/5493512100793"
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none fw-bold"
                        >
                          +54 9 351 210 0793
                        </a>
                      </p>
                      <p className="d-flex align-items-center mb-3">
                        <i
                          className="bi bi-instagram me-3"
                          style={{
                            color: "#E4405F",
                            fontSize: "1.4rem",
                          }}
                        ></i>
                        <a
                          href="https://www.instagram.com/de10.app/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none fw-bold"
                        >
                          @de10.app
                        </a>
                      </p>

                      <p className="small text-muted mb-0">
                        Respondemos consultas y te ayudamos a poner tu catálogo online.
                      </p>                      
                    </div>
                  </div>
                </div>
              </div>
              <div className="row credits pt-3 border-top pt-4 align-items-center">
                <div className="col-xl-8 text-center text-xl-start mb-3 mb-xl-0">
                  &copy;{" "}
                  <script>
                    {`document.write(new Date().getFullYear());`}
                  </script>{" "}
                  de10.app — Todos los derechos reservados.
                  Desarrollado con{" "}
                  <i className="bi bi-heart-fill text-danger"></i> para impulsar comercios locales.
                </div>

                <div className="col-xl-4 text-center text-xl-end">
                  <Link to="/registro" className="btn btn-primary">
                    Crear mi catálogo ahora!
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
