// CategoriaProductos.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import config from "./config";
import useSubdomain from "./hooks/useSubdomain";
import ProductCard from "./ProductCard";

function CategoriaProductos() {
  const { id } = useParams();
  const subdomain = useSubdomain();

  const [tienda, setTienda] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActual, setCategoriaActual] = useState(null);

  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [inicialCargando, setInicialCargando] = useState(true);

  const observer = useRef(null);
  const reqSeqRef = useRef(0);

  /* ====== Tienda + categorías (sidebar) ====== */
  useEffect(() => {
    if (!subdomain) return;

    axios.get(`${config.apiBaseUrl}/tienda/${subdomain}`).then((res) => {
      setTienda(res.data);
    });

    axios
      .get(`${config.apiBaseUrl}/tienda/${subdomain}/categorias`)
      .then((res) => setCategorias(res.data || []))
      .catch(() => setCategorias([]));
  }, [subdomain]);

  /* ====== Reset SIN parpadeo al cambiar de categoría ======
     useLayoutEffect se ejecuta antes del paint, así no se ve la grilla anterior */
  useLayoutEffect(() => {
    // invalido cualquier request en curso
    reqSeqRef.current += 1;

    // reseteo estados antes de pintar
    setProductos([]);
    setPage(1);
    setHasMore(true);
    setCategoriaActual(null);
    setInicialCargando(true);

    try {
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch {}
  }, [id]);

  /* ====== Fetch paginado ====== */
  useEffect(() => {
    if (!subdomain || !id) return;

    const controller = new AbortController();
    const seq = reqSeqRef.current;
    setLoading(true);

    axios
      .get(`${config.apiBaseUrl}/tienda/${subdomain}/categoria/${id}/productos`, {
        params: { page },
        signal: controller.signal,
      })
      .then((res) => {
        if (seq !== reqSeqRef.current) return; // respuesta vieja, la ignoro

        const nuevos = res.data?.productos?.data ?? [];
        const categoria = res.data?.categoria ?? null;

        if (page === 1) {
          setProductos(nuevos);
          setCategoriaActual(categoria);
        } else {
          setProductos((prev) => [...prev, ...nuevos]);
        }

        setHasMore(Boolean(res.data?.productos?.next_page_url));
      })
      .catch((err) => {
        if (err?.name === "CanceledError") return;
        if (seq !== reqSeqRef.current) return;
        console.error("Error cargando productos:", err);
        setHasMore(false);
      })
      .finally(() => {
        if (seq !== reqSeqRef.current) return;
        setLoading(false);
        setInicialCargando(false);
      });

    return () => controller.abort();
  }, [subdomain, id, page]);

  /* ====== Infinite scroll ====== */
  const loaderRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) setPage((p) => p + 1);
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  /* ====== Chips de subcategorías del “root” actual ====== */
  const chipsAll = useMemo(() => {
    if (!categoriaActual || categorias.length === 0) return [];
    const rootId = categoriaActual.parent?.id ?? categoriaActual.id;
    const root = categorias.find((c) => c.id === rootId);
    return root?.subcategorias || [];
  }, [categoriaActual, categorias]);

  const hasAlternatives = useMemo(
    () => chipsAll.some((s) => s.id !== categoriaActual?.id),
    [chipsAll, categoriaActual]
  );

  const subtitleText = useMemo(() => {
    if (hasAlternatives) {
      return "Elegí una subcategoría o mirá lo que tenemos en esta sección:";
    }
    if (chipsAll.length === 0) {
      return "Mirá lo que tenemos en esta sección.";
    }
    return "Mirá lo que tenemos en esta subcategoría.";
  }, [hasAlternatives, chipsAll.length]);

  if (!tienda) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Cargando tienda...</p>
      </div>
    );
  }

  return (
    // key={id} para remount limpio del subtree visual
    <div className="container py-4" key={id}   style={{ paddingBottom: "calc(120px + env(safe-area-inset-bottom))" }}>
      {categoriaActual && (
        <>
          <h4 className="mb-2">
            Estás viendo <strong>{categoriaActual.name}</strong>
            {categoriaActual.parent && (
              <> dentro de <strong>{categoriaActual.parent.name}</strong></>
            )}
          </h4>

          {hasAlternatives && (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {chipsAll.map((s) => (
                <Link
                  key={s.id}
                  to={`/categoria/${s.id}/${s.modo}`}
                  className={`chip text-decoration-none ${
                    s.id === categoriaActual.id ? "chip--own" : ""
                  }`}
                >
                  <span className="chip-label">{s.nombre}</span>
                </Link>
              ))}
            </div>
          )}

          <p className="text-muted mb-4">{subtitleText}</p>
        </>
      )}

      {inicialCargando ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Cargando productos...</p>
        </div>
      ) : productos.length > 0 ? (
        <div className="d-flex flex-wrap justify-content-center gap-3">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
          {hasMore && (
            <div ref={loaderRef} className="text-center py-3 w-100">
              <div className="spinner-border text-secondary" role="status"></div>
            </div>
          )}
          
        <div className="bottom-cta-spacer w-100" aria-hidden="true" />
        </div>
      ) : (
        <div className="alert alert-info mt-4 text-center">
          No hay productos disponibles en esta categoría por el momento.
        </div>
      )}
    </div>
  );
}

export default CategoriaProductos;
