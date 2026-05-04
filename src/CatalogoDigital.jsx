import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function CatalogoDigital() {
  return (
    <>
      <Helmet>
        <title>Catálogo digital para negocios | De10</title>
        <meta
          name="description"
          content="Creá un catálogo digital para tu negocio y vendé por WhatsApp de forma simple. Mostrá tus productos, precios y recibí pedidos online."
        />
      </Helmet>

      <div className="container py-5">
        <h1 className="mb-4">
          Catálogo digital para negocios: vendé más sin complicarte
        </h1>

        <p>
          Tener un catálogo digital para tu negocio es la forma más rápida de
          mostrar tus productos y empezar a vender online sin necesidad de una
          tienda compleja.
        </p>

        <h2 className="mt-4">¿Qué es un catálogo digital?</h2>
        <p>
          Es una página donde tus clientes pueden ver tus productos, precios y
          hacer pedidos directamente, generalmente a través de WhatsApp.
        </p>

        <h2 className="mt-4">Ventajas de un catálogo digital</h2>
        <ul>
          <li>No necesitás conocimientos técnicos</li>
          <li>Se puede usar desde el celular</li>
          <li>Permite vender 24/7</li>
          <li>Se integra con WhatsApp fácilmente</li>
        </ul>

        <h2 className="mt-4">¿Cómo crear un catálogo digital?</h2>
        <p>
          Con herramientas como De10 podés crear tu catálogo en minutos, cargar
          tus productos y compartir el link con tus clientes.
        </p>

        <div className="mt-5">
          <Link to="/registro" className="btn btn-primary">
            Crear mi catálogo ahora
          </Link>
        </div>
        <p>
        Catálogo digital para negocios en Argentina, ideal para vender por WhatsApp de forma simple y rápida.
        </p>
        <div className="mt-4">
          <Link to="/vender-por-whatsapp">
            Cómo vender por WhatsApp paso a paso
          </Link>
        </div>
      </div>
    </>
  );
}