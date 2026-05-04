// Home.jsx — solo chips de categorías padre
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import axios from "axios";
import config from "./config";
import useSubdomain from "./hooks/useSubdomain";
import ProductCard from "./ProductCard";
import { FaWhatsapp } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

function Home() {
  const subdomain = useSubdomain();
  const outlet = useOutletContext();
  const tienda = outlet?.tienda ?? null;

  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]); // solo raíces

  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);
  const initKeyRef = useRef(null);
  const hasMore = page <= lastPage;

  const mergeDedup = (prev, next) => {
    const seen = new Set(prev.map((p) => p.id));
    const merged = [...prev];
    for (const n of next) if (!seen.has(n.id)) merged.push(n);
    return merged;
  };

  const cargarProductos = useCallback(
    async (p) => {
      if (isFetchingRef.current) return;
      if (p > lastPage) return;
      isFetchingRef.current = true;
      setLoading(true);
      try {
        const res = await axios.get(
          `${config.apiBaseUrl}/tienda/${subdomain}/productos-inicio`,
          { params: { page: p, per_page: 6 } }
        );
        const payload = res?.data ?? {};
        const rows = Array.isArray(payload.data) ? payload.data : [];
        const current =
          payload?.meta?.current_page ?? payload?.current_page ?? p;
        const last =
          payload?.meta?.last_page ?? payload?.last_page ?? current;

        setProductos((prev) => mergeDedup(prev, rows));
        setPage(current + 1);
        setLastPage(last);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [subdomain, lastPage]
  );

  useEffect(() => {
    if (!subdomain) return;
    const key = `init-${subdomain}`;
    if (initKeyRef.current === key) return;
    initKeyRef.current = key;

    setProductos([]);
    setPage(1);
    setLastPage(1);
    cargarProductos(1);

    axios
      .get(`${config.apiBaseUrl}/tienda/${subdomain}/categorias`)
      .then((r) => setCategorias(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCategorias([]));
  }, [subdomain, cargarProductos]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && hasMore) {
          cargarProductos(page);
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [page, hasMore, loading, cargarProductos]);

  const DEFAULT_TITLE = "¡Bienvenido a nuestra tienda online!";
  const DEFAULT_SUBTITLE =
    "Descubrí cientos de productos al mejor precio. Hacé tu pedido y nos comunicaremos contigo por WhatsApp lo antes posible, sin complicaciones.";

  const renderSubtitle = (text) => {
    const raw = String(text || DEFAULT_SUBTITLE);
    const parts = raw.split(/(WhatsApp)/i);
    return (
      <>
        {parts.map((part, idx) =>
          part.toLowerCase() === "whatsapp" ? (
            <span
              key={`wa-${idx}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                lineHeight: 1,
              }}
            >
              <FaWhatsapp
                size={17}
                style={{ color: "#25D366", position: "relative", top: "-1px" }}
                aria-hidden
              />
              <span style={{ color: "#25D366", fontWeight: 600 }}>WhatsApp</span>
            </span>
          ) : (
            <span key={`txt-${idx}`}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <>      <Helmet>
        {(() => {
          const plain = (s) =>
            String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
          const clamp = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

          const DEFAULT_TITLE = "¡Bienvenido a nuestra tienda online!";
          const DEFAULT_SUBTITLE =
            "Descubrí cientos de productos al mejor precio. Hacé tu pedido y nos comunicaremos por WhatsApp lo antes posible.";

          const title = plain(tienda?.welcome_title) || DEFAULT_TITLE;
          const description = clamp(plain(tienda?.welcome_subtitle) || DEFAULT_SUBTITLE, 160);

          return (
            <>
              <title>{title}</title>
              <meta name="description" content={description} key="desc" />
            </>
          );
        })()}
      </Helmet>

    <div className="container py-4">
      <div className="mb-4">
        <h1 className="fw-bold">{tienda?.welcome_title || DEFAULT_TITLE}</h1>
        <p className="text-muted">{renderSubtitle(tienda?.welcome_subtitle)}</p>
      </div>

      {categorias.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-3">Categorías</h4>
          <div className="d-flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <Link
                key={cat.id}
                to={`/categoria/${cat.id}/${cat.modo}`}
                className="chip text-decoration-none"
                style={{ color: "inherit" }}
                title={cat.nombre}
              >
                <span className="chip-label">{cat.nombre}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <h4 className="mb-4">Últimos productos agregados</h4>

      <div className="row">
        {productos.map((producto) => (
          <div key={producto.id} className="col-md-4 mb-4">
            <ProductCard producto={producto} />
          </div>
        ))}
      </div>
      <div className="bottom-cta-spacer w-100" aria-hidden="true" />

      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}
    </div>
    </>
  );
}

export default Home;
