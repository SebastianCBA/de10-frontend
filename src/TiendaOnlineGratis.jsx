import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function TiendaOnlineGratis() {
  return (
    <>
      <Helmet>
        <title>Tienda online | Creá tu tienda en minutos</title>
        <meta
          name="description"
          content="Creá una tienda online en minutos. Mostrá tus productos, compartí tu link y vendé por WhatsApp sin comisiones."
        />
        <link rel="canonical" href="https://de10.app/tienda-online-ahora" />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "800px" }}>
        <h1 className="mb-4">
          Crear una <span className="text-primary">tienda online</span> nunca fue tan fácil
        </h1>

        <p className="mb-3">
          Con de10.app podés crear tu tienda online en minutos, sin conocimientos técnicos y sin pagar comisiones.
        </p>

        <p className="mb-3">
          Cargá tus productos, compartí tu link y empezá a vender por WhatsApp de forma simple y rápida.
        </p>

        <h2 className="mt-4">¿Cómo funciona?</h2>

        <ul>
          <li>Creás tu catálogo en minutos</li>
          <li>Compartís tu tienda con un link</li>
          <li>Recibís pedidos por WhatsApp</li>
        </ul>

        <h2 className="mt-4">Ideal para:</h2>

        <ul>
          <li>Despensas y almacenes</li>
          <li>Emprendedores</li>
          <li>Servicios</li>
          <li>Venta por catálogo</li>
        </ul>

        <div className="mt-4">
          <Link to="/registro" className="btn btn-primary btn-lg">
            Crear mi tienda ahora!
          </Link>
        </div>

        <p className="mt-4 text-muted">
          También podés aprender a{" "}
          <Link to="/vender-por-whatsapp">
            vender por WhatsApp
          </Link>{" "}
          o{" "}
          <Link to="/catalogo-digital">
            crear un catálogo digital
          </Link>.
        </p>
      </div>
    </>
  );
}