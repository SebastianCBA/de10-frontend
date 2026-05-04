import { useEffect } from "react";

export default function HeroDesktopSlider({ BRAND_ORANGE }) {
  useEffect(() => {
    let heroSwiperInstance = null;
    let cancelled = false;

    const initHero = async () => {
      const [{ default: Swiper }, swiperModules] = await Promise.all([
        import("swiper"),
        import("swiper/modules"),
      ]);

      if (cancelled) return;

      const { Navigation, Pagination, Autoplay, EffectFade } = swiperModules;

      const heroEl = document.querySelector(".hero-swiper");
      if (!heroEl) return;

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
      initHero();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (heroSwiperInstance) {
        heroSwiperInstance.destroy(true, true);
      }
    };
  }, []);

  return (
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
                <h3 className="h5 mb-0">Catálogo listo para vender</h3>
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
                  background: "#eef6ff",
                  color: "#0d6efd",
                }}
              >
                <i className="bi bi-whatsapp fs-4"></i>
              </div>
              <div>
                <h3 className="h5 mb-0">Recibí pedidos al instante</h3>
                <small className="text-muted">
                  Sin intermediarios ni comisiones
                </small>
              </div>
            </div>

            <p className="mt-3 mb-0">
              Tus clientes eligen productos, arman su pedido y te lo envían
              directo por WhatsApp. Todo simple y rápido.
            </p>

            <div className="text-end">
              <span className="badge rounded-pill text-bg-success">
                Comunicación directa
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
                <h3 className="h5 mb-0">Mostrá lo que vendés</h3>
                <small className="text-muted">
                  Fotos, precio y stock al día
                </small>
              </div>
            </div>

            <p className="mt-3 mb-0">
              Publicá tus productos o servicios con fotos, precio y descripción
              clara. Mostrales a tus clientes que estás activo y disponible.
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
          background: "rgba(255,111,44,0.08)",
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
          background: "rgba(255,111,44,0.08)",
          backdropFilter: "blur(2px)",
          zIndex: 10,
        }}
      ></div>
    </div>
  );
}