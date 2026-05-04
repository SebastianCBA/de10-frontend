import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import config from "./config";
import { useNavigate } from "react-router-dom";

// props
function ConfigurarSubdominio({ tienda, setTienda }) {

  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [disponible, setDisponible] = useState(false);

  const controllerRef = useRef(null);
  const navigate = useNavigate();

  const reservados = ["www", "admin", "mail", "ftp", "api", "test", "app", "de10", "root"];

  useEffect(() => {
    setError("");
    setDisponible(false);

    if (!subdomain) return;

    if (subdomain.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    if (subdomain.length > 25) {
      setError("El nombre no puede tener más de 25 caracteres.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      setError("Solo se permiten minúsculas, números y guiones.");
      return;
    }

    if (reservados.includes(subdomain)) {
      setError("Ese nombre está reservado. Por favor elegí otro.");
      return;
    }

    const delay = setTimeout(async () => {
      if (controllerRef.current) controllerRef.current.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      setChecking(true);
      try {
        await axios.get(`${config.apiBaseUrl}/my-pantry/verificar-subdominio/${subdomain}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          signal: controller.signal,
        });

        setError("");
        setDisponible(true);
      } catch (err) {
        if (err.name === "CanceledError") return;
        setDisponible(false);
        if (err.response?.status === 409 || err.response?.status === 422) {
          setError(err.response.data?.error || "Subdominio no disponible");
        } else {
          setError("No se pudo verificar la disponibilidad.");
        }
      } finally {
        setChecking(false);
      }
    }, 600);

    return () => clearTimeout(delay);
  }, [subdomain]);

  const guardarSubdominio = async () => {
    if (!subdomain) {
      setError("Debes ingresar un nombre para tu tienda.");
      return;
    }

    if (error) return;

    setLoading(true);
    try {
      await axios.put(
        `${config.apiBaseUrl}/my-pantry/subdomain`,
        { subdomain },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setError("");
      setSuccess(true);
      setTienda(prev => ({ ...prev, subdomain }));
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Ocurrió un error al guardar.");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="card mx-auto mt-5" style={{ maxWidth: "600px" }}>
      <div className="card-body">
        <h3 className="card-title text-center mb-3">
          🧩 Último paso antes de activar tu tienda
        </h3>
        <p className="text-muted text-center mb-4">
          Elegí un nombre único para tu tienda. Este será parte de la dirección web que compartirás.
          <br />
          <strong>Ejemplo:</strong>{" "}
          <code className={checking ? "text-muted" : disponible ? "text-success" : subdomain ? "text-danger" : ""}>
            {subdomain || "tutienda"}.de10.app
          </code>
        </p>

        <div className="form-group">
          <label>Nombre de tu tienda (subdominio)</label>
          <input
            type="text"
            className={`form-control 
              ${checking ? "border border-warning" : ""}
              ${error ? "is-invalid" : disponible ? "is-valid" : ""}
            `}
            placeholder="ej: minombre"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
            disabled={success}
          />
          {checking && (
            <small className="text-muted">
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Verificando disponibilidad...
            </small>
          )}
          {!checking && error && (
            <small className="text-danger">{error}</small>
          )}
          {!checking && !error && disponible && (
            <small className="text-success">✅ Dominio disponible</small>
          )}
        </div>

        {success && (
          <div className="alert alert-success mt-3">
            ¡Nombre guardado correctamente!
          </div>
        )}

        {!success ? (
          <button
            className="btn mt-4 w-100"
            style={{ backgroundColor: "#ff6c00", color: "#fff" }}
            onClick={guardarSubdominio}
            disabled={!!error || loading || checking}
          >
            {loading ? "Guardando..." : "Activar tienda"}
          </button>
        ) : (
          <button
            className="btn btn-success mt-4 w-100"
            onClick={() => navigate("/dashboard")}
          >
            Ir al panel
          </button>
        )}
      </div>
    </div>
  );
}

export default ConfigurarSubdominio;
