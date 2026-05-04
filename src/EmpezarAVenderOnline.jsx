import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function EmpezarAVenderOnline() {
  return (
    <>
      <Helmet>
        <title>Cómo empezar a vender online (guía simple) | de10.app</title>
        <meta
          name="description"
          content="Aprendé cómo empezar a vender online paso a paso, sin conocimientos técnicos. Ideal para emprendedores que quieren vender por WhatsApp."
        />
        <link
          rel="canonical"
          href="https://de10.app/empezar-a-vender-online"
        />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "800px" }}>
        <h1 className="mb-4">
          Cómo empezar a vender online (sin complicarte)
        </h1>

        <p className="mb-3">
          Si querés empezar a vender online pero no sabés por dónde arrancar,
          esta guía te lo explica paso a paso de forma simple.
        </p>

        <h2 className="mt-4">1. Definí qué vas a vender</h2>
        <p>
          Puede ser productos físicos, servicios o incluso ventas por catálogo.
          Lo importante es empezar con algo concreto.
        </p>

        <h2 className="mt-4">2. Mostrá tus productos</h2>
        <p>
          Hoy no necesitás una web compleja. Podés usar un catálogo digital
          simple donde tus clientes vean lo que ofrecés.
        </p>

        <h2 className="mt-4">3. Usá WhatsApp para vender</h2>
        <p>
          Es el canal más fácil para empezar. Tus clientes ven el producto y te
          mandan el pedido directamente.
        </p>

        <h2 className="mt-4">4. Compartí tu link</h2>
        <p>
          Podés enviar tu catálogo por WhatsApp, Instagram o donde quieras.
        </p>

        <h2 className="mt-4">¿Qué necesitás para empezar?</h2>
        <ul>
          <li>Un catálogo online</li>
          <li>Un link para compartir</li>
          <li>Un canal de contacto (WhatsApp)</li>
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
          <Link to="/tienda-online-ahora">tienda online</Link>.
        </p>
      </div>
    </>
  );
}