import React, { useEffect, useState, useRef, useCallback } from "react";
import Layout from "./Layout";
import axios from "axios";
import config from "./config";
import ModalesProductos from "./ModalesProductos";
import ModalProductoPropio from "./ModalProductoPropio";
import VariantesProductoModal from "./VariantesProductoModal";
import { FaEdit, FaTrash } from "react-icons/fa";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [busquedaTabla, setBusquedaTabla] = useState("");

  // Modal “buscar/agregar por código”
  const [modalVisible, setModalVisible] = useState(false);
  const [busquedaPopup, setBusquedaPopup] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [precio, setPrecio] = useState("");
  const [errorPrecio, setErrorPrecio] = useState("");
  const [hayStock, setHayStock] = useState(true);
  const [showHome, setShowHome] = useState(false);

  // Modal “producto propio”
  const [modalPropioVisible, setModalPropioVisible] = useState(false);
  const [editProductId, setEditProductId] = useState(null);     // product.id (para leer detalle + imágenes)
  const [editMyProductId, setEditMyProductId] = useState(null); // my_products.id (para PUT precio/stock/show_home)

  // Modal “variantes” (solo propios)
  const [modalVariantesVisible, setModalVariantesVisible] = useState(false);
  const [variantesCtx, setVariantesCtx] = useState(null); // { productId, myProductId, name, basePrice }

  
  // Notificaciones / estados generales
  const [mensajeOk, setMensajeOk] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Eliminar
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState(false);

  // Paginación/infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  // Búsqueda en modal
  const [scannerActivo, setScannerActivo] = useState(false);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const buscarTimer = useRef(null);
  const lastQueryId = useRef(0);

  // === Cargar productos ===
  const cargarProductos = async (pagina = 1) => {
    setCargando(true);
    try {
      const res = await axios.get(
        `${config.apiBaseUrl}/my-products?page=${pagina}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (pagina === 1) {
        setProductos(res.data.data);
      } else {
        setProductos((prev) => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.current_page < res.data.last_page);
    } catch {
      setMensajeError("Error al cargar los productos.");
      setTimeout(() => setMensajeError(""), 3000);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarProductos(1); }, []);
  useEffect(() => { if (page > 1) cargarProductos(page); }, [page]);

  // Infinite scroll
  const lastProductRef = useCallback(
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

  // Filtro tabla
  const productosFiltrados = productos.filter((p) =>
    p.product?.name?.toLowerCase().includes(busquedaTabla.toLowerCase())
  );

  // Abrir modal “buscar/agregar por código”
  const abrirModal = () => {
    setModalVisible(true);
    setBusquedaPopup("");
    setResultadosBusqueda([]);
    setProductoSeleccionado(null);
    setProductoAEditar(null);
    setPrecio("");
    setHayStock(true);
    setShowHome(false);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProductoAEditar(null);
    setProductoSeleccionado(null);
  };

  // Abrir modal “producto propio” en modo creación
  const abrirProductoPropio = () => {
    setEditProductId(null);
    setEditMyProductId(null);
    setModalPropioVisible(true);
  };

  // Búsqueda (debounce)
  const handleBuscar = (e) => {
    const valor = e.target.value.replace(/\D/g, "");
    setBusquedaPopup(valor);

    if (buscarTimer.current) clearTimeout(buscarTimer.current);

    if (!valor) {
      setResultadosBusqueda([]);
      setCargandoBusqueda(false);
      return;
    }

    const myQueryId = ++lastQueryId.current;
    setCargandoBusqueda(true);

    buscarTimer.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${config.apiBaseUrl}/search?q=${valor}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (myQueryId === lastQueryId.current) {
          setResultadosBusqueda(res.data);
        }
      } catch {
        if (myQueryId === lastQueryId.current) {
          setResultadosBusqueda([]);
        }
      } finally {
        if (myQueryId === lastQueryId.current) {
          setCargandoBusqueda(false);
        }
      }
    }, 300);
  };

  // EDITAR: decide qué modal abrir
  const editarProducto = (producto) => {
    const isPropio = Number(producto?.product?.pantry_id || 0) > 0;

    if (isPropio) {
      // ✔️ claves correctas para el modal propio
      setEditProductId(producto?.product?.id || null); // leer detalle + imágenes
      setEditMyProductId(producto?.id || null);        // actualizar price/stock/show_home
      setModalPropioVisible(true);
      return;
    }

    // Modal simple (no propio)
    setProductoAEditar(producto);
    setProductoSeleccionado(producto.product);
    setPrecio(producto.price.toString());
    setHayStock(producto.stock === 1);
    setShowHome(producto.show_home === 1);
    setModalVisible(true);
  };
  // Abrir “Variantes” (solo si es propio)
  const abrirVariantes = (producto) => {
    const isPropio = Number(producto?.product?.pantry_id || 0) > 0;
    if (!isPropio) return;
    setVariantesCtx({
      productId: producto.product.id,
      myProductId: producto.id,
      name: producto.product.name,
      basePrice: producto.price,
    });
    setModalVariantesVisible(true);
  };

  // Eliminar
  const eliminarProducto = async () => {
    if (!productoAEliminar) return;
    try {
      await axios.delete(`${config.apiBaseUrl}/my-products/${productoAEliminar.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMensajeOk("Producto eliminado correctamente.");
      setProductoAEliminar(null);
      setModalConfirmarEliminar(false);
      cargarProductos(1);
      setTimeout(() => setMensajeOk(""), 2000);
    } catch {
      setMensajeError("No se pudo eliminar el producto.");
      setTimeout(() => setMensajeError(""), 3000);
    }
  };

  // Guardar (modal simple)
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
            show_home: showHome ? 1 : 0,
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setMensajeOk("Producto actualizado correctamente");
      } else {
        await axios.post(
          `${config.apiBaseUrl}/my-products`,
          {
            product_id: productoSeleccionado.id,
            price: parseFloat(precio),
            stock: hayStock ? 1 : 0,
            show_home: showHome ? 1 : 0,
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setMensajeOk("Producto agregado correctamente");
      }
      cerrarModal();
      setTimeout(() => setMensajeOk(""), 2000);
      cargarProductos(1);
    } catch (err) {
      setMensajeError(
        err?.response?.data?.message || "Error al guardar el producto."
      );
      setTimeout(() => setMensajeError(""), 3000);
    }
  };

  const renderBreadcrumbs = (cat) => {
    const crumbs = [];
    let current = cat;
    while (current) {
      crumbs.unshift(current.name);
      current = current?.parent;
    }
    if (crumbs.length > 1) crumbs.pop();
    return crumbs.join(" > ");
  };

  // (opcional) Sugerir producto desde el modal simple
  const [popupRecomendar, setPopupRecomendar] = useState(false);
  const [recomendarBarcode, setRecomendarBarcode] = useState("");
  const [recomendarUrl, setRecomendarUrl] = useState("");

  const guardarRecomendacion = async () => {
    if (!recomendarBarcode && !recomendarUrl) {
      setMensajeError("Debés ingresar al menos un dato.");
      setTimeout(() => setMensajeError(""), 3000);
      return;
    }
    try {
      await axios.post(
        `${config.apiBaseUrl}/suggest-product`,
        { barcode: recomendarBarcode, url: recomendarUrl },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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

  // Bloquear scroll del fondo cuando haya modales abiertos
  useEffect(() => {
    const modalOpen = modalVisible || modalConfirmarEliminar || modalPropioVisible || popupRecomendar;

    document.body.classList.toggle("modal-open-custom", modalOpen);
    document.documentElement.classList.toggle("modal-open-custom", modalOpen);

    return () => {
      document.body.classList.remove("modal-open-custom");
      document.documentElement.classList.remove("modal-open-custom");
    };
  }, [modalVisible, modalConfirmarEliminar, modalPropioVisible, popupRecomendar]);

  return (
    <Layout>
      <div className="container py-4">
        <div className="row align-items-center mb-4">
          <div className="col-12 col-sm">
            <h1 className="fw-bold mb-2 mb-sm-0" style={{ color: "var(--color-secundario)" }}>
              Productos
            </h1>
          </div>
          <div className="col-12 col-sm-auto">
            <button className="btn btn-success w-100 w-sm-auto" onClick={abrirProductoPropio}>
              + Agregar producto
            </button>
          </div>
        </div>

        <input
          type="text"
          className="form-control mb-4"
          placeholder="Buscar producto..."
          value={busquedaTabla}
          onChange={(e) => setBusquedaTabla(e.target.value)}
        />

        <div className="row">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((producto, index) => (
              <div
                key={`${producto.id}-${index}`}
                ref={index === productosFiltrados.length - 1 ? lastProductRef : null}
                className="col-12 col-sm-6 col-lg-4 mb-4"
              >
                <div className="card h-100 shadow-sm p-1 position-relative">
                  {/* Etiquetas */}
                  <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1" >
                    {producto.stock === 1 && <span className="badge bg-success"  style={{
                        zIndex: 2,
                        border: "1px solid #fff",          // ← borde blanco
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.6)", // (opcional) halo sutil
                        borderRadius: "8px"                 // (opcional) consistente con las cards
                      }}>Stock</span>}
                    {producto.show_home === 1 && <span className="badge bg-primary"  style={{
                        zIndex: 2,
                        border: "1px solid #fff",          // ← borde blanco
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.6)", // (opcional) halo sutil
                        borderRadius: "8px"                 // (opcional) consistente con las cards
                      }}>Inicio</span>}
                    {Number(producto?.product?.pantry_id || 0) > 0 && (
                      <span className="badge bg-warning text-dark"  style={{
                        zIndex: 2,
                        border: "1px solid #fff",          // ← borde blanco
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.6)", // (opcional) halo sutil
                        borderRadius: "8px"                 // (opcional) consistente con las cards
                      }}>Propio</span>
                    )}
                  </div>
                  {Number(producto?.product?.pantry_id || 0) > 0 && (
                    <button
                      className="btn btn-sm btn-warning text-white position-absolute top-0 end-0 m-2"
                      style={{
                        zIndex: 2,
                        border: "1px solid #fff",          // ← borde blanco
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.6)", // (opcional) halo sutil
                        borderRadius: "8px"                 // (opcional) consistente con las cards
                      }}
                      onClick={() => abrirVariantes(producto)}
                      title="Editar variantes"
                    >
                      Variantes
                    </button>
                  )}
                  <div className="text-center">
                    <img
                      src={`${config.imageBaseUrl}/${producto.product?.image}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/no-image.jpg";
                      }}
                      alt={producto.product?.name}
                      style={{ width: "100%", maxHeight: 140, objectFit: "contain" }}
                    />
                  </div>

                  <div className="card-body py-2 px-3">
                    <h6 className="card-title mb-2">{producto.product?.name || "-"}</h6>

                    <p className="mb-1">
                      <strong>Precio: </strong>
                      {producto.price ? `$${parseFloat(producto.price).toFixed(2)}` : "$-"}
                    </p>

                    <p className="mb-2">
                      <strong>Código de Barras: </strong>
                      {producto.product?.barcode}
                    </p>

                    <p className="mb-2">
                      <strong>Categoría: </strong>
                      {renderBreadcrumbs(producto.product?.category)}
                    </p>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-primary flex-fill"
                        onClick={() => editarProducto(producto)}
                      >
                        <FaEdit className="me-1" />
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger flex-fill"
                        onClick={() => {
                          setProductoAEliminar(producto);
                          setModalConfirmarEliminar(true);
                        }}
                      >
                        <FaTrash className="me-1" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !cargando && <div className="col-12 text-center">No se encontraron productos.</div>
          )}

          {cargando && productos.length > 0 && (
            <div className="col-12 text-center my-4">
              <div className="spinner-border text-secondary" role="status" style={{ width: "2rem", height: "2rem" }} />
              <div className="mt-2">Cargando más productos...</div>
            </div>
          )}
        </div>

        {productos.length === 0 && cargando && (
          <div className="text-center py-5">
            <div className="spinner-border text-secondary" role="status" style={{ width: "3rem", height: "3rem" }} />
            <div className="mt-3">Cargando productos...</div>
          </div>
        )}
      </div>

      {/* Alerta de éxito */}
      {mensajeOk && (
        <div
          className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow"
          style={{ zIndex: 9999, minWidth: "280px" }}
        >
          {mensajeOk}
        </div>
      )}

      {/* Alerta de error */}
      {mensajeError && (
        <div
          className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3 shadow"
          style={{ zIndex: 9999, minWidth: "280px" }}
        >
          {mensajeError}
        </div>
      )}

      {/* Modal simple */}
      <ModalesProductos
        mensajeOk={mensajeOk}
        mensajeError={mensajeError}
        modalVisible={modalVisible}
        cerrarModal={cerrarModal}
        productoSeleccionado={productoSeleccionado}
        setProductoSeleccionado={setProductoSeleccionado}
        productoAEditar={productoAEditar}
        precio={precio}
        setPrecio={setPrecio}
        errorPrecio={errorPrecio}
        setErrorPrecio={setErrorPrecio}
        hayStock={hayStock}
        setHayStock={setHayStock}
        showHome={showHome}
        setShowHome={setShowHome}
        resultadosBusqueda={resultadosBusqueda}
        busquedaPopup={busquedaPopup}
        handleBuscar={handleBuscar}
        guardarProducto={guardarProducto}
        popupRecomendar={popupRecomendar}
        setPopupRecomendar={setPopupRecomendar}
        recomendarBarcode={recomendarBarcode}
        setRecomendarBarcode={setRecomendarBarcode}
        recomendarUrl={recomendarUrl}
        setRecomendarUrl={setRecomendarUrl}
        guardarRecomendacion={guardarRecomendacion}
        modalConfirmarEliminar={modalConfirmarEliminar}
        setModalConfirmarEliminar={setModalConfirmarEliminar}
        productoAEliminar={productoAEliminar}
        eliminarProducto={eliminarProducto}
        renderBreadcrumbs={renderBreadcrumbs}
        scannerActivo={scannerActivo}
        setScannerActivo={setScannerActivo}
        productos={productos}
        cargandoBusqueda={cargandoBusqueda}
        onAgregarPropio={abrirProductoPropio}
      />

      {/* Modal producto propio (create/edit) */}
      <ModalProductoPropio
        show={modalPropioVisible}
        onClose={() => {
          setModalPropioVisible(false);
          setEditProductId(null);
          setEditMyProductId(null);
        }}
        onSuccess={() => {
          setModalPropioVisible(false);
          setEditProductId(null);
          setEditMyProductId(null);
          setMensajeOk(editProductId ? "Producto propio actualizado." : "Producto propio creado.");
          setTimeout(() => setMensajeOk(""), 2000);
          cargarProductos(1);
        }}
        editProductId={editProductId}
        editMyProductId={editMyProductId}
      />
  {/* Modal Variantes (vacío por ahora) */}
  <VariantesProductoModal
    show={modalVariantesVisible}
    onClose={() => {
      setModalVariantesVisible(false);
      setVariantesCtx(null);
    }}
    productCtx={variantesCtx}
  />      
    </Layout>
  );
}

export default Productos;
