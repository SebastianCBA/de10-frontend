import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "./config";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    // 🔥 Validación antes de enviar
    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);

    try {
      await axios.post(`${config.apiBaseUrl}/reset-password`, {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setMensaje("Tu contraseña fue restablecida exitosamente. Redirigiendo al inicio de sesión...");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al restablecer la contraseña.");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="d-flex justify-content-center pt-5 bg-light min-vh-100">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <div className="text-center mb-3">
          <img src="/images/logo.png" alt="MasOpciones" width="120" />
        </div>

        <h2 className="text-center mb-2" style={{ color: "var(--color-secundario)" }}>
          Crear nueva contraseña
        </h2>

        {/* 🔥 Mensaje explicativo */}
        <p className="text-center text-muted" style={{ fontSize: "14px" }}>
          Ingresá tu email registrado y tu nueva contraseña.
        </p>

        {mensaje && <div className="alert alert-success">{mensaje}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={enviando}
            />
          </div>

          <div className="mb-3">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={enviando}
            />
          </div>

          <div className="mb-3">
            <label>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="********"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              disabled={enviando}
            />
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "var(--color-primario)", color: "white", fontWeight: "bold" }}
            disabled={enviando}
          >
            {enviando ? "Restableciendo..." : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
