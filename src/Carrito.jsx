// Carrito.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "./context/CartContext";
import { FaTrash, FaWhatsapp } from "react-icons/fa";
import config from "./config";
import useSubdomain from "./hooks/useSubdomain";
import axios from "axios";
import { formatPrice } from "./utils/formatPrice";


/* ---- Portal para pegar la CTA al <body> ---- */
function CartCtaPortal({ children }) {
  const elRef = useRef(null);
  if (!elRef.current) {
    elRef.current = document.createElement("div");
    elRef.current.className = "cart-cta-portal";
  }
  useEffect(() => {
    document.body.appendChild(elRef.current);
    return () => {
      try { document.body.removeChild(elRef.current); } catch {}
    };
  }, []);
  return createPortal(children, elRef.current);
}

function Carrito({ inline = false }) {
  const { carrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito } = useCart();
  const subdomain = useSubdomain();

  /* ===== iOS / Chrome iOS detection + clases en <html> ===== */
  const [isIOS, setIsIOS] = useState(false);
  const [isCriOS, setIsCriOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isiOSUA =
      /iPhone|iPad|iPod/i.test(ua) || (ua.includes("Mac") && "ontouchend" in window);
    setIsIOS(isiOSUA);
    setIsCriOS(/CriOS/i.test(ua));
  }, []);

  useEffect(() => {
    if (inline) return;
    const root = document.documentElement;
    root.classList.add("page-carrito-root");
    if (isCriOS) root.classList.add("is-crios");
    return () => {
      root.classList.remove("page-carrito-root");
      root.classList.remove("is-crios");
    };
  }, [inline, isCriOS]);

  // Calcula --ios-ui (fallback robusto para Chrome iOS)
  useEffect(() => {
    if (!isIOS) return;
    const ua = navigator.userAgent || "";
    const crios = /CriOS/i.test(ua);

    const setUiVar = () => {
      const vv = window.visualViewport;
      if (!vv) {
        document.documentElement.style.setProperty("--ios-ui", `0px`);
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      const screenH = window.screen.height / dpr;

      const byInner = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
      const byScreen = Math.max(0, screenH - (vv.height + vv.offsetTop));
      let uiBottom = Math.max(byInner, byScreen);

      // Chrome iOS suele reportar 0 con toolbar visible → mínimo razonable
      if (crios && uiBottom < 52) uiBottom = 56;

      document.documentElement.style.setProperty("--ios-ui", `${Math.round(uiBottom)}px`);
    };

    setUiVar();
    window.addEventListener("resize", setUiVar);
    window.addEventListener("orientationchange", setUiVar);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setUiVar);
      window.visualViewport.addEventListener("scroll", setUiVar);
    }
    return () => {
      window.removeEventListener("resize", setUiVar);
      window.removeEventListener("orientationchange", setUiVar);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setUiVar);
        window.visualViewport.removeEventListener("scroll", setUiVar);
      }
    };
  }, [isIOS]);

  /* ================= helpers / estado ================= */
  const toImg = (p) => {
    if (!p) return "/images/no-image.jpg";
    const s = String(p);
    if (/^https?:\/\//i.test(s) || s.startsWith("/")) return s;
    return `${config.imageBaseUrl}/${s}`;
  };
  const makeReactKey = (item) =>
    `${item?.id ?? "x"}::${item?.variante_id ?? item?.variante?.id ?? 0}`;

  const [tienda, setTienda] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchesLoaded, setBranchesLoaded] = useState(false);
  const [branchesError, setBranchesError] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState({ type: "central", id: null });

  const [deleteItem, setDeleteItem] = useState(null);

  const total = carrito.reduce((acc, it) => acc + parseFloat(it.precio) * it.cantidad, 0);

  const normalizarTelefono = (raw) => {
    let t = String(raw || "").replace(/\D/g, "");
    if (t.startsWith("549")) t = t.slice(3);
    else if (t.startsWith("54")) t = t.slice(2);
    t = t.replace(/^0+/, "");
    return t;
  };

  // Clase en <body> solo en /carrito
  useEffect(() => {
    if (inline) return;
    document.body.classList.add("page-carrito");
    return () => document.body.classList.remove("page-carrito");
  }, [inline]);

  // Cargar tienda + sucursales
  useEffect(() => {
    let cancel = false;
    async function bootstrap() {
      if (!subdomain) return;
      try {
        const tRes = await axios.get(`${config.apiBaseUrl}/tienda/${subdomain}`);
        if (!cancel) setTienda(tRes.data);
        try {
          const bRes = await axios.get(`${config.apiBaseUrl}/tienda/${subdomain}/sucursales`);
          if (cancel) return;
          const list = Array.isArray(bRes.data) ? bRes.data : (bRes.data?.data || []);
          setBranches(list);
          setBranchesError("");
        } catch {
          if (!cancel) {
            setBranches([]);
            setBranchesError("No se pudieron cargar las sucursales.");
          }
        }
      } catch {
        if (!cancel) setTienda(null);
      } finally {
        if (!cancel) setBranchesLoaded(true);
      }
    }
    bootstrap();
    return () => { cancel = true; };
  }, [subdomain]);
// Fuerza estilos en CriOS ignorando cachés previas
useEffect(() => {
  if (!isCriOS) return;
  const style = document.createElement('style');
  style.id = 'cta-hotfix-crios';
  style.textContent = `
    /* Oculta portal en CriOS: usamos sticky dentro del scroller */
    html.page-carrito-root.is-crios #cart-cta { display: none !important; }

    /* Sticky elevado por encima de la toolbar de Chrome iOS */
    html.page-carrito-root.is-crios .cart-sticky,
    html.page-carrito-root.is-crios .cart-block{
      position: sticky !important;
      bottom: calc(var(--ios-ui, 56px) + 8px) !important;
      padding-bottom: calc(12px + var(--ios-ui, 56px)) !important;
      z-index: 2147483600 !important;
      background: rgba(255,255,255,0.96) !important;
      border-top: 1px solid #e9ecef !important;
      -webkit-backdrop-filter: blur(8px) saturate(1.1);
      backdrop-filter: blur(8px) saturate(1.1);
      border-radius: 12px 12px 0 0;
    }

    /* Más scroll al final para que nunca quede cortado */
    html.page-carrito-root.is-crios .ios-bottom-spacer{
      height: calc(100px + var(--ios-ui, 56px)) !important;
    }

    /* Asegura que el body scrollee (no un contenedor con overflow) */
    html.page-carrito-root,
    html.page-carrito-root body,
    body.page-carrito {
      overflow-y: auto !important;
      overflow-x: hidden !important;
      height: auto !important;
      min-height: 100dvh !important;
    }
  `;
  document.head.appendChild(style);
  return () => { try { document.head.removeChild(style); } catch {} };
}, [isCriOS]);

  const telefonoDestino = useMemo(() => {
    if (!branchesLoaded) return "";
    if (selectedTarget.type === "branch" && selectedTarget.id) {
      const b = branches.find((x) => x.id === selectedTarget.id);
      return b?.phone ? normalizarTelefono(b.phone) : "";
    }
    return tienda?.phone ? normalizarTelefono(tienda.phone) : "";
  }, [branchesLoaded, selectedTarget, branches, tienda]);

  const generarMensajeWhatsApp = () => {
    let mensaje = "Hola, quiero hacer un pedido:\n\n";
    carrito.forEach((item) => {
      const varTxt = item?.variante?.nombre ? ` (Variante: ${item.variante.nombre})` : "";
      const idTxt = item?.id ? ` (ID: ${item.id})` : "";
      mensaje += `• ${item.nombre}${varTxt}${idTxt} x${item.cantidad} - ${formatPrice(
        parseFloat(item.precio) * item.cantidad
      )}\n`;
    });
    mensaje += `\nTotal: ${formatPrice(total)}`;
    return encodeURIComponent(mensaje);
  };

  const buildWhatsAppLink = () =>
    telefonoDestino ? `https://wa.me/549${telefonoDestino}?text=${generarMensajeWhatsApp()}` : "";

  const WHATSAPP_ORDER_CLEARED_KEY = "whatsapp_order_cleared";

  const onFinalizarClick = () => {
    if (branchesLoaded) {
      if (branches.length > 0) {
        if (tienda?.phone) setSelectedTarget({ type: "central", id: null });
        else setSelectedTarget({ type: "branch", id: branches[0].id });
      } else {
        setSelectedTarget({ type: "central", id: null });
      }
    }
    setShowConfirm(true);
  };

  // iOS-safe: registra y navega a WhatsApp sin bloquear
  const handleConfirm = () => {
    setConfirmBusy(true);

    const payload = {
      tienda: subdomain,
      destino: telefonoDestino,
      targetType: selectedTarget.type,
      targetId: selectedTarget.id,
      total: Number(total.toFixed(2)),
      items: carrito.map(it => ({
        id: it.id,
        nombre: it.nombre,
        variante_id: it?.variante?.id ?? null,
        variante: it?.variante?.nombre ?? null,
        cantidad: it.cantidad,
        precio: Number(parseFloat(it.precio) || 0),
        subtotal: Number((parseFloat(it.precio) || 0) * it.cantidad),
      })),
    };

    try {
      const url = `${config.apiBaseUrl}/tienda/${subdomain}/pedidos-whatsapp`;
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      if (navigator.sendBeacon) navigator.sendBeacon(url, blob);
      else fetch(url, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
    } catch {}

    try {
      localStorage.setItem(
        WHATSAPP_ORDER_CLEARED_KEY,
        JSON.stringify({
          at: Date.now(),
          store: subdomain,
        })
      );
    } catch {}

    const wa = buildWhatsAppLink();
    if (wa) window.location.href = wa;
    vaciarCarrito();
    setConfirmBusy(false);
    setShowConfirm(false);
  };

  const handleCancel = () => setShowConfirm(false);

  const confirmDelete = () => {
    if (deleteItem) eliminarDelCarrito(deleteItem.id);
    setDeleteItem(null);
  };

  let whatsappOrderCleared = false;
  try {
    const raw = localStorage.getItem(WHATSAPP_ORDER_CLEARED_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    whatsappOrderCleared = parsed?.store === subdomain;
  } catch {}

  useEffect(() => {
    if (carrito.length === 0 && whatsappOrderCleared) {
      try {
        localStorage.removeItem(WHATSAPP_ORDER_CLEARED_KEY);
      } catch {}
    }
  }, [carrito.length, whatsappOrderCleared]);

  if (carrito.length === 0) {
    return (
      <div className="container py-4">
        <h4>Detalle de tu pedido</h4>
        {whatsappOrderCleared ? (
          <div className="alert alert-success border-0 shadow-sm" role="alert">
            <h5 className="mb-2">Tu pedido ha sido enviado por WhatsApp</h5>
            <p className="mb-2">
              Ya te comunicaste con el vendedor, por eso eliminamos este pedido de la pantalla
              para evitar confusiones o pedidos duplicados.
            </p>
            <p className="mb-0">
              Si querés, podés seguir recorriendo la tienda y agregar nuevos productos para hacer otro pedido.
            </p>
          </div>
        ) : (
          <p className="text-muted">No hay productos en tu pedido.</p>
        )}
      </div>
    );
  }

  const canOpenConfirm = branchesLoaded;

  // 🔑 Portal para todos EXCEPTO Chrome en iOS; en CriOS usamos sticky
  const usePortal = !inline && !isCriOS;

  return (
    <div className="container py-4">
      <h4 className="mb-4">Detalle de tu pedido</h4>

      <div className="d-flex flex-column gap-3">
        {carrito.map((item) => {
          const reactKey = makeReactKey(item);
          const thumb = item?.variante?.imagen || item?.imagen;
          const unit = parseFloat(item.precio) || 0;
          const line = unit * item.cantidad;

          return (
            <div
              key={reactKey}
              className="border rounded p-3 shadow-sm d-flex flex-column flex-md-row align-items-center"
            >
              <img
                src={toImg(thumb)}
                alt={item.nombre}
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, background: "#f3f4f6" }}
                className="mb-3 mb-md-0 me-md-3"
              />
              <div className="flex-grow-1 text-center text-md-start">
                <div className="fw-bold">{item.nombre}</div>
                {item?.id ? (
                  <div className="small text-muted mt-1">
                    <strong>ID:</strong> {item.id}
                  </div>
                ) : null}

                {item?.variante?.nombre && (
                  <div
                    className="d-inline-flex align-items-center gap-2 mt-1"
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: "4px 8px",
                    }}
                  >
                    {item.variante?.imagen && (
                      <img
                        src={toImg(item.variante.imagen)}
                        alt={item.variante.nombre}
                        width={18}
                        height={18}
                        style={{ borderRadius: 4, objectFit: "cover", background: "#f3f4f6" }}
                      />
                    )}
                    <span className="small text-muted">Variante:</span>
                    <strong>{item.variante.nombre}</strong>
                  </div>
                )}

                <div className="text-muted mt-2">Precio: {formatPrice(unit)}</div>


                <div className="mt-3 d-flex flex-column align-items-center align-items-md-start">
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        if (item.cantidad > 1) actualizarCantidad(item.id, item.cantidad - 1);
                        else setDeleteItem(item);
                      }}
                    >
                      –
                    </button>
                    <span className="fw-bold px-2">{item.cantidad}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                    >
                      +
                    </button>
                    <span className="ms-3 text-success fw-bold">{formatPrice(line)}</span>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-secondary mt-2"
                    onClick={() => setDeleteItem(item)}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="text-end mt-4">
        <h5>
          Total: <span className="text-success">{formatPrice(total)}</span>

        </h5>
      </div>

      {/* === CTA SIEMPRE visible === */}
      {usePortal ? (
        <>
          <div className="bottom-cta-spacer" aria-hidden="true" />
          <CartCtaPortal>
            <div id="cart-cta" className="cart-cta">
              <div className="cart-cta__inner">
                <button
                  type="button"
                  className="btn btn-success w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  onClick={onFinalizarClick}
                  disabled={!canOpenConfirm}
                  title={!canOpenConfirm ? "Cargando opciones..." : "Finalizar compra"}
                >
                  {canOpenConfirm ? (
                    <>
                      <FaWhatsapp /> Finalizar compra por WhatsApp
                    </>
                  ) : (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Preparando opciones…
                    </>
                  )}
                </button>
              </div>
            </div>
          </CartCtaPortal>
        </>
      ) : (
        <>
          {/* Chrome iOS o inline: sticky dentro del scroller */}
          <div className="cart-sticky mt-3">
            <div className="cart-cta__inner">
              <button
                type="button"
                className="btn btn-success w-100 d-inline-flex align-items-center justify-content-center gap-2"
                onClick={onFinalizarClick}
                disabled={!canOpenConfirm}
                title={!canOpenConfirm ? "Cargando opciones..." : "Finalizar compra"}
              >
                {canOpenConfirm ? (
                  <>
                    <FaWhatsapp /> Finalizar compra por WhatsApp
                  </>
                ) : (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Preparando opciones…
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="ios-bottom-spacer" aria-hidden="true" />
        </>
      )}

      {/* Modal confirmación */}
      {showConfirm && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmTitle"
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="confirmTitle" className="modal-title">Confirmar finalización del pedido</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={handleCancel} />
              </div>
              <div className="modal-body modal-body-scroll">
                <p className="mb-3">
                  Vas a ser redirigido a una conversación de <b>WhatsApp</b> con el detalle de tu orden.
                </p>

                {branchesLoaded && (tienda?.phone || branches.length > 0) && (
                  <div className="mb-3">
                    <p className="fw-semibold mb-2">Elegí a qué número enviar:</p>

                    {tienda?.phone && (
                      <label className="branch-option w-100 mb-2">
                        <input
                          type="radio"
                          name="destino"
                          className="branch-radio"
                          checked={selectedTarget.type === "central"}
                          onChange={() => setSelectedTarget({ type: "central", id: null })}
                        />
                        <div className="branch-card">
                          <span className="branch-bullet" aria-hidden />
                          <div className="branch-text">
                            <div className="title">Casa central</div>
                            <div className="phone">+54 9 {normalizarTelefono(tienda.phone)}</div>
                          </div>
                        </div>
                      </label>
                    )}

                    {branches.map((b) => (
                      <label key={b.id} className="branch-option w-100 mb-2">
                        <input
                          type="radio"
                          name="destino"
                          className="branch-radio"
                          checked={selectedTarget.type === "branch" && selectedTarget.id === b.id}
                          onChange={() => setSelectedTarget({ type: "branch", id: b.id })}
                        />
                        <div className="branch-card">
                          <span className="branch-bullet" aria-hidden />
                          <div className="branch-text">
                            <div className="title">{b.name}</div>
                            <div className="phone">+54 9 {normalizarTelefono(b.phone)}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <ul className="mb-3">
                  <li>Podrás revisar el mensaje antes de enviarlo.</li>
                  <li>
                    Una vez que te comuniques con el vendedor por <b>WhatsApp</b>, eliminaremos este pedido de la pantalla
                    para evitar confusiones o pedidos duplicados.
                  </li>
                  <li>Después vas a poder seguir recorriendo la tienda y agregar nuevos productos si querés hacer otro pedido.</li>
                </ul>

                <div className="d-flex justify-content-between small text-muted">
                  <span>Artículos: {carrito.length}</span>
                  <span>Total: {formatPrice(total)}</span>

                </div>

                {telefonoDestino && (
                  <div className="small text-muted mt-1">Destino: +54 9 {telefonoDestino}</div>
                )}

                {branchesError && (
                  <div className="alert alert-warning mt-3 mb-0">{branchesError}</div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={confirmBusy}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleConfirm}
                  disabled={confirmBusy || !telefonoDestino}
                >
                  {confirmBusy ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Abriendo WhatsApp…
                    </>
                  ) : (
                    "Continuar a WhatsApp"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {deleteItem && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delTitle"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteItem(null); }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="delTitle" className="modal-title">Eliminar artículo</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setDeleteItem(null)} />
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  ¿Querés eliminar <b>{deleteItem.nombre}</b>
                  {deleteItem?.variante?.nombre ? <> (Variante: <b>{deleteItem.variante.nombre}</b>)</> : null} del carrito?
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setDeleteItem(null)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEBUG opcional (?vv=1) */}
      {/vv=1/.test(typeof location !== "undefined" ? location.search : "") && (
        <pre style={{
          position:'fixed', bottom:0, left:0, zIndex: 999999,
          background:'rgba(0,0,0,.7)', color:'#0f0', padding:'6px 8px',
          font:'12px/1.2 monospace', maxWidth:'100vw', whiteSpace:'pre-wrap'
        }}>
{(() => {
  const vv = typeof window !== "undefined" ? window.visualViewport : null;
  const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
  const screenH = typeof window !== "undefined" ? (window.screen.height / dpr) : 0;
  const iosui = typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue('--ios-ui').trim()
    : "n/a";
  return `UA=${navigator.userAgent}
innerH=${typeof window !== "undefined" ? window.innerHeight : 0}
vv.h=${vv?.height}  vv.offTop=${vv?.offsetTop}
screenH=${screenH}
--ios-ui=${iosui}`;
})()}
        </pre>
      )}
    </div>
  );
}

export default Carrito;
