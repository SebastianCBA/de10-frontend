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
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

function MisSucursales() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [branches, setBranches] = useState([]);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [form, setForm] = useState({
    id: null,
    name: "",
    address: "",
    phone: "",
    is_main: false,
  });

  // delete
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

  const loadBranches = async () => {
    setLoading(true);
    setMensaje("");
    try {
      const r = await api.get("/my-branches");
      const items = Array.isArray(r.data) ? r.data : r.data?.data || [];
      setBranches(items);
    } catch (err) {
      console.error("loadBranches", err?.response?.status, err?.response?.data || err?.message);
      setMensaje(err?.response?.data?.message || "No se pudieron cargar las sucursales.");
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openCreate = () => {
    setModalMode("create");
    setForm({ id: null, name: "", address: "", phone: "", is_main: false });
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setModalMode("edit");
    setForm({
      id: b.id,
      name: b.name || "",
      address: b.address || "",
      phone: b.phone || "",
      is_main: !!b.is_main,
    });
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

    const payload = {
      name: form.name.trim(),
      address: form.address?.trim() || "",
      phone: form.phone?.trim() || "",
      is_main: !!form.is_main,
    };

    try {
      if (modalMode === "create") {
        await api.post("/my-branches", payload);
      } else {
        await api.put(`/my-branches/${form.id}`, payload);
      }
      setMensaje("Sucursal guardada correctamente.");
      closeModal();
      await loadBranches();
    } catch (err) {
      console.error("save", err?.response?.status, err?.response?.data || err?.message);
      setMensaje(err?.response?.data?.message || "No se pudo guardar la sucursal.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    setMensaje("");
    try {
      await api.delete(`/my-branches/${id}`);
      setMensaje("Sucursal eliminada.");
      setConfirming(null);
      await loadBranches();
    } catch (err) {
      console.error("delete", err?.response?.status, err?.response?.data || err?.message);
      setMensaje(err?.response?.data?.message || "No se pudo eliminar la sucursal.");
    } finally {
      setSaving(false);
    }
  };

  if (!token) return <Navigate to="/login" />;

  return (
    <Layout>
      <div className="container py-5">
        <h1 className="mb-2" style={{ color: "var(--color-secundario)", fontWeight: "bold" }}>
          Mis sucursales
        </h1>
        <p className="text-muted mb-4" style={{ fontSize: "1.05rem" }}>
          Administrá las sucursales de tu tienda. Podés agregar, editar o eliminar cada una.
        </p>

        {mensaje && (
          <div
            className={`alert ${
              mensaje.toLowerCase().includes("guardada") ||
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
          <h5 className="m-0">Listado de sucursales</h5>
          <button className="btn btn-primary text-white" onClick={openCreate} disabled={saving}>
            <FaPlus className="me-2" /> Nueva sucursal
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Cargando sucursales…</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="alert alert-info">
            No tenés sucursales cargadas. Creá tu primera sucursal.
          </div>
        ) : (
          branches.map((b) => (
            <div key={b.id} className="border rounded mb-2">
              <div
                className="py-2 px-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center"
                style={{ gap: 10 }}
              >
                <div className="flex-grow-1">
                  <div className="fw-bold">{b.name}</div>
                  <div className="text-muted small d-flex flex-column flex-md-row">
                    <div className="me-md-3 mt-1 mt-md-0 d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2" />
                      <span>{b.address || "— Sin dirección —"}</span>
                    </div>
                    <div className="me-md-3 mt-1 mt-md-0 d-flex align-items-center">
                      <FaPhone className="me-2" />
                      <span>{b.phone || "— Sin teléfono —"}</span>
                    </div>
                    {b.is_main ? (
                      <span className="badge bg-secondary ms-0 ms-md-2 mt-2 mt-md-0">Principal</span>
                    ) : (
                      <span className="badge bg-info text-dark ms-0 ms-md-2 mt-2 mt-md-0">Sucursal</span>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2 ms-sm-auto mt-2 mt-sm-0">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => openEdit(b)}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setConfirming(b.id)}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* MODAL Create/Edit */}
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
                    {modalMode === "create" ? "Nueva sucursal" : "Editar sucursal"}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal} aria-label="Cerrar" />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      name="name"
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      maxLength={100}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Dirección</label>
                    <input
                      name="address"
                      type="text"
                      className="form-control"
                      value={form.address}
                      onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                      maxLength={255}
                      placeholder="Calle 123, Ciudad"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      name="phone"
                      type="text"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      maxLength={40}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>

                  {/* (Opcional) marcar como principal */}
                  {/* <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_main"
                      checked={!!form.is_main}
                      onChange={(e) => setForm((p) => ({ ...p, is_main: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor="is_main">
                      Sucursal principal
                    </label>
                  </div> */}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success text-white" disabled={saving}>
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
                  <h5 className="modal-title">Eliminar sucursal</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setConfirming(null)}
                    aria-label="Cerrar"
                  />
                </div>
                <div className="modal-body">
                  ¿Seguro que querés eliminar esta sucursal?
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

export default MisSucursales;
