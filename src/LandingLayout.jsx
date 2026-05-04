import { Link } from "react-scroll";
import logo from "/images/logo.png";
import "./assets/variables.css";

export default function LandingLayout({ children }) {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white shadow-sm fixed-top">
        <div className="container">
          <a className="navbar-brand fw-bold d-flex align-items-center" href="/">
            <img src={logo} alt="de10.app"  height="32" className="me-2" />
            <span style={{ color: "var(--color-secundario)" }}>de10.app</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="nav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-lg-3">
              {["Ventajas", "Cómo funciona", "Precios", "Contacto"].map(sec => (
                <li className="nav-item" key={sec}>
                  <Link
                    className="nav-link text-dark"
                    activeClass="fw-bold text-decoration-underline"
                    smooth spy offset={-72} duration={400}
                    to={sec.toLowerCase().replaceAll(" ", "-")}
                  >
                    {sec}
                  </Link>
                </li>
              ))}
              <li className="nav-item">
                <a href="/login" className="btn btn-primary ms-lg-2">
                  Iniciar sesión
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main style={{ scrollSnapType: "y mandatory" }}>{children}</main>
    </>
  );
}
