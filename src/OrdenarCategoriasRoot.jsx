// src/OrdenarCategoriasRoot.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import config from "./config";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaChevronRight, FaChevronDown, FaEdit /*, FaTrash */ } from "react-icons/fa";

/* ---------- Estilos base ---------- */
const LEVEL = {
  root: { bg: "#fff",    border: "#e9ecef"   },
  sub:  { bg: "#fff8e6", border: "#ffd8a8"   },
  prod: { bg: "#eef7ff", border: "#b6e0fe"   },
};
const pad = (px) => ({ paddingLeft: px });

/* Chevron pill centrado */
const ICON_SVG = { width: 14, height: 14 };
const ICON_BTN_PILL = {
  width: 28,
  height: 28,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  border: "none",
  borderRadius: 8,
  background: "var(--color-secundario, #ff7a00)",
  color: "#fff",
  lineHeight: 1,
  boxShadow: "0 .05rem .25rem rgba(0,0,0,.08)",
};

/* API */
const API_BASE = (config.apiBaseUrl || "/api").replace(/\/+$/, "");

/* ---------- DnD utils ---------- */
function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
const DID = {
  ROOT: "ROOT",
  SUB:  (catId) => `SUB:${catId}`,
  PROD: (subId) => `PROD:${subId}`,
};
const parseDid = (did) => {
  if (did === "ROOT") return { type: "ROOT" };
  if (did.startsWith("SUB:"))  return { type: "SUB",  catId: did.split(":")[1] };
  if (did.startsWith("PROD:")) return { type: "PROD", subId: did.split(":")[1] };
  return { type: "UNKNOWN" };
};

/* ---------- UI helpers ---------- */
const DragHandle = () => (
  <span title="Arrastrar para ordenar" style={{ cursor: "grab", userSelect: "none", fontWeight: 600, marginRight: 8 }}>
    ≡
  </span>
);

const Chip = ({ kind = "info", children, className }) => {
  const styles =
    kind === "error"
      ? { background: "#fee2e2", color: "#b91c1c" }
      : { background: "#e8f5e9", color: "#1b5e20" };
  return (
    <span
      className={className}
      style={{ ...styles, display: "inline-block", borderRadius: 999, padding: "6px 10px", fontWeight: 600 }}
    >
      {children}
    </span>
  );
};

const RowDot = ({ busy, error }) => {
  if (!busy && !error) return null;
  return (
    <span
      title={error ? "Error al guardar" : "Guardando…"}
      style={{
        position: "absolute",
        top: 8,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 6,
        background: error ? "#ef4444" : "#22c55e",
        boxShadow: "0 0 0 2px rgba(255,255,255,.9)",
      }}
    />
  );
};

const Row = ({ level, children }) => (
  <div
    style={{
      position: "relative",
      background: LEVEL[level].bg,
      border: `1px solid ${LEVEL[level].border}`,
      borderRadius: 10,
      padding: "10px 12px",
      marginBottom: 8,
    }}
  >
    {children}
  </div>
);

/* ---------- Componente ---------- */
export default function OrdenarCategoriasRoot() {
  const [loading, setLoading] = useState(false);
  const [pantryId, setPantryId] = useState(null);

  // [{id,name,expanded,subcategories:[{id,name,expanded,products:[{id,name}]}]}]
  const [tree, setTree] = useState([]);

  // Autosave
  const [savingRoot, setSavingRoot] = useState(false);
  const [savingSubIds, setSavingSubIds] = useState(new Set());
  const [savingProdIds, setSavingProdIds] = useState(new Set());

  // Errores
  const [errorRoot, setErrorRoot] = useState(false);
  const [errorSubIds, setErrorSubIds] = useState(new Set());
  const [errorProdIds, setErrorProdIds] = useState(new Set());

  // debounce timers
  const debounceTimers = useRef({});

  // --- Modal editar ---
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    level: "root",          // "root" | "sub"
    parentId: null,         // para sub: catId
    name: "",
  });

  // auth
  const token = useMemo(() => localStorage.getItem("token") || "", []);
  const axiosAuth = useMemo(() => {
    const a = axios.create();
    a.interceptors.request.use((cfg) => {
      cfg.headers = cfg.headers || {};
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      return cfg;
    });
    return a;
  }, [token]);

  /* Init: pantry + árbol con productos */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const rPantry = await axiosAuth.get(`${API_BASE}/my-pantry`);
        const pData   = rPantry.data?.pantry ?? rPantry.data ?? rPantry.data?.data;
        const pid     = pData?.id;
        if (!pid) throw new Error("No se pudo determinar pantry.id");
        if (!mounted) return;
        setPantryId(pid);

        const rTree = await axiosAuth.get(
          `${API_BASE}/pantries/${pid}/order/categories`,
          { params: { with_children: 1, parent_id: 0 } }
        );

        const rawTree = rTree.data?.tree ?? [];
        const normalized = (rawTree || []).map((root) => ({
          id: String(root.id),
          name: root.name,
          expanded: false,
          subcategories: (root.children || []).map((s) => ({
            id: String(s.id),
            name: s.name,
            expanded: false,
            products: (s.products || []).map((p) => ({
              id: String(p.id),
              name: p.name ?? `#${p.id}`,
            })),
          })),
        }));
        if (!mounted) return;
        setTree(normalized);
      } catch (err) {
        console.error(err);
        alert("No se pudo cargar el árbol de categorías.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [axiosAuth]);

  /* Expand/contraer */
  const toggleCat = (catId) => {
    setTree((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, expanded: !c.expanded } : c))
    );
  };
  const toggleSub = (catId, subId) => {
    setTree((prev) =>
      prev.map((c) =>
        c.id !== catId
          ? c
          : {
              ...c,
              subcategories: c.subcategories.map((s) =>
                s.id === subId ? { ...s, expanded: !s.expanded } : s
              ),
            }
      )
    );
  };

  /* Debounce */
  const schedule = (key, fn, delay = 700) => {
    clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(fn, delay);
  };

  /* Guardados (reciben los ids ya recalculados) */
  const saveRootNow = async (orderedIds) => {
    if (!pantryId) return;
    setSavingRoot(true);
    setErrorRoot(false);
    try {
      await axiosAuth.put(`${API_BASE}/pantries/${pantryId}/order/categories`, {
        parent_id: 0,
        ordered_ids: orderedIds,
      });
    } catch (e) {
      console.error(e);
      setErrorRoot(true);
    } finally {
      setSavingRoot(false);
    }
  };

  const saveSubNow = async (catId, orderedIds) => {
    if (!pantryId) return;
    setSavingSubIds((prev) => new Set(prev).add(catId));
    setErrorSubIds((prev) => { const n = new Set(prev); n.delete(catId); return n; });
    try {
      await axiosAuth.put(`${API_BASE}/pantries/${pantryId}/order/categories`, {
        parent_id: Number(catId),
        ordered_ids: orderedIds,
      });
    } catch (e) {
      console.error(e);
      setErrorSubIds((prev) => new Set(prev).add(catId));
    } finally {
      setSavingSubIds((prev) => { const n = new Set(prev); n.delete(catId); return n; });
    }
  };

  const saveProdNow = async (subId, orderedIds) => {
    if (!pantryId) return;
    setSavingProdIds((prev) => new Set(prev).add(subId));
    setErrorProdIds((prev) => { const n = new Set(prev); n.delete(subId); return n; });
    try {
      await axiosAuth.put(`${API_BASE}/pantries/${pantryId}/order/products`, {
        category_id: Number(subId),
        ordered_ids: orderedIds,
      });
    } catch (e) {
      console.error(e);
      setErrorProdIds((prev) => new Set(prev).add(subId));
    } finally {
      setSavingProdIds((prev) => { const n = new Set(prev); n.delete(subId); return n; });
    }
  };

  const scheduleSaveRoot = (ids)          => schedule("root",          () => saveRootNow(ids));
  const scheduleSaveSub  = (catId, ids)    => schedule(`sub:${catId}`,  () => saveSubNow(catId, ids));
  const scheduleSaveProd = (subId, ids)    => schedule(`prod:${subId}`, () => saveProdNow(subId, ids));

  /* DnD */
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const src = parseDid(source.droppableId);
    const dst = parseDid(destination.droppableId);
    if (src.type !== dst.type || source.droppableId !== destination.droppableId) return;

    if (src.type === "ROOT") {
      const next = reorder(tree, source.index, destination.index);
      setTree(next);
      scheduleSaveRoot(next.map(c => Number(c.id)));
      return;
    }

    if (src.type === "SUB") {
      const catId = src.catId;
      const next = tree.map((c) => {
        if (c.id !== catId) return c;
        const subsNext = reorder(c.subcategories, source.index, destination.index);
        return { ...c, subcategories: subsNext };
      });
      setTree(next);
      const ids = (next.find(c => c.id === catId)?.subcategories || []).map(s => Number(s.id));
      scheduleSaveSub(catId, ids);
      return;
    }

    if (src.type === "PROD") {
      const subId = src.subId;
      let parentId = null;
      for (const c of tree) {
        if (c.subcategories.some(s => s.id === subId)) { parentId = c.id; break; }
      }
      const next = tree.map((c) => {
        if (c.id !== parentId) return c;
        return {
          ...c,
          subcategories: c.subcategories.map((s) => {
            if (s.id !== subId) return s;
            const prodsNext = reorder(s.products, source.index, destination.index);
            return { ...s, products: prodsNext };
          }),
        };
      });
      setTree(next);
      let ids = [];
      for (const c of next) {
        const s = c.subcategories.find(x => x.id === subId);
        if (s) { ids = s.products.map(p => Number(p.id)); break; }
      }
      scheduleSaveProd(subId, ids);
    }
  };

  /* ----- Editar (modal) ----- */
  const openEditRoot = (cat) => {
    setEditForm({ id: cat.id, level: "root", parentId: null, name: cat.name });
    setEditOpen(true);
  };
  const openEditSub = (catId, sub) => {
    setEditForm({ id: sub.id, level: "sub", parentId: catId, name: sub.name });
    setEditOpen(true);
  };
  const closeEdit = () => { setEditOpen(false); setEditSaving(false); };

  const submitEdit = async (e) => {
    e?.preventDefault?.();
    setEditSaving(true);
    try {
      await axiosAuth.put(`${API_BASE}/my-categories/${editForm.id}`, {
        name: editForm.name.trim(),
        fatherId: editForm.level === "root" ? null : Number(editForm.parentId),
      });
      // Actualizar UI
      setTree(prev => prev.map(c => {
        if (editForm.level === "root") {
          if (c.id === editForm.id) return { ...c, name: editForm.name.trim() };
          return c;
        }
        if (c.id !== editForm.parentId) return c;
        return {
          ...c,
          subcategories: c.subcategories.map(s =>
            s.id === editForm.id ? { ...s, name: editForm.name.trim() } : s
          ),
        };
      }));
      closeEdit();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el cambio.");
    } finally {
      setEditSaving(false);
    }
  };

  /* Estado global de guardado */
  const savingAny = savingRoot || savingSubIds.size > 0 || savingProdIds.size > 0;
  const errorAny  = errorRoot || errorSubIds.size > 0 || errorProdIds.size > 0;

  return (
    <Layout title="Ordenar categorías">
      <div className="container-fluid" style={{ maxWidth: 1100 }}>
        <div className="mb-2">
          <h4 className="mb-2">Ordená categorías, subcategorías y productos</h4>
          <p className="text-muted mb-1">
            Desde acá podés editar las <strong>categorías propias</strong> y acomodar el
            orden <strong>arrastrando</strong>.
          </p>
          <p className="text-muted" style={{ fontStyle: "italic" }}>
            Nota: puede haber más categorías, pero acá solo figuran las que tienen al menos
            un producto disponible.
          </p>

          {savingAny && <Chip className="mt-1">Guardando…</Chip>}
          {errorAny && (
            <span className="ms-2">
              <Chip kind="error">hubo un error</Chip>
            </span>
          )}

          <div className="text-muted mt-1">Guardado automático</div>
        </div>

        {loading ? (
          <div className="text-center py-5">Cargando árbol…</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={DID.ROOT} type="ROOT">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {tree.map((cat, idx) => (
                    <Draggable key={cat.id} draggableId={`cat-${cat.id}`} index={idx}>
                      {(dragProvided) => (
                        <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} style={{ ...dragProvided.draggableProps.style }}>
                          <Row level="root">
                            <RowDot busy={savingSubIds.has(cat.id)} error={errorSubIds.has(cat.id)} />
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <span {...dragProvided.dragHandleProps}><DragHandle /></span>
                                <button
                                  type="button"
                                  onClick={() => toggleCat(cat.id)}
                                  aria-label={cat.expanded ? "Contraer" : "Expandir"}
                                  title={cat.expanded ? "Contraer" : "Expandir"}
                                  style={{ ...ICON_BTN_PILL, marginRight: 8 }}
                                >
                                  {cat.expanded ? <FaChevronDown style={ICON_SVG} /> : <FaChevronRight style={ICON_SVG} />}
                                </button>
                                <strong className="me-2">{cat.name}</strong>
                                <span className="badge bg-info text-dark">Propia</span>
                              </div>

                              <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-warning text-white" title="Editar" onClick={() => openEditRoot(cat)}>
                                  <FaEdit />
                                </button>
                                {/* Eliminar oculto en esta vista
                                <button className="btn btn-sm btn-danger text-white" title="Eliminar">
                                  <FaTrash />
                                </button>
                                */}
                              </div>
                            </div>

                            {cat.expanded && (
                              <div style={{ marginTop: 10, ...pad(24) }}>
                                <Droppable droppableId={DID.SUB(cat.id)} type="SUB">
                                  {(subProvided) => (
                                    <div ref={subProvided.innerRef} {...subProvided.droppableProps}>
                                      {cat.subcategories.length === 0 && (
                                        <div className="text-muted" style={{ padding: "6px 10px" }}>(Sin subcategorías)</div>
                                      )}

                                      {cat.subcategories.map((sub, sidx) => (
                                        <Draggable key={sub.id} draggableId={`sub-${sub.id}`} index={sidx}>
                                          {(subDrag) => (
                                            <div ref={subDrag.innerRef} {...subDrag.draggableProps} style={{ ...subDrag.draggableProps.style }}>
                                              <Row level="sub">
                                                <RowDot busy={savingProdIds.has(sub.id)} error={errorProdIds.has(sub.id)} />
                                                <div className="d-flex align-items-center justify-content-between">
                                                  <div className="d-flex align-items-center">
                                                    <span {...subDrag.dragHandleProps}><DragHandle /></span>
                                                    <button
                                                      type="button"
                                                      onClick={() => toggleSub(cat.id, sub.id)}
                                                      aria-label={sub.expanded ? "Contraer" : "Expandir"}
                                                      title={sub.expanded ? "Contraer" : "Expandir"}
                                                      style={{ ...ICON_BTN_PILL, marginRight: 8 }}
                                                    >
                                                      {sub.expanded ? <FaChevronDown style={ICON_SVG} /> : <FaChevronRight style={ICON_SVG} />}
                                                    </button>
                                                    <span className="me-2">{sub.name}</span>
                                                    <span className="badge bg-info text-dark">Propia</span>
                                                  </div>

                                                  <div className="d-flex gap-2">
                                                    <button className="btn btn-sm btn-warning text-white" title="Editar" onClick={() => openEditSub(cat.id, sub)}>
                                                      <FaEdit />
                                                    </button>
                                                    {/* Eliminar oculto
                                                    <button className="btn btn-sm btn-danger text-white" title="Eliminar">
                                                      <FaTrash />
                                                    </button>
                                                    */}
                                                  </div>
                                                </div>

                                                {sub.expanded && (
                                                  <div style={{ marginTop: 8, ...pad(24) }}>
                                                    <Droppable droppableId={DID.PROD(sub.id)} type="PROD">
                                                      {(prodProvided) => (
                                                        <div ref={prodProvided.innerRef} {...prodProvided.droppableProps}>
                                                          {sub.products.length === 0 && (
                                                            <div className="text-muted" style={{ padding: "6px 10px" }}>
                                                              (Sin productos presentes)
                                                            </div>
                                                          )}

                                                          {sub.products.map((p, pidx) => (
                                                            <Draggable key={p.id} draggableId={`prod-${p.id}`} index={pidx}>
                                                              {(pDrag) => (
                                                                <div ref={pDrag.innerRef} {...pDrag.draggableProps} style={{ ...pDrag.draggableProps.style }}>
                                                                  <Row level="prod">
                                                                    <div className="d-flex align-items-center">
                                                                      <span {...pDrag.dragHandleProps}><DragHandle /></span>
                                                                      <span>{p.name}</span>
                                                                    </div>
                                                                  </Row>
                                                                </div>
                                                              )}
                                                            </Draggable>
                                                          ))}

                                                          {prodProvided.placeholder}
                                                        </div>
                                                      )}
                                                    </Droppable>
                                                  </div>
                                                )}
                                              </Row>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                      {subProvided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </div>
                            )}
                          </Row>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* MODAL EDITAR */}
        {editOpen && (
          <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.35)" }} role="dialog" aria-modal="true">
            <div className="modal-dialog">
              <form className="modal-content" onSubmit={submitEdit}>
                <div className="modal-header">
                  <h5 className="modal-title">Editar {editForm.level === "root" ? "categoría" : "subcategoría"}</h5>
                  <button type="button" className="btn-close" onClick={closeEdit} aria-label="Cerrar" />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      maxLength={80}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={closeEdit}>Cancelar</button>
                  <button type="submit" className="btn btn-success text-white" disabled={editSaving}>
                    {editSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Guardando…
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
