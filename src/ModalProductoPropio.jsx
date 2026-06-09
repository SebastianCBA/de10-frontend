import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import config from "./config";
import SpinnerCentrado from "./components/SpinnerCentrado";

export default function ModalProductoPropio({
  show,
  onClose,
  onSuccess,
  editProductId = null,     // product.id → detalle e imágenes
  editMyProductId = null,   // my_products.id → PUT de precio/stock/show_home
}) {
  // ===== Config imágenes (límite 4 MB) =====
  const MAX_BYTES = 4096 * 1024; // 4 MB
  const MAX_TOTAL = 4;           // principal + extras
  const ALLOWED_MIME = ["image/jpeg","image/png","image/webp","image/jpg"];
  const ALLOWED_EXT  = [".jpg",".jpeg",".png",".webp"];

  const bytesToMB = (b) => (b/1048576).toFixed(2);

  const extFromName = (name="") => {
    const m = name.toLowerCase().match(/\.[a-z0-9]+$/);
    return m ? m[0] : "";
  };
  const isAllowed = (file) => {
    if (file?.type && ALLOWED_MIME.includes(file.type)) return true;
    return ALLOWED_EXT.includes(extFromName(file?.name || ""));
  };

  // Utilidades de compresión
  const scale = (w, h, maxSide) => {
    if (w <= maxSide && h <= maxSide) return { width: w, height: h };
    const r = w > h ? maxSide / w : maxSide / h;
    return { width: Math.round(w*r), height: Math.round(h*r) };
  };

  async function bitmapFromFile(file) {
    // createImageBitmap respeta EXIF en la mayoría de navegadores
    if ("createImageBitmap" in window) {
      return await createImageBitmap(file);
    }
    // Fallback con Image()
    const url = URL.createObjectURL(file);
    try {
      const bmp = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
      return bmp;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function compressToWebpAdaptive(file) {
    // Intenta varios pasos hasta quedar <= MAX_BYTES
    const steps = [
      { maxSide: 1600, quality: 0.82 },
      { maxSide: 1600, quality: 0.72 },
      { maxSide: 1200, quality: 0.72 },
      { maxSide: 1000, quality: 0.68 },
    ];
    try {
      const src = await bitmapFromFile(file);
      for (const s of steps) {
        const { width, height } = scale(src.width, src.height, s.maxSide);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(src, 0, 0, width, height);
        const blob = await new Promise((res) => canvas.toBlob(res, "image/webp", s.quality));
        if (!blob) continue;
        if (blob.size <= MAX_BYTES) {
          const name = (file.name || "image").replace(/\.\w+$/, "") + ".webp";
          return new File([blob], name, { type: "image/webp", lastModified: Date.now() });
        }
      }
      // último intento devuelve el más liviano de los generados si existió
      const last = steps[steps.length - 1];
      const { width, height } = scale(src.width, src.height, last.maxSide);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(src, 0, 0, width, height);
      const blob = await new Promise((res) => canvas.toBlob(res, "image/webp", last.quality));
      if (!blob) return null;
      const name = (file.name || "image").replace(/\.\w+$/, "") + ".webp";
      return new File([blob], name, { type: "image/webp", lastModified: Date.now() });
    } catch (e) {
      console.error("compressToWebpAdaptive error:", e);
      return null;
    }
  }

  // ===== Campos principales =====
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState(true);
  const [showHome, setShowHome] = useState(false);

  // dispara PUT de metadatos sólo si hubo cambios (título/descr/código/categorías)
  const [metaDirty, setMetaDirty] = useState(false);

  // ===== Imágenes =====
  const [files, setFiles] = useState([]);       // nuevas (para crear o agregar)
  const [exThumbs, setExThumbs] = useState([]); // existentes [{id|main, url}]
  const [imgBusy, setImgBusy] = useState(null); // "del-<id>" | "main-<id>" | null
  const [imgError, setImgError] = useState(""); // mensajes locales de validación
  const [optimizing, setOptimizing] = useState(false);

  // ===== Loading / errores =====
  const [loadingData, setLoadingData] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // ===== Autosuggest categorías =====
  const [parentQuery, setParentQuery] = useState("");
  const [parentOptions, setParentOptions] = useState([]);
  const [parentSel, setParentSel] = useState(null);

  const [childQuery, setChildQuery] = useState("");
  const [childOptions, setChildOptions] = useState([]);
  const [childSel, setChildSel] = useState(null);

  const [loadingParent, setLoadingParent] = useState(false);
  const [loadingChild, setLoadingChild] = useState(false);
  const [parentErr, setParentErr] = useState(null);
  const [childErr, setChildErr] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);

  const parentAbortRef = useRef(null);
  const childAbortRef = useRef(null);
  const parentDebounceRef = useRef(null);
  const childDebounceRef = useRef(null);

  const MIN_CHARS = 2;
  const isEdit = Boolean(editProductId);
  const normalizeText = (value = "") =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // === Helpers para mostrar errores de validación (Laravel) ===
  const extractValidationMessage = (err) => {
    const d = err?.response?.data;
    if (d?.errors && typeof d.errors === "object") {
      const firstKey = Object.keys(d.errors)[0];
      const firstMsg = Array.isArray(d.errors[firstKey])
        ? d.errors[firstKey][0]
        : d.errors[firstKey];
      if (firstMsg) return firstMsg;
    }
    return d?.message || d?.error || "Ocurrió un error.";
  };

  const extractFieldErrors = (err) => {
    const d = err?.response?.data;
    return (d?.errors && typeof d.errors === "object") ? d.errors : {};
  };

  // ====== Derivados para imágenes ======
  const remainingCapacity = useMemo(() => {
    return isEdit
      ? Math.max(0, MAX_TOTAL - exThumbs.length - files.length)
      : Math.max(0, MAX_TOTAL - files.length);
  }, [isEdit, exThumbs.length, files.length]);

  const allowNewPrimary = !isEdit || (isEdit && exThumbs.length === 0);

  // ========= Helpers autosuggest =========
  const filterOptionsByQuery = (items, q) => {
    const needle = normalizeText(q);
    if (!needle) return [];

    return [...items]
      .filter((opt) => normalizeText(opt?.name || "").includes(needle))
      .sort((a, b) => {
        const aName = normalizeText(a?.name || "");
        const bName = normalizeText(b?.name || "");
        const aExact = aName === needle ? 0 : 1;
        const bExact = bName === needle ? 0 : 1;

        if (aExact !== bExact) return aExact - bExact;
        return aName.localeCompare(bName, "es", { sensitivity: "base" });
      })
      .slice(0, 20);
  };

  const loadCategoryTree = async () => {
    try {
      const res = await axios.get(`${config.apiBaseUrl}/my-categories-all`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const roots = Array.isArray(res.data)
        ? res.data.filter((root) => !root?.is_global)
        : [];
      setCategoryTree(roots);
      return roots;
    } catch {
      setCategoryTree([]);
      return [];
    }
  };

  const fetchParents = async (q) => {
    if (categoryTree.length > 0) {
      setLoadingParent(true);
      setParentErr(null);
      try {
        setParentOptions(filterOptionsByQuery(categoryTree, q));
      } finally {
        setLoadingParent(false);
      }
      return;
    }

    if (parentAbortRef.current) parentAbortRef.current.abort();
    parentAbortRef.current = new AbortController();
    setLoadingParent(true);
    setParentErr(null);
    try {
      const res = await axios.get(`${config.apiBaseUrl}/my-categories`, {
        params: { level: "parent", q },
        signal: parentAbortRef.current.signal,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const soloPropias = (res.data || []).filter((opt) => Number(opt?.pantry_id || 0) > 0);
      setParentOptions(soloPropias);
    } catch (err) {
      if (
        err?.name !== "CanceledError" &&
        err?.code !== "ERR_CANCELED" &&
        err?.name !== "AbortError"
      ) {
        setParentErr("No se pudo cargar.");
        setParentOptions([]);
      }
    } finally {
      setLoadingParent(false);
    }
  };

  const fetchChildren = async (parentId, q) => {
    if (!parentId) return;

    if (categoryTree.length > 0) {
      setLoadingChild(true);
      setChildErr(null);
      try {
        const parent = categoryTree.find((opt) => Number(opt.id) === Number(parentId));
        const localChildren = Array.isArray(parent?.subcategorias) ? parent.subcategorias : [];
        setChildOptions(filterOptionsByQuery(localChildren, q));
      } finally {
        setLoadingChild(false);
      }
      return;
    }

    if (childAbortRef.current) childAbortRef.current.abort();
    childAbortRef.current = new AbortController();
    setLoadingChild(true);
    setChildErr(null);
    try {
      const res = await axios.get(`${config.apiBaseUrl}/my-categories`, {
        params: { parent_id: parentId, q },
        signal: childAbortRef.current.signal,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const soloPropias = (res.data || []).filter((opt) => Number(opt?.pantry_id || 0) > 0);
      setChildOptions(soloPropias);
    } catch (err) {
      if (
        err?.name !== "CanceledError" &&
        err?.code !== "ERR_CANCELED" &&
        err?.name !== "AbortError"
      ) {
        setChildErr("No se pudo cargar.");
        setChildOptions([]);
      }
    } finally {
      setLoadingChild(false);
    }
  };

  const onChangeParent = (e) => {
    const val = e.target.value;
    setParentQuery(val);
    setChildQuery("");
    setChildOptions([]);
    setChildSel(null);

    if (parentDebounceRef.current) clearTimeout(parentDebounceRef.current);
    if (!val.trim() || val.trim().length < MIN_CHARS) {
      setParentOptions([]);
      return;
    }
    parentDebounceRef.current = setTimeout(() => fetchParents(val.trim()), 300);
  };

  const onChangeChild = (e) => {
    const val = e.target.value;
    setChildQuery(val);

    if (childDebounceRef.current) clearTimeout(childDebounceRef.current);
    if (!parentSel || !val.trim() || val.trim().length < MIN_CHARS) {
      setChildOptions([]);
      return;
    }
    childDebounceRef.current = setTimeout(() => fetchChildren(parentSel.id, val.trim()), 300);
  };

  const selectParent = (opt) => {
    setParentSel({ id: opt.id ?? null, name: opt.name, isNew: !opt.id });
    setParentQuery("");
    setChildSel(null);
    setChildQuery("");
    setChildOptions([]);
    setMetaDirty(true);
  };

  const selectChild = (opt) => {
    setChildSel({ id: opt.id ?? null, name: opt.name, isNew: !opt.id });
    setChildQuery("");
    setMetaDirty(true);
  };

  const onParentKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (parentOptions.length > 0) selectParent(parentOptions[0]);
      else if (parentQuery.trim() !== "")
        selectParent({ id: null, name: parentQuery.trim(), isNew: true });
    }
  };

  const onChildKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (childOptions.length > 0) selectChild(childOptions[0]);
      else if (childQuery.trim() !== "")
        selectChild({ id: null, name: childQuery.trim(), isNew: true });
    }
  };

  // ========= Reset al cerrar =========
  useEffect(() => {
    if (!show) {
      setTitle("");
      setDescription("");
      setBarcode("");
      setPrice("");
      setInStock(true);
      setShowHome(false);
      setFiles([]);
      setExThumbs([]);
      setErrors({});
      setServerError("");
      setParentQuery("");
      setChildQuery("");
      setParentOptions([]);
      setChildOptions([]);
      setParentSel(null);
      setChildSel(null);
      setMetaDirty(false);
      setImgBusy(null);
      setLoadingData(false);
      setLoadingImages(false);
      setImgError("");
      setOptimizing(false);
      setParentErr(null);
      setChildErr(null);
      setCategoryTree([]);
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;
    loadCategoryTree();
  }, [show]);

  // ========= Modo edición: traer datos + imágenes =========
  useEffect(() => {
    if (!show || !editProductId) return;

    (async () => {
      try {
        setLoadingData(true);
        const { data } = await axios.get(
          `${config.apiBaseUrl}/my-custom-products/${editProductId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const p = data.product || {};
        setTitle(p.name || "");
        setDescription(p.description || "");
        setBarcode(p.barcode || "");
        setPrice(String(data.price ?? ""));
        setInStock((data.stock ?? 1) === 1);
        setShowHome((data.show_home ?? 0) === 1);

        const parent = p.category?.parent;
        const child = p.category;
        if (parent) setParentSel({ id: parent.id, name: parent.name, isNew: false });
        if (child) setChildSel({ id: child.id, name: child.name, isNew: false });

        // imágenes
        setLoadingImages(true);
        const thumbs = [];
        if (p.image) thumbs.push({ id: "main", url: `${config.imageBaseUrl}/${p.image}` });

        if (Array.isArray(p.images) && p.images.length) {
          p.images.forEach((img) =>
            thumbs.push({ id: img.id, url: `${config.imageBaseUrl}/${img.path}` })
          );
        } else {
          try {
            const det = await axios.get(`${config.apiBaseUrl}/products/${editProductId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const extras = det?.data?.images?.extras;
            if (Array.isArray(extras) && extras.length) {
              extras.forEach((u, i) => thumbs.push({ id: `e-${i}`, url: u }));
            }
          } catch { /* ignore */ }
        }

        setExThumbs(thumbs);
        setMetaDirty(false);
      } catch {
        setExThumbs([]);
      } finally {
        setLoadingImages(false);
        setLoadingData(false);
      }
    })();
  }, [show, editProductId]);

  // ========= Previews para nuevas (y cleanup de URLs) =========
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  // ========= Manejo archivos (nuevas) =========
  const fileKey = (f) => `${f.name}__${f.size}__${f.lastModified}`;

  const onFileInputChange = async (e) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;

    const capacityNow = isEdit
      ? Math.max(0, MAX_TOTAL - exThumbs.length - files.length)
      : Math.max(0, MAX_TOTAL - files.length);

    if (capacityNow <= 0) {
      e.target.value = "";
      return;
    }

    setImgError("");
    setServerError("");

    const exist = new Set(files.map(fileKey));
    const incoming = Array.from(list);
    const toAdd = [];
    setOptimizing(true);

    try {
      for (const f of incoming) {
        if (toAdd.length >= capacityNow) break;

        // Tipo permitido
        if (!isAllowed(f)) {
          setImgError(`Formato no soportado (${f.type || extFromName(f.name) || "desconocido"}). Usá JPG/PNG/WEBP.`);
          continue;
        }

        // Duplicados
        const k = fileKey(f);
        if (exist.has(k)) continue;

        // Tamaño: si supera 4 MB intentamos optimizar a WEBP
        let candidate = f;
        if (f.size > MAX_BYTES) {
          const optimized = await compressToWebpAdaptive(f);
          if (!optimized) {
            setImgError(`No se pudo optimizar “${f.name}” (${bytesToMB(f.size)} MB). Elegí una imagen más chica.`);
            continue;
          }
          if (optimized.size > MAX_BYTES) {
            setImgError(`“${f.name}” queda en ${bytesToMB(optimized.size)} MB tras optimizar (límite 4 MB).`);
            continue;
          }
          candidate = optimized;
        }

        toAdd.push(candidate);
        exist.add(fileKey(candidate));
      }

      if (toAdd.length > 0) setFiles((prev) => [...prev, ...toAdd]);
    } finally {
      setOptimizing(false);
      e.target.value = "";
    }
  };

  const removeFile = (idx) => {
    setFiles((curr) => {
      if (idx < 0 || idx >= curr.length) return curr;
      const copy = [...curr];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const makePrimaryNew = (idx) => {
    if (!allowNewPrimary) return;
    setFiles((curr) => {
      if (idx <= 0 || idx >= curr.length) return curr;
      const copy = [...curr];
      const [item] = copy.splice(idx, 1);
      copy.unshift(item);
      return copy;
    });
  };

  // ========= Acciones sobre imágenes EXISTENTES =========
  const deleteExisting = async (img) => {
    if (!editProductId || img.id === "main") return; // no borrar principal
    setImgBusy(`del-${img.id}`);
    setLoadingImages(true);
    setServerError("");
    try {
      await axios.delete(
        `${config.apiBaseUrl}/products/${editProductId}/images/${img.id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setExThumbs((arr) => arr.filter((t) => t.id !== img.id));
    } catch (err) {
      setErrors((prev) => ({ ...prev, ...extractFieldErrors(err) }));
      setServerError(extractValidationMessage(err));
    } finally {
      setImgBusy(null);
      setLoadingImages(false);
    }
  };

  const makeExistingPrimary = async (img) => {
    if (!editProductId || img.id === "main") return; // ya es principal
    setImgBusy(`main-${img.id}`);
    setLoadingImages(true);
    setServerError("");
    try {
      await axios.patch(
        `${config.apiBaseUrl}/products/${editProductId}/images/${img.id}/make-main`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      // Reordenar UI: mover esa imagen a la posición 0
      setExThumbs((arr) => {
        const i = arr.findIndex((t) => t.id === img.id);
        if (i <= 0) return arr;
        const copy = [...arr];
        const [item] = copy.splice(i, 1);
        copy.unshift(item);
        return copy;
      });
    } catch (err) {
      setErrors((prev) => ({ ...prev, ...extractFieldErrors(err) }));
      setServerError(extractValidationMessage(err));
    } finally {
      setImgBusy(null);
      setLoadingImages(false);
    }
  };

  // ========= Validación =========
  const validate = () => {
    const e = {};
    if (!parentSel) e.categoryParent = "Obligatorio";
    if (!childSel) e.categoryChild = "Obligatorio";
    if (!title.trim()) e.title = "Obligatorio";
    if (price === "" || isNaN(Number(price)) || Number(price) < 0) e.price = "Precio inválido";
    if (!editProductId && files.length < 1) e.images = "Subí al menos 1 imagen";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ========= Requests =========
  const putMyProduct = () =>
    axios.put(
      `${config.apiBaseUrl}/my-products/${editMyProductId}`,
      { price: parseFloat(price), stock: inStock ? 1 : 0, show_home: showHome ? 1 : 0 },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

  const putProductMeta = () => {
    const payload = {
      title: title.trim(),
      description: description.trim(),
      barcode: barcode.trim(),
    };
    if (parentSel) {
      if (parentSel.id) payload.category_parent_id = parentSel.id;
      else payload.category_parent = parentSel.name;
    }
    if (childSel) {
      if (childSel.id) payload.category_child_id = childSel.id;
      else payload.category_child = childSel.name;
    }
    return axios.put(
      `${config.apiBaseUrl}/my-custom-products/${editProductId}`,
      payload,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  };

  const postNewImages = async () => {
    if (!files.length) return null;
    const fd = new FormData();
    files.forEach((f) => fd.append("images[]", f));
    return axios.post(`${config.apiBaseUrl}/products/${editProductId}/images`, fd, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  // ========= Submit =========
  const submit = async () => {
    setServerError("");
    if (!validate()) return;

    // CREAR
    if (!editProductId) {
      const fd = new FormData();
      fd.append("category_parent", parentSel.name);
      fd.append("category_child", childSel.name);
      fd.append("title", title.trim());
      if (description.trim()) fd.append("description", description.trim());
      if (barcode.trim()) fd.append("barcode", barcode.trim());
      fd.append("price", String(price));
      fd.append("in_stock", inStock ? "1" : "0");
      fd.append("show_home", showHome ? "1" : "0");
      files.forEach((f) => fd.append("images[]", f));

      setSubmitting(true);
      try {
        await axios.post(`${config.apiBaseUrl}/my-custom-products`, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        onSuccess?.();
        onClose?.();
      } catch (err) {
        setErrors(extractFieldErrors(err));
        setServerError(extractValidationMessage(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // EDITAR
    setSubmitting(true);
    try {
      const reqs = [putMyProduct()];
      if (metaDirty) reqs.push(putProductMeta());
      if (files.length) reqs.push(postNewImages());
      await Promise.all(reqs);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setErrors((prev) => ({ ...prev, ...extractFieldErrors(err) }));
      setServerError(extractValidationMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Overlay simple para spinner dentro de una tarjeta
  const Overlay = () => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(255,255,255,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0.75rem",
        pointerEvents: "none",
      }}
    >
      <span className="spinner-border spinner-border-sm text-secondary" />
    </div>
  );

  if (!show) return null;

  const hasExactParentMatch = parentOptions.some(
    (opt) => normalizeText(opt?.name) === normalizeText(parentQuery)
  );
  const hasExactChildMatch = childOptions.some(
    (opt) => normalizeText(opt?.name) === normalizeText(childQuery)
  );

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-lg" style={{ marginTop: "5vh", marginBottom: "5vh", maxHeight: "90vh" }}>
        <div className="modal-content" style={{ overflowY: "auto", maxHeight: "90vh", position: "relative" }}>
          <div className="modal-header">
            <h5 className="modal-title">{isEdit ? "Editar producto propio" : "Crear producto propio"}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {serverError && <div className="alert alert-danger py-2">{serverError}</div>}

            {/* Spinner de pantalla mientras carga todo el producto */}
            {loadingData ? (
              <SpinnerCentrado mensaje="Cargando producto..." />
            ) : (
              <div className="row g-3">
                {/* Categorías */}
                <div className="col-md-6">
                  <label className="form-label">Categoría *</label>
                  {parentSel ? (
                    <div className="chip mb-2 me-2">
                      <span className="chip-label">{parentSel.name}</span>
                      <button
                        type="button"
                        className="chip-x"
                        onClick={() => {
                          setParentSel(null);
                          setParentQuery("");
                          setChildSel(null);
                          setChildQuery("");
                          setChildOptions([]);
                          setMetaDirty(true);
                        }}
                        aria-label="Quitar categoría"
                        title="Quitar"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="position-relative">
                      <input
                        className={`form-control ${errors.categoryParent ? "is-invalid" : ""}`}
                        value={parentQuery}
                        onChange={onChangeParent}
                        onKeyDown={onParentKeyDown}
                        placeholder="Ej: Almacén"
                        autoComplete="off"
                        aria-autocomplete="list"
                        aria-expanded={Boolean(loadingParent || parentOptions.length)}
                      />
                      {loadingParent && (
                        <span className="position-absolute end-0 top-50 translate-middle-y me-2">
                          <span className="spinner-border spinner-border-sm text-secondary" />
                        </span>
                      )}
                      {errors.categoryParent && <div className="invalid-feedback">{errors.categoryParent}</div>}

                      {parentQuery.trim().length >= MIN_CHARS && (
                        <div className="autosuggest-panel">
                          {loadingParent && (
                            <div className="autosuggest-state">
                              <span className="spinner-border spinner-border-sm me-2" />
                              Buscando…
                            </div>
                          )}
                          {!loadingParent && parentErr && <div className="autosuggest-state text-danger">{parentErr}</div>}
                          {!loadingParent &&
                            !parentErr &&
                            parentOptions.map((opt, idx) => (
                              <div key={opt.id ?? `new-${idx}`} className="autosuggest-row" onMouseDown={() => selectParent(opt)}>
                                {opt.name}
                              </div>
                            ))}
                          {!loadingParent && !parentErr && parentQuery.trim() !== "" && !hasExactParentMatch && (
                            <div
                              className="autosuggest-row fw-semibold"
                              onMouseDown={() => selectParent({ id: null, name: parentQuery.trim(), isNew: true })}
                            >
                              Crear “{parentQuery.trim()}”
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Subcategoria *</label>
                  {childSel ? (
                    <div className={`chip mb-2 me-2 ${childSel.pantry_id ? "chip--own" : "chip--global"}`}>
                      <span className="chip-label">{childSel.name}</span>
                      <button
                        type="button"
                        className="chip-x"
                        onClick={() => {
                          setChildSel(null);
                          setChildQuery("");
                          setMetaDirty(true);
                        }}
                        aria-label="Quitar subcategoria"
                        title="Quitar"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="position-relative">
                      <input
                        className={`form-control ${errors.categoryChild ? "is-invalid" : ""}`}
                        value={childQuery}
                        onChange={onChangeChild}
                        onKeyDown={onChildKeyDown}
                        placeholder="Ej: Harinas"
                        autoComplete="off"
                        disabled={!parentSel}
                        aria-autocomplete="list"
                        aria-expanded={Boolean(loadingChild || childOptions.length)}
                      />
                      {errors.categoryChild && <div className="invalid-feedback">{errors.categoryChild}</div>}
                      {loadingChild && (
                        <span className="position-absolute end-0 top-50 translate-middle-y me-2">
                          <span className="spinner-border spinner-border-sm text-secondary" />
                        </span>
                      )}
                      {parentSel && childQuery.trim().length >= MIN_CHARS && (
                        <div className="autosuggest-panel">
                          {loadingChild && (
                            <div className="autosuggest-state">
                              <span className="spinner-border spinner-border-sm me-2" />
                              Buscando…
                            </div>
                          )}
                          {!loadingChild && childErr && <div className="autosuggest-state text-danger">{childErr}</div>}
                          {!loadingChild &&
                            !childErr &&
                            childOptions.map((opt, idx) => (
                              <div key={opt.id ?? `cnew-${idx}`} className="autosuggest-row" onMouseDown={() => selectChild(opt)}>
                                {opt.name}
                              </div>
                            ))}
                          {!loadingChild && !childErr && childQuery.trim() !== "" && !hasExactChildMatch && (
                            <div
                              className="autosuggest-row fw-semibold"
                              onMouseDown={() => selectChild({ id: null, name: childQuery.trim(), isNew: true })}
                            >
                              Crear “{childQuery.trim()}”
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Título + Precio */}
                <div className="col-lg-8">
                  <label className="form-label">Título *</label>
                  <input
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); if (isEdit) setMetaDirty(true); }}
                    placeholder="Ej: Harina 0000 Premium 1 kg"
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>

                <div className="col-lg-4">
                  <label className="form-label">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    className={`form-control ${errors.price ? "is-invalid" : ""}`}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>

                {/* Descripción */}
                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); if (isEdit) setMetaDirty(true); }}
                  />
                </div>

                {/* Código de barras */}
                <div className="col-md-6">
                  <label className="form-label">Código de barras</label>
                  <input
                    className="form-control"
                    value={barcode}
                    onChange={(e) => { setBarcode(e.target.value); if (isEdit) setMetaDirty(true); }}
                    placeholder="Opcional"
                  />
                </div>

                {/* Estado / Inicio */}
                <div className="col-md-3">
                  <label className="form-label">¿Hay stock?</label>
                  <select
                    className="form-select"
                    value={inStock ? 1 : 0}
                    onChange={(e) => setInStock(Number(e.target.value) === 1)}
                  >
                    <option value={1}>Sí</option>
                    <option value={0}>No</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">¿Mostrar en inicio?</label>
                  <select
                    className="form-select"
                    value={showHome ? 1 : 0}
                    onChange={(e) => setShowHome(Number(e.target.value) === 1)}
                  >
                    <option value={0}>No</option>
                    <option value={1}>Sí</option>
                  </select>
                </div>

                {/* Imágenes actuales */}
                {isEdit && (
                  <div className="col-12">
                    <label className="form-label d-flex align-items-center gap-2">
                      Imágenes actuales
                      {loadingImages && <SpinnerCentrado compact mensaje="Cargando imágenes..." />}
                    </label>

                    {!loadingImages && exThumbs.length === 0 && (
                      <div className="text-muted">Sin imágenes.</div>
                    )}

                    {!loadingImages && exThumbs.length > 0 && (
                      <div className="d-flex flex-wrap gap-2">
                        {exThumbs.map((t, i) => {
                          const isMain = i === 0;
                          const busy = imgBusy === `main-${t.id}` || imgBusy === `del-${t.id}`;
                          return (
                            <div key={t.id ?? i} className="thumb-card" style={{ width: 120, position: "relative" }}>
                              <div
                                className={`thumb-inner ${isMain ? "thumb-primary" : ""}`}
                                role="button"
                                tabIndex={0}
                                onClick={() => !isMain && makeExistingPrimary(t)}
                                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !isMain && makeExistingPrimary(t)}
                                title={isMain ? "Imagen principal" : "Marcar como principal"}
                                style={{ position: "relative", pointerEvents: busy ? "none" : "auto" }}
                              >
                                <div className="ratio ratio-1x1 thumb-img-wrap">
                                  <img src={t.url} alt={`img-${t.id}`} className="thumb-img" />
                                </div>

                                <span className={`thumb-radio ${isMain ? "active" : ""}`} aria-pressed={isMain} />
                                {isMain && <span className="thumb-badge">Principal</span>}

                                {busy && <Overlay />}
                              </div>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger w-100 mt-1"
                                disabled={isMain || imgBusy === `del-${t.id}`}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteExisting(t);
                                }}
                                title={isMain ? "No se puede borrar la principal" : "Quitar imagen"}
                                style={{ position: "relative", zIndex: 2 }}
                              >
                                {imgBusy === `del-${t.id}` ? (
                                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                ) : (
                                  "Quitar"
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Nuevas imágenes */}
                <div className="col-12">
                  <label className="form-label">
                    {isEdit
                      ? `Nuevas imágenes (opcional) · capacidad total: ${Math.max(0, MAX_TOTAL - exThumbs.length)} · disponibles: ${remainingCapacity}`
                      : `Imágenes (1–${MAX_TOTAL}) *`}
                  </label>

                  <div className="input-group mb-2">
                    <input
                      type="file"
                      className={`form-control ${errors.images ? "is-invalid" : ""}`}
                      accept=".jpg,.jpeg,.png,.webp"
                      multiple
                      onChange={onFileInputChange}
                      disabled={remainingCapacity <= 0}
                      title={
                        remainingCapacity <= 0
                          ? "Capacidad completa"
                          : `Podés agregar hasta ${remainingCapacity} archivo(s)`
                      }
                    />
                    <span className="input-group-text">
                      {files.length} archivo{files.length !== 1 ? "s" : ""}
                    </span>
                    {optimizing && (
                      <span className="input-group-text">
                        <span className="spinner-border spinner-border-sm me-2" /> Optimizando…
                      </span>
                    )}
                  </div>

                  <div className="form-text mb-2">
                    Máx <b>4 MB</b> por imagen. Formatos <b>JPG/PNG/WEBP</b>. Si el archivo es grande,
                    lo optimizamos automáticamente antes de subir.
                  </div>

                  {imgError && <div className="alert alert-warning py-2">{imgError}</div>}
                  {errors.images && <div className="invalid-feedback d-block">{errors.images}</div>}

                  {files.length > 0 && (
                    <div className="d-flex flex-wrap gap-2">
                      {files.map((f, i) => {
                        const isPrimaryNew = allowNewPrimary && i === 0;
                        const key = `${f.name}-${f.size}-${f.lastModified}`;
                        const setPrimary = () => { if (allowNewPrimary && !isPrimaryNew) makePrimaryNew(i); };

                        return (
                          <div key={key} className="thumb-card" style={{ width: 120 }}>
                            <div
                              className={`thumb-inner ${isPrimaryNew ? "thumb-primary" : ""}`}
                              role="button"
                              tabIndex={0}
                              onClick={setPrimary}
                              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPrimary()}
                              title={
                                allowNewPrimary
                                  ? (isPrimaryNew ? "Imagen principal" : "Marcar como principal")
                                  : "Las nuevas se agregarán como extras"
                              }
                              style={{ position: "relative" }}
                            >
                              {/* Preview */}
                              <div className="ratio ratio-1x1 thumb-img-wrap">
                                <img src={previews[i]} alt={f.name} className="thumb-img" />
                              </div>

                              {allowNewPrimary && (
                                <>
                                  <span className={`thumb-radio ${isPrimaryNew ? "active" : ""}`} aria-pressed={isPrimaryNew} />
                                  {isPrimaryNew && <span className="thumb-badge">Principal</span>}
                                </>
                              )}
                            </div>

                            <div className="small text-muted mt-1">{bytesToMB(f.size)} MB</div>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger w-100 mt-1"
                              onClick={() => removeFile(i)}
                            >
                              Quitar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isEdit && exThumbs.length > 0 && (
                    <div className="form-text mt-1">
                      Para cambiar la imagen principal usá los botones de <b>Imágenes actuales</b>.{" "}
                      Las nuevas se agregan como <b>extras</b>. Límite total: {MAX_TOTAL}.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button className="btn btn-success" onClick={submit} disabled={submitting || optimizing}>
              {submitting ? (isEdit ? "Guardando..." : "Creando...") : isEdit ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
