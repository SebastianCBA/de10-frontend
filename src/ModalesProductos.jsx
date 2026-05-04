import config from "./config";

import { useEffect, useRef, useState } from "react";
import { FaCamera } from "react-icons/fa"; // Ícono de cámara
import { MdQrCodeScanner } from "react-icons/md";
import SpinnerCentrado from "./components/SpinnerCentrado";

import { BrowserMultiFormatReader } from "@zxing/browser";

import { DecodeHintType, BarcodeFormat } from "@zxing/library";



function ModalesProductos({
  mensajeOk,
  mensajeError,
  modalVisible,
  cerrarModal,
  productoSeleccionado,
  productoAEditar,
  precio,
  setPrecio,
  errorPrecio,
  setErrorPrecio,
  hayStock,
  setHayStock,
  showHome,      
  setShowHome,  
  resultadosBusqueda,
  busquedaPopup,
  handleBuscar,
  setProductoSeleccionado,
  guardarProducto,
  popupRecomendar,
  setPopupRecomendar,
  recomendarBarcode,
  setRecomendarBarcode,
  recomendarUrl,
  setRecomendarUrl,
  guardarRecomendacion,
  modalConfirmarEliminar,
  setModalConfirmarEliminar,
  productoAEliminar,
  eliminarProducto,
  renderBreadcrumbs,
  scannerActivo,
  setScannerActivo,
  productos,
  cargandoBusqueda,
  onAgregarPropio
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Detecta si es mobile

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768); // Cambia el estado cuando se redimensiona la ventana
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize); // Escucha cambios de tamaño de la ventana
    return () => {
      window.removeEventListener("resize", handleResize); // Limpia el evento cuando el componente se desmonta
    };
  }, []);

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);

    // 🔍 ¿ya existe en la tienda?
    const existente = productos.find(
      (p) => p.product && p.product.id === producto.id
    );

    if (existente) {
      // precarga los datos como si fuera “Editar”
      setPrecio(existente.price.toString());
      setHayStock(existente.stock === 1);
      setShowHome(existente.show_home === 1);
    } else {
      // alta nueva: campos vacíos
      setPrecio("");
      setHayStock(true);
      setShowHome(false);
    }

    // limpia posibles errores previos
    setErrorPrecio("");
  };


  const codeReaderRef = useRef(null);
  const videoRef = useRef(null);
  const readerRef = useRef(null);     // instancia del lector
  const controlsRef = useRef(null);   // handler para stop()
  const lastCodeRef = useRef(null);
  const hitCountRef = useRef(0);
  const lastTsRef = useRef(0);
  const isAndroid = /Android/i.test(navigator.userAgent);


  const iniciarScanner = async () => {
    if (!scannerActivo) return;
    if (!videoRef.current) return;
    if (controlsRef.current) return; // ya corriendo

    // Hints: máxima sensibilidad y solo formatos retail
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      // BarcodeFormat.EAN_8,
      // BarcodeFormat.UPC_A,
      // BarcodeFormat.CODE_128,
      // BarcodeFormat.CODE_39,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader(hints);
    }

    // iOS: evitar fullscreen
    videoRef.current.setAttribute("playsinline", "true");
    videoRef.current.muted = true;
    videoRef.current.autoplay = true;

    // Pedimos buena resolución y foco continuo
    const constraints = (facingMode) => ({
      audio: false,
      video: {
        facingMode,
        width:  { ideal: isAndroid ? 1920 : 1280 },
        height: { ideal: isAndroid ? 1080 : 720 },
        advanced: [{ focusMode: "continuous" }],
      },
    });

    const decode = async (fm) => {
      controlsRef.current = await readerRef.current.decodeFromConstraints(
        constraints(fm),
        videoRef.current,
        (result /*, err */) => {
          if (!result) return;
          const text = result.getText();
          if (!/^\d{13}$/.test(text)) return;

          const now = Date.now();
          if (text === lastCodeRef.current && (now - lastTsRef.current) < 800) {
            hitCountRef.current += 1;
          } else {
            lastCodeRef.current = text;
            hitCountRef.current = 1;
          }
          lastTsRef.current = now;

          if (hitCountRef.current >= 2) {
            detenerScanner(true);
            handleBuscar({ target: { value: text } });
            setScannerActivo(false);
          }
        }
      );

      // ⬇️ INSERTAR ESTO
      setTimeout(() => {
        try {
          const track = videoRef.current?.srcObject?.getVideoTracks?.()[0];
          const caps = track?.getCapabilities?.();
          if (caps?.zoom) {
            const target = Math.min(
              caps.zoom.max,
              Math.max(caps.zoom.min, (caps.zoom.min + caps.zoom.max) * 0.3)
            );
            track.applyConstraints({ advanced: [{ zoom: target }] });
          }
        } catch {}
      }, 50);
    };


    try {
      await decode({ ideal: "environment" }); // cámara trasera
      } catch (e) {
        if (e?.name === "NotAllowedError") {
          // permiso denegado
          setMensajeError("Necesitamos permiso de cámara para escanear. En iPhone: Ajustes > Safari > Cámara > Permitir.");
          setTimeout(() => setMensajeError(""), 4000);
        } else if (e?.name === "NotFoundError" || e?.name === "DevicesNotFoundError") {
          setMensajeError("No se encontró una cámara disponible en este dispositivo.");
          setTimeout(() => setMensajeError(""), 4000);
        }
        // fallback a frontal por si la trasera falla
        try {
          await decode({ ideal: "user" });
        } catch {
          detenerScanner(true);
          setScannerActivo(false);
        }
      }
  };




const detenerScanner = (silent = false) => {
  try {
    // parar zxing
    if (controlsRef.current && typeof controlsRef.current.stop === "function") {
      controlsRef.current.stop();
    }
  } catch (e) {
    console.warn("controls.stop() error:", e);
  } finally {
    controlsRef.current = null;
  }

  try {
    // cortar cámara
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  } catch {}

  if (!silent) setScannerActivo(false);
};



  useEffect(() => {
    if (scannerActivo) {
      iniciarScanner();
    } else {
      detenerScanner();
    }
  return () => detenerScanner(true);  
  }, [scannerActivo]);

  return (
    <>
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
                    style={{ width: "100%", maxWidth: "180px", height: "auto", objectFit: "contain" }}
                  />
                </div>
                <div className="flex-grow-1 d-flex flex-column justify-content-start">
                  <p className="text-muted small mb-1">{renderBreadcrumbs(productoAEliminar.product?.category)}</p>
                  <h6 className="fw-bold">{productoAEliminar.product?.name}</h6>
                  <p className="text-muted">
                    Precio: {productoAEliminar.price && !isNaN(productoAEliminar.price) ? `$${parseFloat(productoAEliminar.price).toFixed(2)}` : "$-"}
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
        <div className="modal d-block bg-dark bg-opacity-50 modal-lock-scroll" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable" style={{ marginTop: '5vh', marginBottom: '5vh', maxHeight: '90vh' }}>
            <div className="modal-content modal-content-scrollable" style={{ maxHeight: '90vh' }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {productoAEditar
                    ? "Estás editando un producto de tu tienda"
                    : productoSeleccionado
                      ? "Has seleccionado el siguiente producto para agregar a tu tienda"
                      : "Agregar producto"}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>

              <div className="modal-body modal-body-scrollable">
                {!productoSeleccionado && !productoAEditar && (
                  <>
                    {/* Leyenda 1 */}
                    <div className="alert alert-warning small mb-2">
                      <strong>¿Querés crear un producto propio?</strong> Hacé clic en el botón de abajo:
                      vas a poder asignarlo a una categoría, ponerle título, descripción, precio,
                      fotos y varias cosas más.
                    </div>

                    {/* Botón + Producto propio */}
                    <div className="d-grid mb-3">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => {
                          cerrarModal();
                          onAgregarPropio?.();
                        }}
                      >
                        + Producto propio
                      </button>
                    </div>

                    <hr className="my-3" />

                    {/* Leyenda 2 */}
                    <div className="alert alert-info small mb-3">
                      <strong>¿Querés agregar un producto de almacén (AR) ya precargado? </strong>
                      Escaneá o ingresá el <strong>código de barras</strong> y vinculalo directo a tu tienda.
                      Después vas a poder personalizar el <strong>precio</strong>, marcarlo como
                      <strong> destacado</strong>, etc.
                    </div>

                    {/* Título de la sección de búsqueda */}
                    <h6 className="fw-semibold mb-2">Buscar producto por código</h6>
                  </>
                )}
               
                {!productoSeleccionado ? (
                  <>
                    <div className="input-group scan-input mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ingresá todo o parte del código de barras"
                      inputMode="numeric"
                      value={busquedaPopup}
                      onChange={handleBuscar}
                    />
                    {typeof window !== "undefined" && window.innerWidth <= 768 && (
                      <button
                        type="button"
                        className="btn btn-scan"
                        onClick={async () => {
                          setScannerActivo(true);
                          try {
                            await iniciarScanner(); // ← pedir cámara en el gesto
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        aria-label="Escanear código"
                        title="Escanear código"
                      >
                        <MdQrCodeScanner size={22} />
                      </button>
                    )}
                    </div>


                    {scannerActivo && (
                    <div className="scanner-wrap">
                      <div className="scanner-box">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="scanner-video"
                        />
                        {/* Línea guía */}
                        <div className="scanner-guide-line" />
                      </div>

                      <div className="scanner-actions">
                        <button
                          type="button"
                          className="btn btn-danger btn-lg w-100"
                          onClick={() => detenerScanner()}
                        >
                          ✖ Detener escaneo
                        </button>
                      </div>
                    </div>
                    )}



                    {busquedaPopup && (
                      cargandoBusqueda ? (
                        <SpinnerCentrado mensaje="Buscando..." compact />

                      ) : (
                        resultadosBusqueda.length === 0 && (
                          <div className="text-center">
                            <p className="text-muted mb-2">No se encontraron coincidencias.</p>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setPopupRecomendar(true)}
                            >
                              Recomendar producto
                            </button>
                          </div>
                        )
                      )
                    )}

                  {resultadosBusqueda.map((producto) => (
                    <div
                      key={producto.id}
                      className="producto-busqueda d-flex align-items-center justify-content-between border p-2 mb-2 flex-wrap"
                    >
                      <div className="d-flex align-items-center flex-grow-1">
                        <img
                          src={`${config.imageBaseUrl}/${producto.image}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/no-image.jpg";
                          }}
                          alt={producto.name}
                          className="me-3"
                          style={{ width: "40px", height: "auto", objectFit: "contain" }}
                        />
                        <div>
                          <strong>{producto.name}</strong>
                          <div className="text-muted small">Código: {producto.barcode}</div>
                        </div>
                      </div>
                      <div className="boton-seleccionar">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => seleccionarProducto(producto)}
                        >
                          Seleccionar
                        </button>
                      </div>
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
                        style={{ width: "100%", maxWidth: "180px", height: "auto", objectFit: "contain" }}
                      />
                    </div>
                    <div className="flex-grow-1 d-flex flex-column justify-content-start">
                      <p className="text-muted small mb-1">{renderBreadcrumbs(productoSeleccionado.category)}</p>
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
                            if (errorPrecio) setErrorPrecio("");
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
                      <div className="form-check mb-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="chkShowHome"
                          checked={showHome}
                          onChange={(e) => setShowHome(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="chkShowHome">
                          Mostrar en inicio
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
                      cerrarModal();
                    } else if (productoSeleccionado) {
                      setProductoSeleccionado(null);
                    } else {
                      cerrarModal();
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
    </>
  );
}

export default ModalesProductos;
