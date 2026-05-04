// src/VariantesProductoModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import config from "./config";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function VariantesProductoModal({ show, onClose, productCtx }) {
  const MAX_BYTES = 4096 * 1024;
  const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
  const IMG_BASE = (config && config.imageBaseUrl) || "/storage/imgs";

  // ----- axios (mismos headers que el resto) -----
  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    }),
    []
  );
  const api = useMemo(
    () =>
      axios.create({
        baseURL: config.apiBaseUrl,
        headers: authHeaders,
        timeout: 20000,
      }),
    [authHeaders]
  );

  // ----- estado general -----
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);

  const [error, setError] = useState("");
  const [errorList, setErrorList] = useState([]);
  const [okMsg, setOkMsg] = useState("");

  // ----- crear -----
  const [creating, setCreating] = useState(false);
  const [vName, setVName] = useState("");
  const [vSamePrice, setVSamePrice] = useState(true);
  const [vPrice, setVPrice] = useState("");
  const [vStock, setVStock] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [imgFile, setImgFile] = useState(null);
  const [imgError, setImgError] = useState("");
  const [optimizing, setOptimizing] = useState(false);

  // ----- editar (separado del listado) -----
  const [editingId, setEditingId] = useState(null);
  const editingVariant = useMemo(
    () => variants.find((v) => v.id === editingId) || null,
    [variants, editingId]
  );
  const [eName, setEName] = useState("");
  const [eSamePrice, setESamePrice] = useState(true);
  const [ePrice, setEPrice] = useState("");
  const [eStock, setEStock] = useState(true);
  const [eSaving, setESaving] = useState(false);
  const [eFieldErrors, setEFieldErrors] = useState({});
  const [eRemoveImage, setERemoveImage] = useState(false);
  const [eImgFile, setEImgFile] = useState(null);
  const [eImgError, setEImgError] = useState("");
  const [eOptimizing, setEOptimizing] = useState(false);

  // ----- borrar -----
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ----- helpers -----
  const bytesToMB = (b) => (b / 1048576).toFixed(2);
  const extFromName = (name = "") => (name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "");
  const isAllowed = (file) =>
    (file?.type && ALLOWED_MIME.includes(file.type)) || ALLOWED_EXT.includes(extFromName(file?.name || ""));
  const scale = (w, h, maxSide) => {
    if (w <= maxSide && h <= maxSide) return { width: w, height: h };
    const r = w > h ? maxSide / w : maxSide / h;
    return { width: Math.round(w * r), height: Math.round(h * r) };
  };

  const productBasePrice = useMemo(() => {
    const n = Number(productCtx?.basePrice);
    return Number.isFinite(n) ? n : null;
  }, [productCtx?.basePrice]);
  const fmtMoney = (n) => (n == null ? "$-" : `$${Number(n).toFixed(2)}`);
  const basePriceLabel = fmtMoney(productBasePrice);
  const resolveImageUrl = (f) => (f ? `${IMG_BASE}/${f}` : null);

  async function bitmapFromFile(file) {
    if ("createImageBitmap" in window) return await createImageBitmap(file);
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = url;
      });
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function compressToWebpAdaptive(file) {
    const steps = [
      { maxSide: 1600, quality: 0.82 },
      { maxSide: 1600, quality: 0.72 },
      { maxSide: 1200, quality: 0.72 },
      { maxSide: 1000, quality: 0.68 },
    ];
    try {
      const src = await bitmapFromFile(file);
      let lastBlob = null;
      for (const s of steps) {
        const { width, height } = scale(src.width, src.height, s.maxSide);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(src, 0, 0, width, height);
        const blob = await new Promise((res) => canvas.toBlob(res, "image/webp", s.quality));
        if (!blob) continue;
        lastBlob = blob;
        if (blob.size <= MAX_BYTES) {
          const name = (file.name || "image").replace(/\.\w+$/, "") + ".webp";
          return new File([blob], name, { type: "image/webp", lastModified: Date.now() });
        }
      }
      if (lastBlob) {
        const name = (file.name || "image").replace(/\.\w+$/, "") + ".webp";
        return new File([lastBlob], name, { type: "image/webp", lastModified: Date.now() });
      }
      return null;
    } catch {
      return null;
    }
  }

  const sanitizeDecimal = (raw) => {
    if (raw == null) return "";
    let s = String(raw).replace(",", ".").replace(/[^\d.]/g, "");
    const parts = s.split(".");
    if (parts.length > 2) s = parts.shift() + "." + parts.join("");
    const [i, d] = s.split(".");
    if (d !== undefined) s = `${i}.${d.slice(0, 2)}`;
    return s;
  };

  const previewUrl = useMemo(() => (imgFile ? URL.createObjectURL(imgFile) : null), [imgFile]);
  const ePreviewUrl = useMemo(() => (eImgFile ? URL.createObjectURL(eImgFile) : null), [eImgFile]);
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);
  useEffect(() => () => ePreviewUrl && URL.revokeObjectURL(ePreviewUrl), [ePreviewUrl]);

  // ----- cargar -----
  const loadVariants = async () => {
    if (!productCtx?.productId) return;
    setLoading(true);
    setError("");
    setErrorList([]);
    try {
      const { data } = await api.get(`/products/${productCtx.productId}/variants`);
      const list = Array.isArray(data) ? data : data?.data || [];
      setVariants(
        list.map((v) => ({
          id: v.id,
          name: v.name || "",
          same_price_as_product: Number(v.same_price_as_product ?? v.same_price) === 1,
          price: v.price ?? "",
          has_stock: Number(v.has_stock ?? v.stock) === 1,
          image: v.image || null,
        }))
      );
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudieron cargar las variantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && productCtx?.productId) loadVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, productCtx?.productId]);

  const parseValidation = (e) => {
    const d = e?.response?.data;
    const fe = d?.errors && typeof d.errors === "object" ? d.errors : {};
    const list = [];
    Object.values(fe).forEach((v) => (Array.isArray(v) ? list.push(...v) : v && list.push(v)));
    return { message: d?.message || "Ocurrió un error.", list, fields: fe };
  };

  // ----- archivos -----
  const onCreatingFileChange = async (e) => {
    const f = e.target.files?.[0];
    setImgError("");
    if (!f) return;
    if (!isAllowed(f)) {
      setImgError(`Formato no soportado. Usá JPG/PNG/WEBP.`);
      e.target.value = "";
      return;
    }
    let candidate = f;
    if (f.size > MAX_BYTES) {
      setOptimizing(true);
      try {
        const optimized = await compressToWebpAdaptive(f);
        if (!optimized) {
          setImgError(`No se pudo optimizar “${f.name}” (${bytesToMB(f.size)} MB).`);
          e.target.value = "";
          return;
        }
        if (optimized.size > MAX_BYTES) {
          setImgError(`Queda en ${bytesToMB(optimized.size)} MB (límite 4 MB).`);
          e.target.value = "";
          return;
        }
        candidate = optimized;
      } finally {
        setOptimizing(false);
      }
    }
    setImgFile(candidate);
    e.target.value = "";
  };

  const onEditingFileChange = async (e) => {
    const f = e.target.files?.[0];
    setEImgError("");
    if (!f) return;
    if (!isAllowed(f)) {
      setEImgError(`Formato no soportado. Usá JPG/PNG/WEBP.`);
      e.target.value = "";
      return;
    }
    let candidate = f;
    if (f.size > MAX_BYTES) {
      setEOptimizing(true);
      try {
        const optimized = await compressToWebpAdaptive(f);
        if (!optimized) {
          setEImgError(`No se pudo optimizar “${f.name}” (${bytesToMB(f.size)} MB).`);
          e.target.value = "";
          return;
        }
        if (optimized.size > MAX_BYTES) {
          setEImgError(`Queda en ${bytesToMB(optimized.size)} MB (límite 4 MB).`);
          e.target.value = "";
          return;
        }
        candidate = optimized;
      } finally {
        setEOptimizing(false);
      }
    }
    setEImgFile(candidate);
    e.target.value = "";
  };

  // ----- crear -----
  const canSaveCreate =
    vName.trim().length > 0 &&
    (vSamePrice || (vPrice !== "" && !isNaN(Number(sanitizeDecimal(vPrice))) && Number(sanitizeDecimal(vPrice)) >= 0)) &&
    !optimizing &&
    !saving;

  const clearCreatingForm = () => {
    setVName("");
    setVSamePrice(true);
    setVPrice("");
    setVStock(true);
    setImgFile(null);
    setImgError("");
    setFieldErrors({});
    setError("");
    setErrorList([]);
  };

  const saveVariant = async () => {
    if (!canSaveCreate) return;
    setSaving(true);
    setOkMsg("");
    setError("");
    setErrorList([]);
    setFieldErrors({});
    try {
      const fd = new FormData();
      fd.append("name", vName.trim());
      fd.append("same_price_as_product", vSamePrice ? "1" : "0");
      if (!vSamePrice) fd.append("price", sanitizeDecimal(vPrice));
      fd.append("has_stock", vStock ? "1" : "0");
      if (imgFile) fd.append("image", imgFile);

      await api.post(`/products/${productCtx.productId}/variants`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await loadVariants();
      setOkMsg("Variante agregada.");
      setTimeout(() => setOkMsg(""), 2000);
      clearCreatingForm();
      setCreating(false);
    } catch (e) {
      const p = parseValidation(e);
      setError(p.message || "No se pudo guardar la variante.");
      setErrorList(p.list);
      setFieldErrors(p.fields);
    } finally {
      setSaving(false);
    }
  };

  // ----- editar -----
  const beginEdit = (v) => {
    setEditingId(v.id);
    setEName(v.name || "");
    setESamePrice(Boolean(v.same_price_as_product));
    setEPrice(v.price != null && v.price !== "" ? String(v.price) : "");
    setEStock(Boolean(v.has_stock));
    setEImgFile(null);
    setERemoveImage(false);
    setEFieldErrors({});
    setEImgError("");
  };

  const clearEditingState = () => {
    setEditingId(null);
    setEName("");
    setESamePrice(true);
    setEPrice("");
    setEStock(true);
    setEImgFile(null);
    setERemoveImage(false);
    setEFieldErrors({});
    setEImgError("");
    setError("");
    setErrorList([]);
  };

  const canSaveEdit =
    editingId &&
    eName.trim().length > 0 &&
    (eSamePrice || (ePrice !== "" && !isNaN(Number(sanitizeDecimal(ePrice))) && Number(sanitizeDecimal(ePrice)) >= 0)) &&
    !eOptimizing &&
    !eSaving;

  const saveEdit = async () => {
    if (!canSaveEdit) return;
    setESaving(true);
    setOkMsg("");
    setError("");
    setErrorList([]);
    setEFieldErrors({});
    try {
      const fd = new FormData();
      fd.append("name", eName.trim());
      fd.append("same_price_as_product", eSamePrice ? "1" : "0");
      if (!eSamePrice) fd.append("price", sanitizeDecimal(ePrice));
      fd.append("has_stock", eStock ? "1" : "0");
      if (eRemoveImage && !eImgFile) fd.append("remove_image", "1");
      if (eImgFile) fd.append("image", eImgFile);

      await api.post(`/variants/${editingId}?_method=PUT`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await loadVariants();
      setOkMsg("Variante actualizada.");
      setTimeout(() => setOkMsg(""), 2000);
      clearEditingState();
    } catch (e) {
      const p = parseValidation(e);
      setError(p.message || "No se pudo actualizar la variante.");
      setErrorList(p.list);
      setEFieldErrors(p.fields);
    } finally {
      setESaving(false);
    }
  };

  // ----- borrar -----
  const askDelete = (v) => setConfirmDelete({ id: v.id, name: v.name });
  const performDelete = async () => {
    if (!confirmDelete) return;
    setError("");
    setErrorList([]);
    try {
      await api.delete(`/variants/${confirmDelete.id}`);
      await loadVariants();
      setOkMsg("Variante eliminada.");
      setTimeout(() => setOkMsg(""), 2000);
      if (editingId === confirmDelete.id) clearEditingState();
    } catch (e) {
      const p = parseValidation(e);
      setError(p.message || "No se pudo eliminar la variante.");
      setErrorList(p.list);
    } finally {
      setConfirmDelete(null);
    }
  };

  // ----- UI switches -----
  const isBusy = creating || editingId !== null;

  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-lg" style={{ marginTop: "5vh", marginBottom: "5vh" }}>
        <div className="modal-content" style={{ overflowY: "auto", maxHeight: "90vh" }}>
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-0">Variantes</h5>
              <small className="text-muted">
                Estás editando las variantes de <strong>{productCtx?.name || "-"}</strong> — Precio base:{" "}
                <strong>{basePriceLabel}</strong>
              </small>
            </div>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {(error || errorList.length > 0) && (
              <div className="alert alert-danger py-2">
                <div className="fw-semibold mb-1">{error || "Error de validación"}</div>
                {errorList.length > 0 && (
                  <ul className="mb-0 ps-3">
                    {errorList.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {okMsg && <div className="alert alert-success py-2">{okMsg}</div>}

            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">Configurá nombre, precio (opcional), stock e imagen por variante.</span>
              <button
                className="btn btn-primary text-white"
                onClick={() => {
                  setCreating(true);
                  setFieldErrors({});
                  setError("");
                  setErrorList([]);
                }}
                disabled={isBusy}
              >
                + Agregar variante
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <span className="spinner-border text-secondary" />
              </div>
            ) : (
              <>
                {/* ====== FORM CREAR ====== */}
                {creating && (
                  <div className="border rounded p-3 mb-3">
                    <div className="mb-3">
                      <label className="form-label">Nombre</label>
                      <input
                        className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
                        placeholder="Ej: 1 kg, Rojo"
                        value={vName}
                        onChange={(e) => setVName(e.target.value)}
                      />
                      {fieldErrors.name && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(fieldErrors.name) ? fieldErrors.name[0] : fieldErrors.name}
                        </div>
                      )}
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input
                        type="checkbox"
                        className={`form-check-input ${fieldErrors.same_price_as_product ? "is-invalid" : ""}`}
                        id="same-new"
                        checked={vSamePrice}
                        onChange={(e) => setVSamePrice(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="same-new">
                        Usa precio del producto
                      </label>
                      {fieldErrors.same_price_as_product && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(fieldErrors.same_price_as_product)
                            ? fieldErrors.same_price_as_product[0]
                            : fieldErrors.same_price_as_product}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Precio</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className={`form-control ${fieldErrors.price ? "is-invalid" : ""}`}
                        placeholder="Opcional"
                        disabled={vSamePrice}
                        value={vPrice}
                        onChange={(e) => setVPrice(sanitizeDecimal(e.target.value))}
                      />
                      {fieldErrors.price && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(fieldErrors.price) ? fieldErrors.price[0] : fieldErrors.price}
                        </div>
                      )}
                      <small className="text-muted">
                        {vSamePrice ? `Usás el precio del producto: ${basePriceLabel}` : "Ingresá un precio opcional."}
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">¿Hay stock?</label>
                      <select
                        className={`form-select ${fieldErrors.has_stock ? "is-invalid" : ""}`}
                        value={vStock ? 1 : 0}
                        onChange={(e) => setVStock(Number(e.target.value) === 1)}
                      >
                        <option value={1}>Sí</option>
                        <option value={0}>No</option>
                      </select>
                      {fieldErrors.has_stock && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(fieldErrors.has_stock) ? fieldErrors.has_stock[0] : fieldErrors.has_stock}
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Imagen</label>
                      <input
                        type="file"
                        className={`form-control ${fieldErrors.image ? "is-invalid" : ""}`}
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={onCreatingFileChange}
                      />
                      {fieldErrors.image && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(fieldErrors.image) ? fieldErrors.image[0] : fieldErrors.image}
                        </div>
                      )}
                      <div className="form-text">
                        Máx <b>4 MB</b>. Formatos <b>JPG/PNG/WEBP</b>. Si es grande, la optimizamos automáticamente.
                      </div>

                      {imgError && <div className="alert alert-warning py-2 mt-2">{imgError}</div>}

                      {(imgFile || optimizing) && (
                        <div className="mt-2" style={{ width: 120 }}>
                          <div className="ratio ratio-1x1">
                            {previewUrl ? (
                              <img src={previewUrl} alt="preview" style={{ objectFit: "cover", borderRadius: 8 }} />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center bg-light rounded">
                                <span className="spinner-border text-secondary" />
                              </div>
                            )}
                          </div>
                          {imgFile && <div className="small text-muted mt-1">{bytesToMB(imgFile.size)} MB</div>}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger w-100 mt-1"
                            onClick={() => {
                              setImgFile(null);
                              setImgError("");
                            }}
                            disabled={!imgFile}
                          >
                            Quitar imagen
                          </button>
                          {optimizing && (
                            <div className="text-muted small d-flex align-items-center gap-2 mt-2">
                              <span className="spinner-border spinner-border-sm" /> Optimizando…
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setCreating(false);
                          clearCreatingForm();
                        }}
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                      <button className="btn btn-primary text-white" onClick={saveVariant} disabled={!canSaveCreate}>
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Guardando…
                          </>
                        ) : (
                          "Guardar variante"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ====== FORM EDITAR (fuera del listado) ====== */}
                {editingId && editingVariant && (
                  <div className="border rounded p-3 mb-2">
                    <div className="mb-3">
                      <label className="form-label">Nombre</label>
                      <input
                        className={`form-control ${eFieldErrors.name ? "is-invalid" : ""}`}
                        value={eName}
                        onChange={(e) => setEName(e.target.value)}
                      />
                      {eFieldErrors.name && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(eFieldErrors.name) ? eFieldErrors.name[0] : eFieldErrors.name}
                        </div>
                      )}
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input
                        type="checkbox"
                        className={`form-check-input ${eFieldErrors.same_price_as_product ? "is-invalid" : ""}`}
                        id={`same-edit-${editingVariant.id}`}
                        checked={eSamePrice}
                        onChange={(e) => setESamePrice(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor={`same-edit-${editingVariant.id}`}>
                        Usa precio del producto
                      </label>
                      {eFieldErrors.same_price_as_product && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(eFieldErrors.same_price_as_product)
                            ? eFieldErrors.same_price_as_product[0]
                            : eFieldErrors.same_price_as_product}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Precio</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className={`form-control ${eFieldErrors.price ? "is-invalid" : ""}`}
                        placeholder="Opcional"
                        disabled={eSamePrice}
                        value={ePrice}
                        onChange={(e) => setEPrice(sanitizeDecimal(e.target.value))}
                      />
                      {eFieldErrors.price && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(eFieldErrors.price) ? eFieldErrors.price[0] : eFieldErrors.price}
                        </div>
                      )}
                      <small className="text-muted">
                        {eSamePrice ? `Usás el precio del producto: ${basePriceLabel}` : "Ingresá un precio opcional."}
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">¿Hay stock?</label>
                      <select
                        className={`form-select ${eFieldErrors.has_stock ? "is-invalid" : ""}`}
                        value={eStock ? 1 : 0}
                        onChange={(e) => setEStock(Number(e.target.value) === 1)}
                      >
                        <option value={1}>Sí</option>
                        <option value={0}>No</option>
                      </select>
                      {eFieldErrors.has_stock && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(eFieldErrors.has_stock) ? eFieldErrors.has_stock[0] : eFieldErrors.has_stock}
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Imagen</label>
                      <div className="d-flex align-items-start gap-3">
                        <div>
                          <div className="text-muted small mb-1">Actual</div>
                          {editingVariant.image ? (
                            <div className="ratio ratio-1x1" style={{ width: 80 }}>
                              <img
                                src={resolveImageUrl(editingVariant.image)}
                                alt="actual"
                                style={{ objectFit: "cover", borderRadius: 8 }}
                              />
                            </div>
                          ) : (
                            <div className="text-muted">—</div>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div className="text-muted small mb-1">Nueva (opcional)</div>
                          <input
                            type="file"
                            className={`form-control ${eFieldErrors.image ? "is-invalid" : ""}`}
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={onEditingFileChange}
                          />
                          {eFieldErrors.image && (
                            <div className="invalid-feedback d-block">
                              {Array.isArray(eFieldErrors.image) ? eFieldErrors.image[0] : eFieldErrors.image}
                            </div>
                          )}
                          {eImgError && <div className="alert alert-warning py-2 mt-2">{eImgError}</div>}

                          {(eImgFile || eOptimizing) && (
                            <div className="mt-2" style={{ width: 120 }}>
                              <div className="ratio ratio-1x1">
                                {ePreviewUrl ? (
                                  <img src={ePreviewUrl} alt="preview" style={{ objectFit: "cover", borderRadius: 8 }} />
                                ) : (
                                  <div className="d-flex align-items-center justify-content-center bg-light rounded">
                                    <span className="spinner-border text-secondary" />
                                  </div>
                                )}
                              </div>
                              {eImgFile && <div className="small text-muted mt-1">{bytesToMB(eImgFile.size)} MB</div>}
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger w-100 mt-1"
                                onClick={() => {
                                  setEImgFile(null);
                                  setEImgError("");
                                }}
                                disabled={!eImgFile}
                              >
                                Quitar imagen
                              </button>
                              {eOptimizing && (
                                <div className="text-muted small d-flex align-items-center gap-2 mt-2">
                                  <span className="spinner-border spinner-border-sm" /> Optimizando…
                                </div>
                              )}
                            </div>
                          )}

                          {!eImgFile && (
                            <div className="form-check mt-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`rem-${editingVariant.id}`}
                                checked={eRemoveImage}
                                onChange={(e) => setERemoveImage(e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor={`rem-${editingVariant.id}`}>
                                Quitar imagen actual
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <button className="btn btn-outline-secondary" onClick={clearEditingState} disabled={eSaving}>
                        Cancelar
                      </button>
                      <button className="btn btn-primary text-white" onClick={saveEdit} disabled={!canSaveEdit}>
                        {eSaving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Guardando…
                          </>
                        ) : (
                          "Guardar cambios"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ====== LISTADO (solo cuando NO hay formularios abiertos) ====== */}
                {!isBusy && (
                  <>
                    {variants.length === 0 ? (
                      <div className="mt-2">
                        <span className="badge bg-light text-dark border">Aún no has cargado ninguna variante.</span>
                      </div>
                    ) : (
                      variants.map((v) => {
                        const imgUrl = resolveImageUrl(v.image);
                        return (
                          <div key={v.id} className="border rounded p-3 mb-2">
                            <div className="row g-2 align-items-center">
                              <div className="col-12 col-md-4">
                                <div className="text-muted small">Nombre</div>
                                <div className="fw-semibold">{v.name}</div>
                              </div>

                              <div className="col-6 col-md-2">
                                <div className="text-muted small">Precio</div>
                                <div>
                                  {v.same_price_as_product
                                    ? productBasePrice != null
                                      ? fmtMoney(productBasePrice)
                                      : "—"
                                    : v.price !== null && v.price !== ""
                                    ? fmtMoney(parseFloat(v.price))
                                    : "—"}
                                </div>
                              </div>

                              <div className="col-6 col-md-2">
                                <div className="text-muted small">Stock</div>
                                <div>{v.has_stock ? "Sí" : "No"}</div>
                              </div>

                              <div className="col-12 col-md-2">
                                <div className="text-muted small">Imagen</div>
                                {v.image ? (
                                  <div className="ratio ratio-1x1" style={{ width: 60 }}>
                                    <img src={imgUrl} alt={v.name} style={{ objectFit: "cover", borderRadius: 8 }} />
                                  </div>
                                ) : (
                                  <div className="text-muted">—</div>
                                )}
                              </div>

                              <div className="col-12 col-md-2 d-flex gap-2 justify-content-md-end mt-2 mt-md-0">
                                <button
                                  className="btn btn-sm btn-primary text-white"
                                  title="Editar"
                                  aria-label="Editar"
                                  onClick={() => beginEdit(v)}
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Eliminar"
                                  aria-label="Eliminar"
                                  onClick={() => askDelete(v)}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Confirmación de borrado */}
      {confirmDelete && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.35)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar variante</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmDelete(null)} />
              </div>
              <div className="modal-body">
                ¿Seguro que querés eliminar la variante <strong>{confirmDelete.name}</strong>?
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setConfirmDelete(null)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={performDelete}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
