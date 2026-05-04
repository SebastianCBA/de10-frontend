// BuscarProductos.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import config from "./config";
import useSubdomain from "./hooks/useSubdomain";
import ProductCard from "./ProductCard";

const normalizeQ = (s = "") =>
  s.replace(/\+/g, " ")      // si llega con "+"
   .replace(/\s+/g, " ")     // múltiples espacios → uno
   .trim();

export default function BuscarProductos() {
  const subdomain = useSubdomain();
  const location  = useLocation();

  const [query, setQuery] = useState(() => {
    const qs = new URLSearchParams(location.search);
    return qs.get("q") || "";
  });

  const [productos, setProductos] = useState([]);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef(null);
  const canLoadRef  = useRef(true);
  const reqSeqRef   = useRef(0);

  // sync con la URL
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    setQuery(normalizeQ(qs.get("q") || ""));
  }, [location.search]);

  // reset al cambiar query/subdominio
  useEffect(() => {
    reqSeqRef.current += 1;
    setProductos([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    try { window.scrollTo({ top: 0, behavior: "instant" }); } catch {}
  }, [query, subdomain]);

  // fetch (solo cuando cambian subdominio/query/página)
  useEffect(() => {
    const q = normalizeQ(query);
    if (!subdomain || !q) return;
    if (loading) return;
    if (!hasMore && page > 1) return;

    const seq = ++reqSeqRef.current;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${config.apiBaseUrl}/tienda/${subdomain}/buscar-productos`,
          { params: { q, page }, signal: controller.signal }
        );

        if (seq !== reqSeqRef.current) return;

        // ─── Parser tolerante a ambas formas ────────────────────────────────
        const raw = res.data;

        let pag = null;
        let nuevos = [];

        // A) { categoria:..., productos: { data:[], current_page, last_page, next_page_url } }
        if (raw && typeof raw === "object" && raw.productos) {
          pag = raw.productos;
          nuevos = Array.isArray(pag?.data) ? pag.data : [];
        }
        // B) { current_page, data:[], last_page, next_page_url } (paginador en la raíz)
        else if (raw && typeof raw === "object" && Array.isArray(raw.data)) {
          pag = raw;
          nuevos = raw.data;
        }
        // C) Array simple
        else if (Array.isArray(raw)) {
          nuevos = raw;
        }

        setProductos(prev => (page === 1 ? nuevos : [...prev, ...nuevos]));

        const byNext = Boolean(pag?.next_page_url);
        const byMeta =
          typeof pag?.current_page === "number" &&
          typeof pag?.last_page === "number" &&
          pag.current_page < pag.last_page;

        // Si no hay meta (array simple), seguimos solo si llegaron elementos
        setHasMore(byNext || byMeta || (!pag && nuevos.length > 0));
      } catch (err) {
        if (!controller.signal.aborted && seq === reqSeqRef.current) {
          console.error("Error buscando productos:", err);
          setHasMore(false);
        }
      } finally {
        if (seq === reqSeqRef.current) {
          setLoading(false);
          canLoadRef.current = true; // 🔑 rehabilito carga para el IO
        }
      }
    })();

    return () => controller.abort();
  }, [subdomain, query, page]);

  // IntersectionObserver (no reactiva cuando no hay más)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && canLoadRef.current) {
          canLoadRef.current = false; // bloqueo hasta que termine el fetch
          setPage(p => p + 1);
        }
      },
      { root: null, rootMargin: "300px 0px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, query, subdomain]);

  const trimmed = query.trim();
  const showEmpty = !loading && trimmed !== "" && productos.length === 0;

  return (
    <div className="container py-4">
      <h4 className="mb-4">
        Resultados para: <strong>{trimmed || "…"}</strong>
      </h4>

      {trimmed === "" ? (
        <div className="alert alert-info">Escribí algo para buscar.</div>
      ) : (
        <>
          {productos.length > 0 && (
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {productos.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          )}

          {showEmpty && (
            <div className="alert alert-info text-center mt-4">
              No se encontraron resultados.
            </div>
          )}

          {loading && (
            <div className="text-center my-3">
              <div className="spinner-border text-secondary" role="status" />
              <p className="mt-2 text-muted mb-0">Buscando productos…</p>
            </div>
          )}

          {/* Sentinel al final */}
          <div ref={sentinelRef} style={{ height: 1 }} aria-hidden />
        </>
      )}
    </div>
  );
}
