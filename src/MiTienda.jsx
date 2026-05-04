import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import axios from "axios";
import config from "./config";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function MiTienda() {
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",

    // 👇 nuevos campos
    welcome_title: "",
    welcome_subtitle: "",
    instagram_url: "",
    facebook_url: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [loading, setLoading] = useState(true);   // carga inicial
  const [saving, setSaving] = useState(false);    // guardando/enviando
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    axios
      .get(`${config.apiBaseUrl}/my-pantry`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setForm({
          name: res.data.name || "",
          address: res.data.address || "",
          phone: res.data.phone || "",
          email: res.data.email || "",

          // 👇 traemos lo nuevo (con fallback vacío)
          welcome_title: res.data.welcome_title || "",
          welcome_subtitle: res.data.welcome_subtitle || "",
          instagram_url: res.data.instagram_url || "",
          facebook_url: res.data.facebook_url || "",
        });
        if (res.data.logo) setLogoPreview(res.data.logo);
      })
      .catch(() => {
        setMensaje("Error al obtener los datos de tu tienda");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      const file = files?.[0];
      setLogoFile(file || null);
      if (file) setLogoPreview(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (logoFile) data.append("logo", logoFile);

    axios
      .post(`${config.apiBaseUrl}/my-pantry`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setMensaje("Tienda actualizada correctamente");
        setTimeout(() => setMensaje(""), 3000);
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          if (error.response.data.errors) {
            const errores = Object.values(error.response.data.errors).flat().join(" ");
            setMensaje(errores);
          } else if (error.response.data.message) {
            setMensaje(error.response.data.message);
          } else {
            setMensaje("Error desconocido al guardar los cambios");
          }
        } else {
          setMensaje("Error de conexión con el servidor");
        }
        setTimeout(() => setMensaje(""), 5000);
      })
      .finally(() => setSaving(false));
  };

  if (!token) return <Navigate to="/login" />;

  if (loading) {
    return (
      <Layout>
        <div className="container py-5">Cargando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-5">
        <h1
          style={{ color: "var(--color-secundario)", fontWeight: "bold" }}
          className="mb-2"
        >
          Datos generales de tu tienda
        </h1>
        <p className="text-muted mb-4" style={{ fontSize: "1.1rem" }}>
          Completá la información básica y cómo querés que se vea tu tienda.
        </p>

        {mensaje && (
          <div
            className={`alert ${
              mensaje.includes("correctamente") ? "alert-success" : "alert-danger"
            }`}
            role="alert"
            aria-live="polite"
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} aria-busy={saving}>
          {/* Deshabilita todo mientras guarda */}
          <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0 }}>
            {/* Datos básicos */}
            {[
              { label: "Nombre", name: "name", type: "text" },
              { label: "Dirección", name: "address", type: "text" },
              { label: "Teléfono", name: "phone", type: "text" },
              { label: "Email", name: "email", type: "email", readOnly: true },
            ].map(({ label, name, type, readOnly }, idx) => (
              <div className="mb-3 row align-items-center" key={idx}>
                <label className="col-sm-3 col-form-label text-start text-sm-end">
                  {label}
                </label>
                <div className="col-sm-9">
                  <input
                    name={name}
                    type={type}
                    className="form-control"
                    value={form[name]}
                    onChange={handleChange}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            ))}

            {/* Presentación (nuevos campos) */}
            <hr className="my-4" />
            <h5 className="mb-3">Presentación en la portada</h5>

            <div className="mb-3 row align-items-center">
              <label className="col-sm-3 col-form-label text-end">
                Título de bienvenida
              </label>
              <div className="col-sm-9">
                <input
                  name="welcome_title"
                  type="text"
                  className="form-control"
                  placeholder="¡Bienvenido a nuestra tienda online!"
                  value={form.welcome_title}
                  onChange={handleChange}
                  maxLength={120}
                />
                <small className="text-muted">Máx. 120 caracteres.</small>
              </div>
            </div>

            <div className="mb-3 row">
              <label className="col-sm-3 col-form-label text-end">
                Subtítulo
              </label>
              <div className="col-sm-9">
                <textarea
                  name="welcome_subtitle"
                  className="form-control"
                  rows={3}
                  placeholder="Descubrí cientos de productos al mejor precio..."
                  value={form.welcome_subtitle}
                  onChange={handleChange}
                  maxLength={600}
                />
                <small className="text-muted">
                  Este texto aparece en la portada de tu tienda, debajo del título principal.
                </small>
              </div>
            </div>

            {/* Redes sociales (nuevos campos) */}
            <hr className="my-4" />
            <h5 className="mb-3">Redes sociales</h5>

            <div className="mb-3 row align-items-center">
              <label className="col-sm-3 col-form-label text-end">Instagram</label>
              <div className="col-sm-9">
                <input
                  name="instagram_url"
                  type="url"
                  className="form-control"
                  placeholder="https://www.instagram.com/tu_cuenta"
                  value={form.instagram_url}
                  onChange={handleChange}
                />
                <small className="text-muted">
                  Ej: https://instagram.com/tuusuario
                </small>
              </div>
            </div>

            <div className="mb-3 row align-items-center">
              <label className="col-sm-3 col-form-label text-end">Facebook</label>
              <div className="col-sm-9">
                <input
                  name="facebook_url"
                  type="url"
                  className="form-control"
                  placeholder="https://www.facebook.com/tu_pagina"
                  value={form.facebook_url}
                  onChange={handleChange}
                />
                <small className="text-muted">
                  Pegá la URL completa de tu FanPage.
                </small>                
              </div>
            </div>

            {/* Logo */}
            <hr className="my-4" />
            <h5 className="mb-3">Identidad</h5>

            <div className="mb-3 row align-items-center">
              <label className="col-sm-3 col-form-label text-end">Logo</label>
              <div className="col-sm-9">
                <input
                  name="logo"
                  type="file"
                  className="form-control"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleChange}
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt="Logo actual"
                      style={{ height: "60px", borderRadius: "6px" }}
                    />
                  </div>
                )}
                <small className="text-muted">
                  Subí el logo de tu tienda (opcional)
                  Se mostrará en la portada de tu tienda.
                </small>                     
              </div>
            </div>
          </fieldset>

          {/* Botón guardar con spinner y disabled cuando guarda */}
          <div className="text-end">
            <button
              type="submit"
              className="btn mt-3"
              style={{ backgroundColor: "var(--color-primario)", color: "white" }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Guardando…
                </>
              ) : (
                "Guardar cambios de la tienda"
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default MiTienda;
