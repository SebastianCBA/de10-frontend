import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "./config";
import { useNavigate, useLocation, Link } from "react-router-dom";

import "./assets/variables.css";
import logo from "/images/logo.png";
import googleIcon from "./landingAssets/images/google-icon.svg";
import { useAuth } from "./AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [correoVerificado, setCorreoVerificado] = useState(false);
  const [mensajeVisible, setMensajeVisible] = useState(true);
  const [mostrarReenvio, setMostrarReenvio] = useState(false);
  const [reenvioExitoso, setReenvioExitoso] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [reenviando, setReenviando] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setToken(token);
      navigate("/dashboard");
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("verified") === "true") {
      setCorreoVerificado(true);
      window.history.replaceState({}, document.title, location.pathname);
    }

    if (location.state?.registroExitoso) {
      setRegistroExitoso(true);
      window.history.replaceState({}, document.title, location.pathname);
    }

    if (correoVerificado || registroExitoso) {
      const timer = setTimeout(() => {
        setMensajeVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location, correoVerificado, registroExitoso]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMostrarReenvio(false);
    setReenvioExitoso(false);

    try {
      const response = await axios.post(`${config.apiBaseUrl}/login`, {
        email,
        password,
      });

      const token = response.data?.token;

      if (token) {
        setToken(token);
        navigate("/dashboard");
      } else {
        setError("No se recibió un token válido. Intenta nuevamente.");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);

        if (err.response.data.message.includes("verificar tu correo electrónico")) {
          setMostrarReenvio(true);

          if (err.response.data.token) {
            setToken(err.response.data.token);
          }
        }
      } else {
        setError("Credenciales inválidas o error en el servidor.");
      }
    }
  };

  const handleReenviarCorreo = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No se puede reenviar el correo porque no se encontró una sesión válida.");
      return;
    }

    setReenviando(true);

    try {
      await axios.post(
        `${config.apiBaseUrl}/email/verification-notification`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReenvioExitoso(true);
      setMostrarReenvio(false);
      setCooldown(60);

      setTimeout(() => {
        setReenvioExitoso(false);
      }, 3000);
    } catch (error) {
      console.error("Error al reenviar correo:", error);
      setError("No se pudo reenviar el correo. Intenta nuevamente.");
    } finally {
      setReenviando(false);
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
            Iniciar sesión con Google
          </a>

          {mensajeVisible && correoVerificado && (
            <div className="alert alert-success fade show">
              ¡Correo verificado exitosamente! Ahora podés iniciar sesión.
            </div>
          )}

          {mensajeVisible && registroExitoso && (
            <div className="alert alert-success fade show">
              ¡Cuenta creada correctamente! Revisá tu correo para validar tu cuenta.
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {mostrarReenvio && (
            <div className="alert alert-warning">
              ¿No recibiste el correo de verificación?{" "}
              <button
                onClick={handleReenviarCorreo}
                className="btn btn-sm btn-primary ms-2"
                disabled={cooldown > 0 || reenviando}
              >
                {reenviando
                  ? "Enviando..."
                  : cooldown > 0
                  ? `Reenviar (${cooldown})`
                  : "Reenviar correo"}
              </button>
            </div>
          )}

          {reenvioExitoso && (
            <div className="alert alert-success">
              ¡Correo de verificación reenviado exitosamente!
            </div>
          )}

          <form onSubmit={handleSubmit}>
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

            <button
              className="btn w-100"
              style={{
                backgroundColor: "var(--color-primario)",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Entrar
            </button>
          </form>

          <div className="mt-3 text-center">
            <a href="/registro" style={{ color: "var(--color-acento)" }}>
              ¿No tenés cuenta? Registrate
            </a>
            <br />
            <a href="/recuperar" style={{ color: "var(--color-acento)" }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
