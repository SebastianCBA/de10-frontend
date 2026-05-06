import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import config from "./config";
import { useCart } from "./context/CartContext";
import { formatPrice } from "./utils/formatPrice";


const ProductDetailsModal = ({ producto, onClose }) => {
  const { agregarAlCarrito } = useCart();
  if (!producto) return null;

  /* --------- Helpers --------- */
  const toUrl = useCallback((p) => {
    if (!p) return null;
    const s = String(p);
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/")) return s;
    return `${config.imageBaseUrl}/${s}`;
  }, []);

  const toSlug = useCallback((name) => {
    if (!name) return "";
    return String(name)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, []);


  /* --------- Variantes (orden asc por precio) --------- */
  const variantes = useMemo(() => {
    const raw =
      (Array.isArray(producto?.variantes) && producto.variantes) ||
      (Array.isArray(producto?.variants) && producto.variants) ||
      [];
    const norm = raw.map((v, i) => ({
      id: v.id ?? i,
      nombre: v.nombre ?? v.name ?? v.label ?? `Variante ${i + 1}`,
      precio: Number(v.precio ?? v.price ?? producto?.precio ?? 0),
      imagen: toUrl(v.imagen ?? v.image),
      stock: v.stock ?? v.in_stock ?? 1,
    }));
    return norm.sort((a, b) => a.precio - b.precio);
  }, [producto, toUrl]);

  // índice seleccionado (por defecto la más barata)
  const [selIdx, setSelIdx] = useState(0);
  useEffect(() => setSelIdx(0), [variantes.length]);

  const selVar = variantes[selIdx];

  /* --------- Galería: usa imagen de la variante si existe --------- */
  const baseImagenes = useMemo(() => {
    const arr = [];
    if (producto?.imagen) arr.push(toUrl(producto.imagen));
    const candidates = [
      producto?.imagenes_extra,
      producto?.imagenesExtras,
      producto?.images,
      producto?.imagenes,
      producto?.galeria,
    ].filter(Boolean);
    for (const c of candidates) {
      if (Array.isArray(c)) {
        for (const it of c) {
          if (typeof it === "string") arr.push(toUrl(it));
          else if (it && typeof it === "object")
            arr.push(toUrl(it.path || it.url));
        }
      }
    }
    const clean = Array.from(new Set(arr.filter(Boolean)));
    if (clean.length === 0) clean.push("/images/no-image.jpg");
    return clean;
  }, [producto, toUrl]);

  const imagenes = useMemo(() => {
    if (selVar?.imagen) {
      const list = [selVar.imagen, ...baseImagenes];
      const seen = new Set();
      return list.filter((u) => (seen.has(u) ? false : (seen.add(u), true)));
    }
    return baseImagenes;
  }, [selVar, baseImagenes]);

  // Precarga
  useEffect(() => {
    const imgs = imagenes.map((src) => {
      const im = new Image();
      im.src = src;
      return im;
    });
    return () => imgs.forEach((im) => (im.src = ""));
  }, [imagenes]);

  // Carrusel
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const total = imagenes.length;
  const DURATION = 300;

  useEffect(() => {
    if (!selVar?.imagen) return;

    const found = imagenes.findIndex((img) => img === selVar.imagen);
    if (found !== -1) {
      setIdx(found);
    }
  }, [selVar, imagenes]);

  const next = () => {
    if (busy || total < 2) return;
    setBusy(true);
    setIdx((i) => (i + 1) % total);
    setTimeout(() => setBusy(false), DURATION);
  };
  const prev = () => {
    if (busy || total < 2) return;
    setBusy(true);
    setIdx((i) => (i - 1 + total) % total);
    setTimeout(() => setBusy(false), DURATION);
  };
  const goTo = (i) => {
    if (busy || i === idx) return;
    setBusy(true);
    setIdx(i);
    setTimeout(() => setBusy(false), DURATION);
  };

  // Swipe
  const [startX, setStartX] = useState(null);
  const onTouchStart = (e) => setStartX(e.touches?.[0]?.clientX ?? null);
  const onTouchEnd = (e) => {
    if (startX == null) return;
    const x = e.changedTouches?.[0]?.clientX ?? startX;
    const dx = x - startX;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    setStartX(null);
  };

  // Teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  // Comprar
  const mostrarMensajeAgregado = () => {
    const alerta = document.createElement("div");
    alerta.className = "alerta-carrito-modal";
    alerta.innerHTML = `
      <svg class="modal-check" viewBox="0 0 52 52">
        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
        <path class="checkmark" fill="none" stroke="#fff" stroke-width="5" d="M14 27l7 7 16-16"/>
      </svg>
      <strong>¡Producto agregado al carrito!</strong><br>
      Podés revisar o modificar la cantidad desde la sección de compras.
    `;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
  };

  const handleComprar = () => {
    const realProductId =
      producto?.product?.id ??
      producto?.product_id ??
      producto?.producto_id ??
      producto?.id;

    const payload = selVar
      ? {
          ...producto,
          id: realProductId,
          product_id: realProductId,
          precio: selVar.precio,
          variante_id: selVar.id,
          variante: {
            id: selVar.id,
            nombre: selVar.nombre,
            imagen: selVar.imagen,
            precio: selVar.precio,
          },
        }
      : {
          ...producto,
          id: realProductId,
          product_id: realProductId,
          precio: Number(producto?.precio ?? 0),
        };

    agregarAlCarrito(payload);
    mostrarMensajeAgregado();
    onClose?.();
  };

  /* --------- Chips de categoría --------- */
  const chipNodes = useMemo(() => {
    const nodes = [];
    if (Array.isArray(producto?.category_path)) {
      producto.category_path.forEach((n) => {
        const label = typeof n === "string" ? n : n?.name;
        const id = typeof n === "object" ? n?.id : undefined;
        const slug =
          typeof n === "object" ? n?.modo || toSlug(n?.name) : toSlug(label);
        nodes.push({ label, to: id ? `/categoria/${id}/${slug}` : undefined });
      });
    }
    if (producto?.category && (producto.category.name || producto.category.parent)) {
      const p = producto.category.parent;
      if (p?.name) {
        const pid = p?.id;
        nodes.push({
          label: p.name,
          to: pid ? `/categoria/${pid}/${toSlug(p.name)}` : undefined,
        });
      }
      if (producto.category.name) {
        const cid = producto.category?.id ?? producto?.category_id;
        nodes.push({
          label: producto.category.name,
          to: cid ? `/categoria/${cid}/${toSlug(producto.category.name)}` : undefined,
        });
      }
    }
    if (producto?.category_id && producto?.category_name) {
      nodes.push({
        label: producto.category_name,
        to: `/categoria/${producto.category_id}/${toSlug(producto.category_name)}`,
      });
    }
    if (producto?.category_parent_name) nodes.push({ label: producto.category_parent_name });
    if (producto?.category_name) nodes.push({ label: producto.category_name });
    if (producto?.categoria) nodes.push({ label: producto.categoria });
    if (producto?.subcategoria) nodes.push({ label: producto.subcategoria });

    const seen = new Set();
    const clean = [];
    for (const n of nodes) {
      const key = (n.label || "").toLowerCase();
      if (!n.label || seen.has(key)) continue;
      seen.add(key);
      clean.push(n);
    }
    return clean;
  }, [producto, toSlug]);

  //const precioPrincipal = selVar ? selVar.precio : producto?.precio ?? 0;
  const precioPrincipal = selVar?.precio ?? producto?.precio ?? 0;
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="modal-detalle"
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative" }}
      > 
      
{/* ✕ */}
  <button
    className="modal-cerrar"
    onClick={onClose}
    aria-label="Cerrar"
    style={{
      width: 36,
      height: 36,
      borderRadius: "9999px",
      background: "#fff",
      border: "1px solid rgba(0,0,0,.12)",
      boxShadow: "0 2px 8px rgba(0,0,0,.16)",
      color: "#444",
      fontSize: 18,
      lineHeight: 1,
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
    }}
    onMouseDown={(e) => e.preventDefault()}
  >
    ×
  </button>      
  
  {/* HEADER: título arriba, precio abajo */}
  <div
    className="modal-header"
    style={{
      padding: "16px 16px 10px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      paddingRight: 52, // 👈 reserva espacio para que NUNCA lo pise la ✕
    }}
  >
    <h2 className="modal-titulo" style={{ margin: 0, lineHeight: 1.2 }}>
      {producto.nombre}
    </h2>

<div
  className="modal-precio-row"
  style={{
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
  }}
>
<div
  className="modal-precio"
  style={{
    height: 36,
    fontSize: 20,
    fontWeight: 700,
    color: "#ff4d2d",
    whiteSpace: "nowrap",

    lineHeight: "36px",  
  }}
>
  {formatPrice(precioPrincipal)}
</div>

  <button
  type="button"
  onClick={handleComprar}
  className="btn-comprar-header"
  style={{
    height: 36,                 
    padding: "10px 16px",          
    lineHeight: "36px",         
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    fontWeight: 600,
    background: "#ff7a00",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    minWidth: 120,
    flexShrink: 0,
  }}
>
  Comprar
  <FaShoppingCart size={14} />
</button>
</div>

  </div>



        <div className="modal-scroll"   style={{ padding: "0 16px 16px" }}>


          {/* VARIANTES */}
          {variantes.length > 0 && (
            <>

              <div className="text-center mb-3">
                <div style={{ fontWeight: 600, fontSize: 14, color: "#444" }}>
                  Elegí la variante
                </div>
              </div>            
             {/* <div className="text-center mb-1" style={{ color: "#666" }}>
                Seleccionado: <b>{selVar?.nombre}</b>
              </div> */}

              <div
                className="d-flex flex-wrap justify-content-center gap-2 mb-2"
                style={{ rowGap: 12 }}
              >
                {variantes.map((v, i) => {
                  const active = i === selIdx;
                  return (
                          <button
                            key={v.id ?? i}
                            type="button"
                            onClick={() => setSelIdx(i)}
                            className="variant-pill"
                            style={{
                              minWidth: 48,
                              height: 44,
                              borderRadius: 8,
                              border: active ? "2px solid #ff7a00" : "1px solid #d1d5db",
                              background: active ? "#fff7ed" : "#fff",
                              fontWeight: 600,
                              fontSize: 14,
                              cursor: "pointer",
                            }}
                          >
                            {v.nombre}
                          </button>
                  );
                })}
              </div>


                          </>
          )}

          {/* Carrusel */}
          <div
            className="modal-img-wrap"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 560,
              margin: "12 auto 20px",
              aspectRatio: "1 / 1",

              borderRadius: 14,
              background: "#fff",
              overflow: "hidden",

              boxShadow: "0 0 0 1px rgba(0,0,0,.06)",
            }}
          >
            <div
              className="modal-img-inner"
              style={{
                position: "absolute",
                inset: 0,
                padding: 8,
                boxSizing: "border-box",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                background: "#fff",     
                borderRadius: 12,                          
              }}
            >           
            {imagenes.map((src, i) => (
                <img
                  key={src + i}
                  src={src}
                  alt={`${producto.nombre} (${i + 1}/${total})`}
                  className="slide"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",

                    opacity: i === idx ? 1 : 0,
                    position: "absolute",

                    transition: `opacity ${DURATION}ms ease, transform ${DURATION}ms cubic-bezier(.22,.61,.36,1)`,
                    transform: i === idx ? "scale(1)" : "scale(1.02)",
                    willChange: "opacity, transform",
                  }}
                />
              ))}

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Anterior"
                  className="carousel-arrow carousel-arrow--left"
                  disabled={busy}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 8,
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    width: 36,
                    height: 36,
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: busy ? "default" : "pointer",
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Siguiente"
                  className="carousel-arrow carousel-arrow--right"
                  disabled={busy}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 8,
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    width: 36,
                    height: 36,
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: busy ? "default" : "pointer",
                  }}
                >
                  ›
                </button>

                <div
                  className="carousel-dots"
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 0,
                    right: 0,
                    display: "flex",
                    gap: 6,
                    justifyContent: "center",
                  }}
                >
                  {imagenes.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Ir a imagen ${i + 1}`}
                      onClick={() => goTo(i)}
                      className={`carousel-dot ${i === idx ? "active" : ""}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          </div>
          

          {/* Descripción */}
          {producto.descripcion && (
            <p className="modal-descripcion">{producto.descripcion}</p>
          )}

          {/* Chips de categoría */}
          {Array.isArray(chipNodes) && chipNodes.length > 0 && (
            <>
              <div className="d-flex flex-wrap gap-2 justify-content-center my-2">
                {chipNodes.map((n, i) =>
                  n.to ? (
                    <Link
                      key={`${n.label}-${i}`}
                      to={n.to}
                      className="chip text-decoration-none"
                      onClick={onClose}
                    >
                      <span className="chip-label">{n.label}</span>
                    </Link>
                  ) : (
                    <span key={`${n.label}-${i}`} className="chip">
                      <span className="chip-label">{n.label}</span>
                    </span>
                  )
                )}
              </div>
              <hr className="my-3" />
            </>
          )}

          {/* Acciones */}
        <div
          className="d-flex justify-content-between align-items-center flex-wrap"
          style={{ gap: 12 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-detalles"
            style={{
              background: "#fff",
              color: "#333",
              border: "1px solid #e1e1e1",
              padding: "8px 16px",
              borderRadius: 8,
              minWidth: 110,
            }}
          >
            Cerrar
          </button>

          <Link
            to={`/producto/${producto.product_id || producto.id}/${toSlug(producto.nombre)}`}
            style={{ textDecoration: "none" }}
          >
            <button
              type="button"
              className="btn-detalles"
              style={{
                background: "#fff",
                color: "#333",
                border: "1px solid #e1e1e1",
                padding: "8px 16px",
                borderRadius: 8,
                minWidth: 170,
              }}
            >
              Ver producto completo
            </button>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
