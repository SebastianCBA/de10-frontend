// src/Productos.jsx
import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import axios from "axios";
import config from "./config";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [busquedaTabla, setBusquedaTabla] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [busquedaPopup, setBusquedaPopup] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [precio, setPrecio] = useState("");
  const [errorPrecio, setErrorPrecio] = useState("");
  const [hayStock, setHayStock] = useState(true);
  const [mensajeOk, setMensajeOk] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [popupRecomendar, setPopupRecomendar] = useState(false);
  const [recomendarBarcode, setRecomendarBarcode] = useState("");
  const [recomendarUrl, setRecomendarUrl] = useState("");
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState(false);

  const cargarProductos = () => {
    setCargando(true);
    axios
      .get(`${config.apiBaseUrl}/my-products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setProductos(res.data))
      .catch(() => {
        setMensajeError("Error al cargar los productos.");
        setTimeout(() => setMensajeError(""), 3000);
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = productos.filter((producto) =>
    producto.product?.name?.toLowerCase().includes(busquedaTabla.toLowerCase())
  );

  const abrirModal = () => {
    setModalVisible(true);
    setBusquedaPopup("");
    setResultadosBusqueda([]);
    setProductoSeleccionado(null);
    setProductoAEditar(null);
    setPrecio("");
    setHayStock(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProductoAEditar(null);
    setProductoSeleccionado(null);
  };

  const handleBuscar = async (e) => {
    const valor = e.target.value.replace(/\D/g, "");
    setBusquedaPopup(valor);
    if (!valor) return setResultadosBusqueda([]);
    try {
      const res = await axios.get(`${config.apiBaseUrl}/search?q=${valor}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setResultadosBusqueda(res.data);
    } catch {
      setResultadosBusqueda([]);
    }
  };

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setPrecio("");
    setHayStock(true);
  };

  const editarProducto = (producto) => {
    setProductoAEditar(producto);
    setProductoSeleccionado(producto.product);
    setPrecio(producto.price.toString());
    setHayStock(producto.stock === 1);
    setModalVisible(true);
  };

  const eliminarProducto = async () => {
    if (!productoAEliminar) return;
    try {
      await axios.delete(`${config.apiBaseUrl}/my-products/${productoAEliminar.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMensajeOk("Producto eliminado correctamente.");
      setProductoAEliminar(null);
      setModalConfirmarEliminar(false);
      cargarProductos();
      setTimeout(() => setMensajeOk(""), 2000);
    } catch {
      setMensajeError("No se pudo eliminar el producto.");
      setTimeout(() => setMensajeError(""), 3000);
    }
  };

  const guardarProducto = async () => {
    if (!precio || parseFloat(precio) <= 0) {
      setErrorPrecio("El precio es obligatorio y debe ser mayor a 0.");
      return;
    }

    try {
      if (productoAEditar) {
        await axios.put(
          `${config.apiBaseUrl}/my-products/${productoAEditar.id}`,
          {
            price: parseFloat(precio),
            stock: hayStock ? 1 : 0,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMensajeOk("Producto actualizado correctamente");
      } else {
        await axios.post(
          `${config.apiBaseUrl}/my-products`,
          {
            product_id: productoSeleccionado.id,
            price: parseFloat(precio),
            stock: hayStock ? 1 : 0,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMensajeOk("Producto agregado correctamente");
      }
      cerrarModal();
      setTimeout(() => setMensajeOk(""), 2000);
      cargarProductos();
    } catch (err) {
      setMensajeError(
        err?.response?.data?.message || "Error al guardar el producto."
      );
      setTimeout(() => setMensajeError(""), 3000);
    }
  };

  const renderBreadcrumbs = (category) => {
    const crumbs = [];
    let current = category;
    while (current) {
      crumbs.unshift(current.name);
      current = current.parent;
    }
    if (crumbs.length > 1) crumbs.pop();
    return crumbs.join(" > ");
  };

  const guardarRecomendacion = async () => {
    if (!recomendarBarcode && !recomendarUrl) {
      setMensajeError("Debés ingresar al menos un dato.");
      setTimeout(() => setMensajeError(""), 3000);
      return;
    }

    try {
      await axios.post(
        `${config.apiBaseUrl}/suggest-product`,
        {
          barcode: recomendarBarcode,
          url: recomendarUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setModalVisible(false);
      setPopupRecomendar(false);
      setProductoSeleccionado(null);
      setBusquedaPopup("");
      setResultadosBusqueda([]);
      setRecomendarBarcode("");
      setRecomendarUrl("");
      setMensajeOk("Recomendación enviada correctamente.");
      setTimeout(() => setMensajeOk(""), 3000);
    } catch {
      setMensajeError("No se pudo enviar la recomendación.");
      setTimeout(() => setMensajeError(""), 3000);
    }
  };

  return (
    <Layout>
<div className="container py-4">
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h1 className="fw-bold" style={{ color: "var(--color-secundario)" }}>
      Productos
    </h1>
    <button className="btn btn-success" onClick={abrirModal}>
      + Agregar producto
    </button>
  </div>

  <input
    type="text"
    className="form-control mb-4"
    placeholder="Buscar producto..."
    value={busquedaTabla}
    onChange={(e) => setBusquedaTabla(e.target.value)}
  />

  {/* Tabla para desktop */}
  <div className="table-responsive d-none d-md-block">
    <table className="table table-bordered align-middle">
      <thead className="table-light">
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Categoría</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {cargando ? (
          <tr>
            <td colSpan="4" className="text-center">Cargando productos...</td>
          </tr>
        ) : productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => (
            <tr key={producto.id}>
              <td>
                <div className="d-flex align-items-center">
                  <img
                    src={`${config.imageBaseUrl}/${producto.product?.image}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/no-image.jpg";
                    }}
                    alt={producto.product?.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "contain",
                      marginRight: "10px",
                    }}
                  />
                  <span>{producto.product?.name || "-"}</span>
                </div>
              </td>
              <td>
                {producto.price && !isNaN(producto.price)
                  ? `$${parseFloat(producto.price).toFixed(2)}`
                  : "$-"}
              </td>
              <td>{renderBreadcrumbs(producto.product?.category)}</td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => editarProducto(producto)}>
                  <i className="fas fa-edit me-1"></i> Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => { setProductoAEliminar(producto); setModalConfirmarEliminar(true); }}>
                  <i className="fas fa-trash me-1"></i> Eliminar
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center">No se encontraron productos.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Mobile: diseño en bloques */}
  <div className="d-md-none">
    {cargando ? (
      <div className="text-center">Cargando productos...</div>
    ) : productosFiltrados.length > 0 ? (
      productosFiltrados.map((producto) => (
        <div key={producto.id} className="p-3 mb-3 rounded border shadow-sm bg-white">
          <div className="text-center mb-2">
            <img
              src={`${config.imageBaseUrl}/${producto.product?.image}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/no-image.jpg";
              }}
              alt={producto.product?.name}
              style={{ width: "100%", maxHeight: "160px", objectFit: "contain" }}
            />
          </div>
          <h6 className="fw-bold mb-2">{producto.product?.name || "-"}</h6>
          <div className="mb-1"><strong>Precio:</strong> {producto.price && !isNaN(producto.price) ? `$${parseFloat(producto.price).toFixed(2)}` : "$-"}</div>
          <div className="mb-3"><strong>Categoría:</strong> {renderBreadcrumbs(producto.product?.category)}</div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-primary w-50" onClick={() => editarProducto(producto)}>
              <i className="fas fa-edit me-1"></i> Editar
            </button>
            <button className="btn btn-sm btn-danger w-50" onClick={() => { setProductoAEliminar(producto); setModalConfirmarEliminar(true); }}>
              <i className="fas fa-trash me-1"></i> Eliminar
            </button>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center">No se encontraron productos.</div>
    )}
  </div>
</div>


      {mensajeOk && (
        <div className="toast bg-success text-white position-fixed bottom-0 end-0 m-3 show">
          <div className="toast-body">{mensajeOk}</div>
        </div>
      )}
      {mensajeError && (
        <div className="toast bg-danger text-white position-fixed bottom-0 end-0 m-3 show">
          <div className="toast-body">{mensajeError}</div>
        </div>
      )}

      {modalConfirmarEliminar && productoAEliminar && (
      <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirmar eliminación</h5>
              <button className="btn-close" onClick={() => setModalConfirmarEliminar(false)}></button>
            </div>
            <div className="modal-body d-md-flex text-start">
              <div className="me-md-4 mb-3 mb-md-0 d-flex justify-content-center align-items-start">
                <img
                  src={`${config.imageBaseUrl}/${productoAEliminar.product?.image}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/no-image.jpg";
                  }}
                  alt={productoAEliminar.product?.name}
                  style={{
                    width: "100%",
                    maxWidth: "180px",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div className="flex-grow-1 d-flex flex-column justify-content-start">
                <p className="text-muted small mb-1">
                  {renderBreadcrumbs(productoAEliminar.product?.category)}
                </p>
                <h6 className="fw-bold">{productoAEliminar.product?.name}</h6>
                <p className="text-muted">
                  Precio:{" "}
                  {productoAEliminar.price && !isNaN(productoAEliminar.price)
                    ? `$${parseFloat(productoAEliminar.price).toFixed(2)}`
                    : "$-"}
                </p>
                <p className="text-muted mt-3 fst-italic">
                  Podés volver a agregar este producto más adelante si lo necesitás.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalConfirmarEliminar(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={eliminarProducto}>Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    )}


      {modalVisible && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {productoSeleccionado
                    ? "Has seleccionado el siguiente producto para agregar a tu tienda"
                    : "Buscar producto por código"}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <div className="modal-body">
                {!productoSeleccionado ? (
                  <>
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Ingresá todo o parte del código de barras"
                      inputMode="numeric"
                      value={busquedaPopup}
                      onChange={handleBuscar}
                    />
                    {busquedaPopup && resultadosBusqueda.length === 0 && (
                      <div className="text-center">
                        <p className="text-muted mb-2">No se encontraron coincidencias.</p>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setPopupRecomendar(true)}
                        >
                          Recomendar producto
                        </button>
                      </div>
                    )}
                    {resultadosBusqueda.map((producto) => (
                      <div
                        key={producto.id}
                        className="d-flex align-items-center justify-content-between border p-2 mb-2"
                      >
                        <div className="d-flex align-items-center">
                          <img
                            src={`${config.imageBaseUrl}/${producto.image}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/no-image.jpg";
                            }}
                            alt={producto.name}
                            className="me-3"
                            style={{
                              width: "40px",
                              height: "auto",
                              objectFit: "contain",
                            }}
                          />
                          <div>
                            <strong>{producto.name}</strong>
                            <div className="text-muted small">
                              Código: {producto.barcode}
                            </div>
                          </div>
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => seleccionarProducto(producto)}
                        >
                          Seleccionar
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="d-md-flex text-start">
                    <div className="me-md-4 mb-3 mb-md-0 d-flex justify-content-center align-items-start">
                      <img
                        src={`${config.imageBaseUrl}/${productoSeleccionado.image}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/no-image.jpg";
                        }}
                        alt={productoSeleccionado.name}
                        style={{
                          width: "100%",
                          maxWidth: "180px",
                          height: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div className="flex-grow-1 d-flex flex-column justify-content-start">
                      <p className="text-muted small mb-1">
                        {renderBreadcrumbs(productoSeleccionado.category)}
                      </p>
                      <h6 className="fw-bold">{productoSeleccionado.name}</h6>
                      <p className="text-muted">Código: {productoSeleccionado.barcode}</p>
                      <div className="mb-3" style={{ maxWidth: "200px" }}>
                        <label className="form-label">Precio</label>
                        <input
                          type="number"
                          className={`form-control ${errorPrecio ? "is-invalid" : ""}`}
                          value={precio}
                          onChange={(e) => {
                            setPrecio(e.target.value);
                            if (errorPrecio) setErrorPrecio(""); // limpiar si está corrigiendo
                          }}
                        />
                        {errorPrecio && (
                          <div className="invalid-feedback">{errorPrecio}</div>
                        )}
                      </div>

                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="stockCheckbox"
                          checked={hayStock}
                          onChange={() => setHayStock(!hayStock)}
                        />
                        <label className="form-check-label" htmlFor="stockCheckbox">
                          Hay stock
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (productoAEditar) {
                      cerrarModal(); // si estás editando, cerralo directamente
                    } else if (productoSeleccionado) {
                      setProductoSeleccionado(null); // si estás agregando y ya seleccionaste, volvé al buscador
                    } else {
                      cerrarModal(); // fallback
                    }
                  }}
                >
                  Volver
                </button>
                {productoSeleccionado && (
                  <button className="btn btn-primary" onClick={guardarProducto}>
                    Guardar producto
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {popupRecomendar && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Recomendar producto</h5>
                <button type="button" className="btn-close" onClick={() => setPopupRecomendar(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Código de barras</label>
                  <input
                    type="text"
                    className="form-control"
                    value={recomendarBarcode}
                    onChange={(e) => setRecomendarBarcode(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label>URL (opcional)</label>
                  <input
                    type="url"
                    className="form-control"
                    value={recomendarUrl}
                    onChange={(e) => setRecomendarUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setPopupRecomendar(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={guardarRecomendacion}>Enviar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Productos;
