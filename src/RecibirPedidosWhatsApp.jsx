import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function RecibirPedidosWhatsApp() {
  return (
    <>
      <Helmet>
        <title>Cómo recibir pedidos por WhatsApp | de10.app</title>
        <meta
          name="description"
          content="Aprendé cómo funciona el sistema de pedidos por WhatsApp: tus clientes eligen productos en tu tienda y te envían el pedido ya armado para que puedas responder más rápido y vender de forma ordenada."
        />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "900px" }}>
        <h1 className="mb-4">Cómo recibir pedidos por WhatsApp</h1>

        <p className="mb-3">
          Una de las grandes ventajas de vender con de10.app es que tus clientes
          pueden recorrer tu tienda, elegir productos y enviarte el pedido por
          WhatsApp de forma mucho más clara y ordenada.
        </p>

        <p className="mb-4">
          En lugar de recibir mensajes sueltos o consultas desordenadas, recibís
          un pedido armado con lo que el cliente quiere comprar, y después seguís
          la conversación por WhatsApp como ya lo hacés todos los días.
        </p>

        <section className="mb-5">
          <h2 className="mb-3">1. El cliente arma su pedido en tu tienda</h2>
          <p>
            El proceso empieza cuando la persona entra a tu tienda, recorre tus
            categorías, mira productos y va agregando lo que quiere al carrito.
          </p>
          <p>
            De esta forma, no necesita escribirte desde cero para preguntarte
            uno por uno qué vendés o cuánto sale cada cosa.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">2. El pedido llega más claro y ordenado</h2>
          <p>
            Cuando el cliente termina de elegir, puede enviarte el pedido por
            WhatsApp con el detalle de los productos seleccionados.
          </p>
          <p>
            Eso te ayuda a ahorrar tiempo y a entender más rápido qué está
            buscando, sin depender de mensajes ambiguos o incompletos.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">3. Vos seguís cerrando la venta por WhatsApp</h2>
          <p>
            Después de recibir el pedido, podés responder por WhatsApp para
            confirmar stock, coordinar envío o retiro, indicar medios de pago y
            terminar de cerrar la venta.
          </p>
          <p>
            Es decir, no necesitás cambiar tu forma de atender: simplemente
            recibís mejor organizado el inicio del pedido.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">4. Es simple para vos y para tus clientes</h2>
          <p>
            Tus clientes compran de una forma más cómoda, y vos seguís usando
            WhatsApp como canal principal de atención.
          </p>
          <p>
            Esto hace que vender online sea mucho más fácil, sin obligarte a
            aprender un sistema complejo ni a cambiar la manera en que ya
            trabajás.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">5. Ideal para vender sin complicaciones</h2>
          <p>
            Este sistema es especialmente útil para negocios que prefieren
            mantener una atención cercana, responder consultas rápido y cerrar
            ventas por chat.
          </p>
          <p>
            En resumen: la tienda ordena el pedido y WhatsApp te ayuda a
            concretarlo.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Cómo recibir pedidos por WhatsApp paso a paso</h2>
          <p>
            Para recibir pedidos por WhatsApp de forma profesional necesitás un
            sistema que ordene la información antes de que el cliente te escriba.
          </p>
          <p>
            Con de10.app, el proceso es simple: el cliente selecciona productos,
            arma el carrito y envía automáticamente el detalle del pedido por
            WhatsApp, listo para que lo atiendas.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Ventajas de recibir pedidos con un catálogo digital</h2>
          <ul>
            <li>Pedidos más claros y organizados</li>
            <li>Menos tiempo respondiendo consultas</li>
            <li>Mayor conversión de clientes</li>
            <li>Mejor experiencia de compra</li>
          </ul>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Seguí aprendiendo</h2>
          <ul>
            <li>
              <Link to="/crear-cuenta-vender-por-whatsapp">
                Cómo crear tu cuenta
              </Link>
            </li>
            <li>
              <Link to="/agregar-productos">
                Cómo cargar productos en tu tienda
              </Link>
            </li>
            <li>
              <Link to="/configurar-tu-tienda">
                Cómo configurar tu tienda online
              </Link>
            </li>
          </ul>
        </section>

        <section className="p-4 bg-light border rounded-4 mb-4">
          <h2 className="h5 mb-3">Resumen rápido</h2>
          <ol className="mb-0">
            <li>El cliente entra a tu tienda y elige productos</li>
            <li>Arma el pedido sin escribir todo manualmente</li>
            <li>Te lo envía por WhatsApp de forma ordenada</li>
            <li>Vos respondés, coordinás y cerrás la venta</li>
            <li>Todo funciona de forma simple y sin complicaciones</li>
          </ol>
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