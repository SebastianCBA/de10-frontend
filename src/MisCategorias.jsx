import React, { useEffect, useMemo, useState } from "react";
import Layout from "./Layout";
import axios from "axios";
import config from "./config";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronRight,
  FaChevronDown,
  FaLock,
} from "react-icons/fa";

function MisCategorias() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // [{id,name,is_global,subcategorias:[{id,name,fatherId}]}]
  const [tree, setTree] = useState([]);
  const [expanded, setExpanded] = useState(() => new Set());

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [form, setForm] = useState({ id: null, name: "", fatherId: null });

  // Para saber si el modal create viene del botón "Nueva categoría" (crear raíz)
  const [creatingRoot, setCreatingRoot] = useState(false);

  // Delete
  const [confirming, setConfirming] = useState(null);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    }),
    [token]
  );

  const api = axios.create({
    baseURL: config.apiBaseUrl,
    headers: authHeaders,
    timeout: 12000,
  });

  const loadTree = async () => {
    setLoading(true);
    setMensaje("");
    try {
      const r = await api.get("/my-categories-all");
      const roots = Array.isArray(r.data) ? r.data : r.data?.data || [];
      setTree(roots);
      setExpanded(new Set());
    } catch (err) {
      console.error(
        "loadTree",
        err?.response?.status,
        err?.response?.data || err?.message
      );
      setTree([]);
      setMensaje(
        err?.response?.data?.message || "No se pudieron cargar las categorías."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    loadTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggle = (id) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const getCategoryName = (id) => {
    if (id == null) return "";
    for (const r of tree) {
      if (r.id === id) return r.name;
      for (const s of r.subcategorias || []) if (s.id === id) return s.name;
    }
    return `#${id}`;
  };

  // Modal open
  const openCreateRoot = () => {
    setModalMode("create");
    setCreatingRoot(true); // ← proviene de “Nueva categoría”
    setForm({ id: null, name: "", fatherId: null }); // raíz
    setModalOpen(true);
  };

  const openCreateSub = (fatherId) => {
    setModalMode("create");
    setCreatingRoot(false); // ← proviene de “+ Sub”
    setForm({ id: null, name: "", fatherId });
    setModalOpen(true);
  };

  const openEdit = (node) => {
    setModalMode("edit");
    setCreatingRoot(false);
    setForm({ id: node.id, name: node.name, fatherId: node.fatherId ?? null });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMensaje("");
    try {
      if (modalMode === "create") {
        await api.post("/my-categories", {
          name: form.name.trim(),
          fatherId: creatingRoot ? null : form.fatherId ?? null,
        });
      } else {
        // Editar: renombrar y preservar fatherId
        await api.put(`/my-categories/${form.id}`, {
          name: form.name.trim(),
          fatherId: form.fatherId ?? null,
        });
      }
      setMensaje("Categoría guardada correctamente.");
      closeModal();
      await loadTree();
    } catch (err) {
      console.error(
        "save",
        err?.response?.status,
        err?.response?.data || err?.message
      );
      setMensaje(
        err?.response?.data?.message || "No se pudo guardar la categoría."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    setMensaje("");
    try {
      await api.delete(`/my-categories/${id}`);
      setMensaje("Categoría eliminada.");
      setConfirming(null);
      await loadTree();
    } catch (err) {
      console.error(
        "delete",
        err?.response?.status,
        err?.response?.data || err?.message
      );
      setMensaje(
        err?.response?.data?.message || "No se pudo eliminar la categoría."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======= RENDER FILAS CON LAYOUT RESPONSIVE =======

  // Acciones en un bloque reutilizable
  const Actions = ({ onAddSub, onEdit, onDelete, showEditDelete }) => (
    <div className="d-flex gap-2 ms-sm-auto mt-2 mt-sm-0">
      {onAddSub && (
        <button
          className="btn btn-sm btn-primary text-white"
          onClick={onAddSub}
          title="Agregar subcategoría propia"
        >
          <FaPlus className="me-1" />
          Sub
        </button>
      )}
      {showEditDelete && (
        <>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onEdit}
            title="Editar"
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={onDelete}
            title="Eliminar"
          >
            <FaTrash />
          </button>
        </>
      )}
    </div>
  );

  const RootRow = ({ root }) => {
    const isOpen = expanded.has(root.id);
    const hasChildren = (root.subcategorias || []).length > 0;

    return (
      <div className="border rounded mb-2">
        <div
          className="py-2 px-2 d-flex flex-column flex-sm-row align-items-start align-items-sm-center"
          style={{ gap: 10 }}
        >
          <div className="d-flex align-items-center" style={{ gap: 10 }}>
            <button
              type="button"
              className="btn btn-sm btn-light"
              disabled={!hasChildren}
              onClick={() => hasChildren && toggle(root.id)}
              aria-label={isOpen ? "Contraer" : "Expandir"}
              title={isOpen ? "Contraer" : "Expandir"}
              style={{ width: 28, opacity: hasChildren ? 1 : 0.6 }}
            >
              {isOpen ? <FaChevronDown /> : <FaChevronRight />}
            </button>

            <div className="flex-grow-1">
              <strong>{root.name}</strong>{" "}
              {root.is_global ? (
                <span className="badge bg-secondary" title="Global">
                  <FaLock style={{ position: "relative", top: "-1px" }} /> Global
                </span>
              ) : (
                <span className="badge bg-info text-dark">Propia</span>
              )}
            </div>
          </div>

          <Actions
            onAddSub={() => openCreateSub(root.id)}
            onEdit={() => openEdit({ ...root, fatherId: null })}
            onDelete={() => setConfirming(root.id)}
            showEditDelete={!root.is_global}
          />
        </div>

        {isOpen && (
          <div className="px-2 pb-2">
            {(root.subcategorias || []).map((s) => (
              <div key={s.id} className="border rounded mb-2">
                <div
                  className="py-2 px-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center"
                  style={{ gap: 10 }}
                >
                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{ width: 28, textAlign: "center" }}>•</span>
                    <div className="flex-grow-1">
                      <strong>{s.name}</strong>{" "}
                      <span className="badge bg-info text-dark">Propia</span>
                    </div>
                  </div>

                  <Actions
                    onAddSub={null}
                    onEdit={() => openEdit({ ...s, fatherId: root.id })}
                    onDelete={() => setConfirming(s.id)}
                    showEditDelete
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!token) return <Navigate to="/login" />;

  return (
    <Layout>
      <div className="container py-5">
        <h1
          className="mb-2"
          style={{ color: "var(--color-secundario)", fontWeight: "bold" }}
        >
          Mis categorías
        </h1>
        <p className="text-muted mb-4" style={{ fontSize: "1.05rem" }}>
          Se muestran las <strong>categorías globales</strong> que tengan al menos
          una <strong>subcategoría propia</strong> debajo, y todas tus categorías
          propias.
        </p>

        {mensaje && (
          <div
            className={`alert ${
              mensaje.toLowerCase().includes("correcta") ||
              mensaje.toLowerCase().includes("eliminada")
                ? "alert-success"
                : "alert-danger"
            }`}
            role="alert"
          >
            {mensaje}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Estructura de categorías</h5>
          <button
            className="btn btn-primary text-white"
            onClick={openCreateRoot}
            disabled={saving}
          >
            <FaPlus className="me-2" /> Nueva categoría
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Cargando categorías…</p>
          </div>
        ) : tree.length === 0 ? (
          <div className="alert alert-info">
            No tenés categorías propias. Creá tu primera categoría o agregá una
            subcategoría debajo de una global.
          </div>
        ) : (
          tree.map((root) => <RootRow key={root.id} root={root} />)
        )}

        {/* MODAL */}
        {modalOpen && (
          <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(0,0,0,.35)" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog">
              <form className="modal-content" onSubmit={handleSave}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalMode === "create"
                      ? "Nueva categoría"
                      : "Editar categoría"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    aria-label="Cerrar"
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      name="name"
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      maxLength={80}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Padre:
                      - Si viene de + Sub => fijo
                      - Si viene de "Nueva categoría" => NO se muestra (siempre raíz) */}
                  {modalMode === "create" && !creatingRoot && form.fatherId != null && (
                    <div className="mb-2">
                      <label className="form-label">Padre</label>
                      <div className="form-control-plaintext">
                        <span className="badge bg-secondary me-2">Fijo</span>
                        {getCategoryName(form.fatherId)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={closeModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success text-white"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
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

        {/* CONFIRM DELETE */}
        {confirming != null && (
          <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(0,0,0,.35)" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Eliminar categoría</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setConfirming(null)}
                    aria-label="Cerrar"
                  />
                </div>
                <div className="modal-body">
                  ¿Seguro que querés eliminar esta categoría?
                  <div className="form-text mt-2">
                    Si tiene subcategorías o productos, el backend lo impedirá.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => setConfirming(null)}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(confirming)}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Eliminando…
                      </>
                    ) : (
                      "Eliminar"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MisCategorias;
