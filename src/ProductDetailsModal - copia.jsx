import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import config from "./config";
import { useCart } from "./context/CartContext";

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

  const fmt = (n) => `$${Number(n ?? 0).toFixed(2)}`;

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

  useEffect(() => setIdx(0), [selIdx]);

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
    const payload = selVar
      ? {
          ...producto,
          precio: selVar.precio,
          variante_id: selVar.id,
          variante: {
            id: selVar.id,
            nombre: selVar.nombre,
            imagen: selVar.imagen,
            precio: selVar.precio,
          },
        }
      : { ...producto, precio: Number(producto?.precio ?? 0) };

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

    <p className="modal-precio" style={{ margin: 0 }}>
      {fmt(precioPrincipal)}
    </p>
  </div>



        <div className="modal-scroll">


          {/* VARIANTES */}
          {variantes.length > 0 && (
            <>
              <div className="text-center mb-1" style={{ color: "#666" }}>
                Variante: <b>{selVar?.nombre}</b>
              </div>

              <div
                className="d-flex flex-wrap justify-content-center gap-2 mb-2"
                style={{ rowGap: 12 }}
              >
                {variantes.map((v, i) => {
                  const active = i === selIdx;
                  return (
                    <label
                      key={v.id ?? i}
                      className="variant-card"
                      style={{
                        cursor: "pointer",
                        background: "#fff",
                        borderRadius: 14,
                        border: active ? "2px solid #ff7a00" : "1px solid #e5e7eb",
                        padding: "8px 12px",
                        minWidth: 140,
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        alignItems: "center",
                        gap: 10,
                        position: "relative",
                        boxShadow: active ? "0 2px 10px rgba(0,0,0,.08)" : "none",
                      }}
                      onClick={() => setSelIdx(i)}
                    >
                      <input
                        type="radio"
                        name="variant"
                        checked={active}
                        onChange={() => setSelIdx(i)}
                        style={{ display: "none" }}
                      />

                      {/* Thumb redondeado */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          overflow: "hidden",
                          background: "#f3f4f6",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {v.imagen ? (
                          <img
                            src={v.imagen}
                            alt={v.nombre}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            loading="lazy"
                          />
                        ) : (
                          <span style={{ fontSize: 12, color: "#999" }}>—</span>
                        )}
                      </div>

                      {/* Texto + precio grande */}
                      <div style={{ display: "grid", gap: 2 }}>
                        <div style={{ fontWeight: 700 }}>{v.nombre}</div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>
                          {fmt(v.precio)}
                        </div>
                      </div>

                      {/* tilde grande */}
                      <div
                        aria-hidden
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          background: active ? "#22c55e" : "transparent",
                          color: "#fff",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 14,
                          boxShadow: active ? "0 1px 6px rgba(0,0,0,.2)" : "none",
                        }}
                      >
                        {active ? "✓" : null}
                      </div>
                    </label>
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
              margin: "0 auto 1rem",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              borderRadius: 12,
              background: "#fafafa",
            }}
          >
            {imagenes.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt={`${producto.nombre} (${i + 1}/${total})`}
                className="slide"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  opacity: i === idx ? 1 : 0,
                  transform: i === idx ? "scale(1)" : "scale(1.02)",
                  transition: `opacity ${DURATION}ms ease, transform ${DURATION}ms cubic-bezier(.22,.61,.36,1)`,
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
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        border: "none",
                        background: i === idx ? "#fff" : "rgba(255,255,255,0.55)",
                        cursor: busy ? "default" : "pointer",
                        transform: i === idx ? "scale(1.15)" : "scale(1)",
                        transition: "transform 150ms ease, background 150ms ease",
                      }}
                    />
                  ))}
                </div>
              </>
            )}
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
            className="d-flex justify-content-between align-items-center"
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

            <button
              type="button"
              className="btn-comprar"
              onClick={handleComprar}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 18px",
                borderRadius: 10,
                fontWeight: 600,
                minWidth: 180,
                justifyContent: "center",
              }}
            >
              <span>Comprar</span>
              <FaShoppingCart />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
