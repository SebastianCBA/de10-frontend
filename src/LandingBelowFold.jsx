import { Link } from "react-router-dom";
import { useEffect } from "react";
export default function LandingBelowFold({
  BRAND_ORANGE,
  formatPlanPrice,
  ejemploRef,
  shouldLoadEjemplo,
  loadingEjemplo,
  exampleMain,
  exampleAlt,
  resolveImg,
}) {
useEffect(() => {
  const backToTopButton = document.getElementById("back-to-top");

  if (!backToTopButton) return;

  const handleScroll = () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("show");
    } else {
      backToTopButton.classList.remove("show");
    }
  };

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  window.addEventListener("scroll", handleScroll);
  backToTopButton.addEventListener("click", handleClick);

  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
    backToTopButton.removeEventListener("click", handleClick);
  };
}, []);   
  return (
    <>
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
                Es para vos si{" "}
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

      {/* EJEMPLO REAL */}
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
            <div className="col-12 col-lg-6">
              <div className="example-card p-3 p-md-4 h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between example-header flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <img
                        className="shop-logo"
                        src={
                            exampleMain.logo
                            ? resolveImg(exampleMain.logo, "logo")
                            : "/images/logo-placeholder.svg"
                        }
                        alt={`${exampleMain.shopName || "Tienda"} logo`}
                        width="56"
                        height="56"
                        loading="lazy"
                        decoding="async"
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

             {/*   <div className="mt-3 flex-grow-1 d-flex flex-column">
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
                            width="320"
                            height="320"
                            loading="lazy"
                            decoding="async"
                            />
                          </div>
                          <div className="example-item-title">
                            {it?.name}
                          </div>
                          <div className="example-item-price">
                            ${Number(it?.price || 0).toLocaleString("es-AR")}
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
                </div> */ }
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="example-card p-3 p-md-4 h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between example-header flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <img
                        className="shop-logo"
                        src={
                            exampleMain.logo
                            ? resolveImg(exampleAlt.logo, "logo")
                            : "/images/logo-placeholder.svg"
                        }
                        alt={`${exampleMain.shopName || "Tienda"} logo`}
                        width="56"
                        height="56"
                        loading="lazy"
                        decoding="async"
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

                {/*<div className="mt-3 flex-grow-1 d-flex flex-column">
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
                            ${Number(it?.price || 0).toLocaleString("es-AR")}
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
                </div> */}
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
                  <h2 className="mb-4" data-aos="fade-up" data-aos-delay="100">
                    Vendé por WhatsApp con tu propio catálogo online
                  </h2>
                  <div
                    data-aos="fade-up"
                    data-aos-delay="200"
                  >
                    <p>
                      Mostrá tus productos o servicios de forma profesional y recibí pedidos directamente en tu WhatsApp.
                    </p>
                    <p>
                      Sin comisiones. Sin intermediarios. Sin complicaciones.
                    </p>
                    <p>
                      Ideal para emprendedores, negocios y profesionales que quieren vender más sin depender de marketplaces.
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
                      <span className="text">Tecnología accesible</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <span className="icon rounded-circle text-center">
                        <i className="bi bi-check"></i>
                      </span>
                      <span className="text">Enfoque en el comerciante</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="img-wrap position-relative">
                <img
                  className="img-fluid rounded-4"
                  src="assets/images/como-funciona-de10.webp"
                  alt="Cómo funciona de10: cargar productos, mostrar tienda online y recibir pedidos por WhatsApp"
                  width="1400"
                  height="933"
                  decoding="async"
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
                        <span>Panel de control simple y moderno</span>
                      </li>
                      <li className="d-flex gap-2 align-items-start mb-0">
                        <span className="icon rounded-circle position-relative mt-1">
                          <i className="bi bi-check"></i>
                        </span>
                        <span>Recepción de pedidos por WhatsApp</span>
                      </li>
                      <li className="d-flex gap-2 align-items-start mb-0">
                        <span className="icon rounded-circle position-relative mt-1">
                          <i className="bi bi-check"></i>
                        </span>
                        <span>Carrito de compras y catálogo personalizable</span>
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
                        <span>Opción de dominio propio con tu marca</span>
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
                    width="160"
                    height="60"
                    loading="lazy"
                    decoding="async"
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
                      Cargá tu catálogo con <strong>fotos</strong>,{" "}
                      <strong>categorías</strong>, y{" "}
                      <strong>variantes</strong>.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

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
                    width="160"
                    height="60"
                    loading="lazy"
                    decoding="async"
                    />
                </div>
                <span className="step-number rounded-circle text-center fw-bold mb-5 mx-auto">
                  2
                </span>
                <h3 className="fs-5 mb-4">
                  Definí precio y detalles
                </h3>
                <p>
                  Configurá <strong>precio</strong>, <strong>stock</strong> y{" "}
                  <strong>visibilidad</strong>. Sumá <strong>fotos</strong>,{" "}
                  <strong>variantes</strong> y <strong>categorías</strong>. Es rápido y
                  simple.
                </p>
              </div>
            </div>

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
                    width="160"
                    height="60"
                    loading="lazy"
                    decoding="async"
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
                  <strong>categoría</strong> y <strong>subcategoría</strong>, listo
                  para que tus clientes lo encuentren fácil.
                </p>
              </div>
            </div>

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
      <footer className="footer pt-5 pb-5 bg-light" id="contacto">
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
                    <li><a href="#para-quien">Para quién es</a></li>
                    <li><a href="#nosotros">Nosotros</a></li>
                    <li><a href="#precios">Precios</a></li>
                    <li><a href="#como-funciona">Cómo funciona</a></li>
                  </ul>
                </div>

                <div className="col-md-6 col-lg-4 mb-4 mb-lg-0">
                  <h3 className="mb-3">Acceso</h3>
                  <ul className="list-unstyled">
                    <li><a href="/register">Registro</a></li>
                    <li><a href="/login">Ingreso</a></li>
                    <li><a href="http://demo.de10.app">Ver ejemplo real</a></li>
                  </ul>
                </div>

                <div className="col-md-6 col-lg-4 mb-4 mb-lg-0">
                  <h3 className="mb-3">Contacto</h3>
                  <ul className="list-unstyled">
                    <li><a href="mailto:info@de10.app">info@de10.app</a></li>
                    <li><a href="https://wa.me/5493516879999" target="_blank" rel="noreferrer">WhatsApp</a></li>
                    <li><a href="https://www.instagram.com/de10.app/" target="_blank" rel="noreferrer">Instagram</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="row credits pt-3">
            <div className="col-xl-8 text-center text-xl-start mb-3 mb-xl-0">
              &copy; {new Date().getFullYear()} de10.app. Todos los derechos reservados.
            </div>
            <div className="col-xl-4 text-center text-xl-end">
              Hecho con ❤️ para negocios y emprendedores
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}