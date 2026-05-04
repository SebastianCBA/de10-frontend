import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function VenderPorInternetSinPaginaWeb() {
  return (
    <>
      <Helmet>
        <title>Vender por internet sin página web | de10.app</title>
        <meta
          name="description"
          content="Aprendé cómo vender por internet sin página web usando un catálogo online y pedidos por WhatsApp. Simple, rápido y sin comisiones."
        />
        <link
          rel="canonical"
          href="https://de10.app/vender-por-internet-sin-pagina-web"
        />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "800px" }}>
        <h1 className="mb-4">
          Cómo vender por internet sin{" "}
          <span className="text-primary">página web</span>
        </h1>

        <p className="mb-3">
          Si querés vender online pero no querés complicarte con una página web
          tradicional, hay una forma mucho más simple: usar un catálogo online y
          recibir pedidos por WhatsApp.
        </p>

        <p className="mb-3">
          Así tus clientes pueden ver lo que vendés, elegir productos y mandarte
          el pedido listo, sin que vos tengas que desarrollar una web compleja.
        </p>

        <h2 className="mt-4">Una opción más simple para empezar</h2>
        <p className="mb-3">
          Con de10.app podés crear una tienda simple, mostrar tus productos o
          servicios y compartir tu link por WhatsApp, Instagram o donde quieras.
        </p>

        <h2 className="mt-4">Ventajas de vender sin una web tradicional</h2>
        <ul>
          <li>Empezás más rápido</li>
          <li>No necesitás conocimientos técnicos</li>
          <li>Recibís pedidos por WhatsApp</li>
          <li>Podés compartir tu catálogo con un solo link</li>
        </ul>

        <h2 className="mt-4">Ideal para</h2>
        <ul>
          <li>Despensas y almacenes</li>
          <li>Kioscos</li>
          <li>Emprendedores</li>
          <li>Servicios y profesionales</li>
        </ul>

        <div className="mt-4">
          <Link to="/registro" className="btn btn-primary btn-lg">
            Crear mi catálogo ahora!
          </Link>
        </div>

        <p className="mt-4 text-muted">
          También podés ver cómo{" "}
          <Link to="/vender-por-whatsapp">vender por WhatsApp</Link>, crear un{" "}
          <Link to="/catalogo-digital">catálogo digital</Link> o una{" "}
          <Link to="/tienda-online-ahora">tienda online ahora</Link>.
        </p>
      </div>
    </>
  );
}