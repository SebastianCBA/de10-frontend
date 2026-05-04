import React, { useState } from "react";
import axios from "axios";
import config from "./config";
import { Link } from "react-router-dom";
import logo from "/images/logo.png";
//import "./App.css";

function Recuperar() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false); // 🔥 nuevo estado

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setEnviando(true); // 🔥 bloquear botón

    try {
      await axios.post(`${config.apiBaseUrl}/forgot-password`, { email });
      setMensaje("Te enviamos un correo con el enlace para restablecer tu contraseña.");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Ocurrió un error. Verificá el correo ingresado.");
      }
    } finally {
      setEnviando(false); // 🔥 desbloquear botón
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="contenedor-login">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <div className="text-center mb-3">
            <Link to="/">
              <img src={logo} alt="de10" width="120" style={{ cursor: "pointer" }} />
            </Link>
        </div>

        {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label>Ingresá tu Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "var(--color-primario)", color: "white", fontWeight: "bold" }}
            disabled={enviando} // 🔥 importante: desactivar mientras está enviando
          >
            {enviando ? "Enviando..." : "Enviar enlace"} {/* 🔥 cambia el texto */}
          </button>
        </form>

        <div className="mt-3 text-center">
          <a href="/login" style={{ color: "var(--color-acento)" }}>
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
   </div>  
  );
}

export default Recuperar;
