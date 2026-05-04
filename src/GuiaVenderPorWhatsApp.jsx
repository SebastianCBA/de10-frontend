import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function GuiaVenderPorWhatsApp() {
  return (
    <>
      <Helmet>
        <title>Cómo vender por WhatsApp paso a paso | Guía completa</title>
        <meta
          name="description"
          content="Aprendé cómo vender por WhatsApp paso a paso: crear tu cuenta, configurar tu tienda, agregar productos, recibir pedidos y compartir tu catálogo de forma simple."
        />
        <link
          rel="canonical"
          href="https://de10.app/guia-vender-por-whatsapp"
        />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "900px" }}>
        <h1 className="mb-4">Cómo vender por WhatsApp paso a paso</h1>

        <p className="mb-3">
          Vender por WhatsApp es una de las formas más simples de empezar a vender online.
          En esta guía te mostramos paso a paso cómo crear tu catálogo, mostrar tus productos
          y recibir pedidos de forma ordenada.
        </p>

        <p className="mb-4">
          No necesitás conocimientos técnicos. Podés empezar en minutos y usar WhatsApp
          como canal principal para cerrar ventas.
        </p>

        <h2 className="mt-5 mb-3">Pasos para empezar</h2>

        <ul className="list-group mb-5">
          <li className="list-group-item">
            <Link to="/crear-cuenta-vender-por-whatsapp">
              Crear tu cuenta
            </Link>
          </li>
          <li className="list-group-item">
            <Link to="/configurar-tu-tienda">
              Configurar tu tienda
            </Link>
          </li>
          <li className="list-group-item">
            <Link to="/agregar-productos">
              Agregar productos a tu tienda
            </Link>
          </li>
          <li className="list-group-item">
            <Link to="/mis-sucursales-guia">
              Configurar sucursales de tu negocio
            </Link>
          </li>
          <li className="list-group-item">
            <Link to="/recibir-pedidos-whatsapp">
              Recibir pedidos por WhatsApp
            </Link>
          </li>
          <li className="list-group-item">
            <Link to="/compartir-catalogo-whatsapp">
              Compartir tu tienda con clientes
            </Link>
          </li>
        </ul>

        <section className="mb-5">
          <h2 className="mb-3">Qué necesitás para vender por WhatsApp</h2>
          <p>
            Para vender por WhatsApp de forma más ordenada, necesitás una tienda
            o catálogo donde el cliente pueda ver tus productos, elegir lo que
            quiere y enviarte el pedido sin tener que escribir todo manualmente.
          </p>
          <p>
            Esa es justamente la idea de de10.app: ayudarte a mostrar tus
            productos o servicios y llevar la conversación final a WhatsApp,
            que es donde muchos negocios ya atienden todos los días.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Ventajas de vender con un catálogo online</h2>
          <ul>
            <li>Mostrás tus productos de forma clara</li>
            <li>Ahorrás tiempo respondiendo menos preguntas repetidas</li>
            <li>Recibís pedidos más organizados</li>
            <li>Podés compartir tu tienda con un solo link</li>
          </ul>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Cómo funciona de10.app</h2>
          <p>
            Primero creás tu cuenta, después configurás tu tienda, cargás tus
            productos y compartís el link con tus clientes. A partir de ahí,
            las personas pueden entrar, recorrer tu catálogo y enviarte su pedido
            por WhatsApp.
          </p>
          <p>
            No necesitás una tienda complicada ni aprender herramientas difíciles.
            La idea es que puedas empezar rápido y vender de una forma simple.
          </p>
        </section>

        <div className="p-4 bg-light border rounded-4 mb-4">
          <h3 className="h5 mb-3">¿Qué vas a lograr con esta guía?</h3>
          <p className="mb-2">✔ Tener tu catálogo online listo</p>
          <p className="mb-2">✔ Mostrar tus productos con link</p>
          <p className="mb-2">✔ Recibir pedidos organizados por WhatsApp</p>
          <p className="mb-0">✔ Empezar a vender sin complicaciones</p>
        </div>

        <section className="mb-5">
          <h2 className="mb-3">Seguí aprendiendo</h2>
          <ul>
            <li>
              <Link to="/crear-cuenta-vender-por-whatsapp">
                Cómo crear tu cuenta
              </Link>
            </li>
            <li>
              <Link to="/configurar-tu-tienda">
                Cómo configurar tu tienda
              </Link>
            </li>
            <li>
              <Link to="/agregar-productos">
                Cómo agregar productos
              </Link>
            </li>
            <li>
              <Link to="/recibir-pedidos-whatsapp">
                Cómo recibir pedidos por WhatsApp
              </Link>
            </li>
          </ul>
        </section>

        <div className="d-flex flex-wrap gap-3">
          <Link to="/registro" className="btn btn-primary btn-lg">
            Crear mi cuenta ahora
          </Link>
          <Link to="/guia-vender-por-whatsapp" className="btn btn-primary btn-lg">
            Volver a la guía completa
          </Link>
        </div>
      </div>
    </>
  );
}