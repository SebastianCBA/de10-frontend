import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import config from "./config";

function formatearFecha(fecha) {
  if (!fecha) return "-";

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;

  return date.toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultDateRange() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 30);

  return {
    desde: formatDateInput(from),
    hasta: formatDateInput(today),
  };
}

function PedidosWhatsapp() {
  const defaultRange = getDefaultDateRange();
  const [pedidos, setPedidos] = useState([]);
  const [desde, setDesde] = useState(defaultRange.desde);
  const [hasta, setHasta] = useState(defaultRange.hasta);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [pedidoExpandido, setPedidoExpandido] = useState(null);

  const observer = useRef(null);

  const cargarPedidos = useCallback(async (pagina = 1, filtros = {}) => {
    setCargando(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: String(pagina) });

      if (filtros.desde) params.set("desde", filtros.desde);
      if (filtros.hasta) params.set("hasta", filtros.hasta);

      const res = await axios.get(
        `${config.apiBaseUrl}/my-whatsapp-orders?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const nuevosPedidos = Array.isArray(res.data?.data) ? res.data.data : [];

      if (pagina === 1) setPedidos(nuevosPedidos);
      else setPedidos((prev) => [...prev, ...nuevosPedidos]);

      setHasMore((res.data?.current_page || 1) < (res.data?.last_page || 1));
    } catch (err) {
      console.error("Error al cargar pedidos de WhatsApp", err);
      setError("No se pudieron cargar los pedidos de WhatsApp.");
      if (pagina === 1) setPedidos([]);
      setHasMore(false);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setPedidoExpandido(null);
    cargarPedidos(1, { desde, hasta });
  }, [desde, hasta, cargarPedidos]);

  useEffect(() => {
    if (page > 1) cargarPedidos(page, { desde, hasta });
  }, [page, desde, hasta, cargarPedidos]);

  const lastPedidoRef = useCallback(
    (node) => {
      if (cargando) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [cargando, hasMore]
  );

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="mb-1" style={{ color: "var(--color-secundario)", fontWeight: "bold" }}>
              Pedidos por WhatsApp
            </h2>
            <p className="text-muted mb-0">
              Revisá los pedidos registrados desde la tienda pública.
            </p>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Hasta</label>
                <input
                  type="date"
                  className="form-control"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    const range = getDefaultDateRange();
                    setDesde(range.desde);
                    setHasta(range.hasta);
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {!cargando && pedidos.length === 0 && !error && (
          <div className="alert alert-light border text-muted">
            No hay pedidos de WhatsApp para mostrar con los filtros actuales.
          </div>
        )}

        <div className="d-flex flex-column gap-3">
          {pedidos.map((pedido, index) => {
            const isLast = index === pedidos.length - 1;
            const expanded = pedidoExpandido === pedido.id;

            return (
              <div
                key={pedido.id}
                ref={isLast ? lastPedidoRef : null}
                className="card border-0 shadow-sm"
              >
                <div className="card-body">
                  <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                    <div>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <span className="badge text-bg-success">Pedido #{pedido.id}</span>
                        <span className="badge text-bg-light border text-dark">
                          {pedido.target_type === "branch" ? "Sucursal" : "Central"}
                        </span>
                      </div>

                      <h5 className="mb-1">{formatearFecha(pedido.ordered_at || pedido.created_at)}</h5>
                      <p className="text-muted mb-1">
                        <strong>Sucursal:</strong> {pedido.branch?.name || "Central"}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Destino:</strong> {pedido.destination_phone || "-"}
                      </p>
                      <p className="text-muted mb-0">
                        <strong>Items:</strong> {pedido.items_count} · <strong>Total:</strong> ${" "}
                        {Number(pedido.total || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="d-flex align-items-start align-items-lg-center">
                      <button
                        className="btn"
                        style={{
                          backgroundColor: "#fff",
                          color: "var(--color-secundario)",
                          border: "1px solid #d8dee9",
                          fontWeight: 600,
                        }}
                        onClick={() =>
                          setPedidoExpandido((prev) => (prev === pedido.id ? null : pedido.id))
                        }
                      >
                        {expanded ? "Ocultar detalle" : "Ver detalle"}
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-4 pt-3 border-top">
                      <h6 className="fw-bold mb-3">Productos del pedido</h6>
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Variante</th>
                              <th>Cantidad</th>
                              <th>Precio unitario</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(pedido.items || []).map((item) => (
                              <tr key={item.id}>
                                <td>
                                  {item.product_name}
                                  {item.product_id ? (
                                    <span className="text-muted"> (ID: {item.product_id})</span>
                                  ) : null}
                                </td>
                                <td>{item.variant_name || "-"}</td>
                                <td>{item.quantity}</td>
                                <td>${Number(item.unit_price || 0).toFixed(2)}</td>
                                <td>${Number(item.subtotal || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {cargando && (
          <div className="d-flex justify-content-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default PedidosWhatsapp;
