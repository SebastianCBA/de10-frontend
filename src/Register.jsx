import React, { useState } from "react";
import axios from "axios";
import config from "./config";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import googleIcon from './landingAssets/images/google-icon.svg';
import logo from "/images/logo.png";

function Register() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${config.apiBaseUrl}/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role: "pantry_owner",
      });
      navigate("/login", { state: { registroExitoso: true } });
    } catch (err) {
      if (err.response?.data?.errors) {
        const errores = Object.values(err.response.data.errors).flat();
        setError(errores.join(" | "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error inesperado al registrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="contenedor-login">
        <div className="card shadow p-4 border rounded" style={{ width: "400px" }}>
          <div className="text-center mb-3">
            <Link to="/">
              <img src={logo} alt="de10" width="120" style={{ cursor: "pointer" }} />
            </Link>
          </div>

          <a
            href={`${import.meta.env.VITE_API_URL}/auth/google/redirect`}
            className="btn-google mb-3"
          >
            <img
              src={googleIcon}
              alt="Google"
              className="me-2"
              style={{ width: "20px" }}
            />
            Registrarse con Google
          </a>

          <button
            className={`btn w-100 d-flex justify-content-center align-items-center ${mostrarFormulario ? 'active-email' : ''}`}
            style={{
              backgroundColor: "var(--color-primario)",
              color: "white",
              fontWeight: "bold",
            }}
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <FaEnvelope className="me-2" />
            Registrarse con tu email
          </button>

          <div
            className={`registro-formulario mt-2 ${mostrarFormulario ? "mostrar" : ""}`}
          >
            {error && <div className="alert alert-danger mt-3">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-3">
              <div className="mb-3">
                <label>Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="********"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn w-100 d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: "var(--color-primario)",
                  color: "white",
                  fontWeight: "bold",
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Registrando...
                  </>
                ) : (
                  "Continuar"
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 text-center">
            <a href="/login" style={{ color: "var(--color-acento)" }}>
              ¿Ya tenés cuenta? Iniciá sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
